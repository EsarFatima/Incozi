const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

// Supabase-driven auth routes
module.exports = (supabase) => {

  // LOGIN ROUTE
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

      // 1. Find User
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Login fetch error:', error);
        return res.status(500).json({ error: 'Server error' });
      }

      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      // 2. Compare Password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

      // 3. Create Token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, is_verified: user.is_verified },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified
        }
      });

    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // SIGNUP ROUTE
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // 1. Check if user exists
      const { data: existing, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingError) {
        console.error('Signup check error:', existingError);
        return res.status(500).json({ error: 'Server error' });
      }

      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // 2. Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Generate Verification Token
      const token = crypto.randomBytes(32).toString('hex');

      // 4. Insert User
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          email, 
          password_hash: hashedPassword, 
          full_name: full_name || null, 
          verification_token: token, 
          is_verified: false,
          role: 'user'
        }]);

      if (insertError) {
        console.error('Signup insert error:', insertError);
        return res.status(500).json({ error: insertError.message || 'Internal server error' });
      }

      // 5. Send Email
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      const verificationLink = `${baseUrl}/api/auth/verify?token=${token}`;

      await emailService.sendVerificationEmail(email, verificationLink);

      res.status(201).json({ 
        message: 'Registration successful. Please check your email to verify your account.' 
      });

    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // VERIFY ROUTE
  router.get('/verify', async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).send('<h1>Invalid Verification Link</h1>');
      }

      // 1. Find user with token
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('verification_token', token)
        .maybeSingle();

      if (error) {
        console.error('Verify lookup error:', error);
        return res.status(500).send('<h1>Server Error during verification</h1>');
      }

      if (!user) {
        return res.status(400).send('<h1>Invalid or Expired Verification Link</h1>');
      }

      const userId = user.id;

      // 2. Update user status
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_verified: true, verification_token: null })
        .eq('id', userId);

      if (updateError) {
        console.error('Verify update error:', updateError);
        return res.status(500).send('<h1>Server Error during verification</h1>');
      }

      res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: green;">Email Verified Successfully!</h1>
          <p>Your account has been activated.</p>
          <a href="/" style="text-decoration: none; background: #4338ca; color: white; padding: 10px 20px; border-radius: 5px;">Go to Home</a>
        </div>
      `);

    } catch (error) {
      console.error('Verify Error:', error);
      res.status(500).send('<h1>Server Error during verification</h1>');
    }
  });

  // FORGOT PASSWORD ROUTE
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      // 1. Check if user exists
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Forgot lookup error:', error);
        return res.status(500).json({ error: 'Server error' });
      }

      if (!user) {
        return res.status(200).json({ message: 'If that email exists, we have sent a reset link.' });
      }


      // 2. Generate Token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      // 3. Save to DB
      const { error: updateError } = await supabase
        .from('users')
        .update({ reset_token: token, reset_token_expires: expires.toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Forgot update error:', updateError);
        return res.status(500).json({ error: 'Server error' });
      }

      // 4. Send Email
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      const resetLink = `${baseUrl}/pages/reset-password.html?token=${token}`;
      
      await emailService.sendPasswordResetEmail(email, resetLink);

      res.json({ message: 'If that email exists, we have sent a reset link.' });

    } catch (error) {
      console.error('Forgot Password Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // RESET PASSWORD ROUTE
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ error: 'Token and password required' });

      // 1. Validate Token
      const nowIso = new Date().toISOString();
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('reset_token', token)
        .gt('reset_token_expires', nowIso)
        .maybeSingle();

      if (error) {
        console.error('Reset lookup error:', error);
        return res.status(500).json({ error: 'Server error' });
      }

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      // 2. Hash New Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Update User
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword, reset_token: null, reset_token_expires: null })
        .eq('id', user.id);

      if (updateError) {
        console.error('Reset update error:', updateError);
        return res.status(500).json({ error: 'Server error' });
      }

      res.json({ message: 'Password has been reset successfully.' });

    } catch (error) {
      console.error('Reset Password Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  /* -------------------------------------------------------------------------- */
  /*                             RESOLVED CONFLICTS                             */
  /* -------------------------------------------------------------------------- */

  // GET USER PROFILE
  router.get('/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, full_name, email, phone, company_name, address, city, state, zip, country, email_notifications')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json(user);
    } catch (error) {
      console.error('Get Profile Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // UPDATE USER PROFILE
  router.put('/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { full_name, phone, company_name, address, city, state, zip, country } = req.body;

      const { error } = await supabase
        .from('users')
        .update({ 
          full_name, 
          phone, 
          company_name, 
          address, 
          city, 
          state, 
          zip, 
          country 
        })
        .eq('id', userId);

      if (error) throw error;

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update Profile Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // CHANGE PASSWORD (Authenticated)
  router.post('/change-password', async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // 1. Get current password hash
      const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!user) return res.status(404).json({ error: 'User not found' });

      // 2. Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // 3. Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 4. Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', userId);

      if (updateError) throw updateError;

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change Password Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // UPDATE EMAIL PREFERENCES
  router.put('/email-preferences/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { email_notifications } = req.body;

      const { error } = await supabase
        .from('users')
        .update({ email_notifications })
        .eq('id', userId);

      if (error) throw error;

      res.json({ message: 'Email preferences updated successfully' });
    } catch (error) {
      console.error('Update Email Preferences Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET USER SERVICES ROUTE (With JWT)
  router.get('/user-services', async (req, res) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
      }

      const token = authHeader.substring(7);

      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      } catch (error) {
        console.error('JWT verification failed:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const userId = decoded.id;

      // Fetch user's subscriptions with plan details
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          start_date,
          end_date,
          plan:plan_id (
            id,
            name,
            price,
            billing_cycle,
            service:service_id (
              id,
              name,
              description
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Subscriptions fetch error:', error);
        return res.status(500).json({ error: 'Server error' });
      }

      // Format services for frontend
      const services = (subscriptions || []).map(sub => ({
        id: sub.id,
        name: sub.plan?.service?.name || sub.plan?.name || 'Service',
        price: sub.plan?.price || 0,
        status: sub.status || 'active',
        billing_period: sub.plan?.billing_cycle || 'one_time',
        description: sub.plan?.service?.description || '',
        start_date: sub.start_date,
        end_date: sub.end_date
      }));

      res.json({ services });

    } catch (error) {
      console.error('User Services Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // TEST: Create test subscription
  router.post('/test-subscription', async (req, res) => {
    try {
      const { userId, planId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      let plan_id = planId;

      if (!plan_id) {
        const { data: testPlan, error: planError } = await supabase
          .from('plans')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (planError || !testPlan) {
          const { data: service, error: serviceError } = await supabase
            .from('services')
            .insert([{ name: 'Test Service', description: 'Test service for development' }])
            .select('id')
            .maybeSingle();

          if (serviceError || !service) {
            return res.status(500).json({ error: 'Failed to create test data' });
          }

          const { data: newPlan, error: newPlanError } = await supabase
            .from('plans')
            .insert([{ 
              service_id: service.id, 
              name: 'Test Plan', 
              price: 99.99, 
              billing_cycle: 'monthly' 
            }])
            .select('id')
            .maybeSingle();

          if (newPlanError || !newPlan) {
            return res.status(500).json({ error: 'Failed to create test plan' });
          }

          plan_id = newPlan.id;
        } else {
          plan_id = testPlan.id;
        }
      }

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userId,
          plan_id: plan_id,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0]
        }])
        .select('id')
        .maybeSingle();

      if (subError) {
        console.error('Test subscription creation error:', subError);
        return res.status(500).json({ error: 'Failed to create test subscription' });
      }

      res.status(201).json({ 
        message: 'Test subscription created successfully',
        subscription_id: subscription.id
      });

    } catch (error) {
      console.error('Test Subscription Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET USER DOCUMENTS
  router.get('/user-documents', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
      }

      const token = authHeader.substring(7);
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const userId = decoded.id;

      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Documents fetch error:', error);
        return res.status(500).json({ error: 'Server error' });
      }

      const formattedDocs = (documents || []).map(doc => ({
        id: doc.id,
        name: doc.document_type || 'Document',
        type: doc.document_type || 'Document',
        file_path: doc.file_path,
        uploaded_at: doc.uploaded_at
      }));

      res.json({ documents: formattedDocs });

    } catch (error) {
      console.error('User Documents Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET USER BILLING HISTORY
  router.get('/user-billing', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
      }

      const token = authHeader.substring(7);
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const userId = decoded.id;

      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Payments fetch error:', error);
        return res.status(500).json({ error: 'Server error' });
      }

      const formattedPayments = (payments || []).map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        description: `Payment for service`,
        status: payment.payment_status,
        created_at: payment.created_at
      }));

      res.json({ payments: formattedPayments });

    } catch (error) {
      console.error('User Billing Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // CANCEL SERVICE
  router.post('/cancel-service', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
      }

      const token = authHeader.substring(7);
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const userId = decoded.id;
      const { subscriptionId } = req.body;

      if (!subscriptionId) {
        return res.status(400).json({ error: 'subscriptionId is required' });
      }

      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('id', subscriptionId)
        .maybeSingle();

      if (fetchError || !subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      if (subscription.user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', end_date: new Date().toISOString().split('T')[0] })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error('Cancel subscription error:', updateError);
        return res.status(500).json({ error: 'Failed to cancel service' });
      }

      res.json({ message: 'Service cancelled successfully' });

    } catch (error) {
      console.error('Cancel Service Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};

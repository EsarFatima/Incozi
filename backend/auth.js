const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./emailService');

// We need the pool to execute queries. 
// Ideally, the pool should be exported from a central DB config file.
// For now, receiving it as a parameter or creating a new connection instance if we want to keep it isolated.
// To keep it clean and use the same pool, let's wrap this in a function that accepts the pool.

module.exports = (pool) => {

  // SIGNUP ROUTE
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // 1. Check if user exists
      const checkQuery = 'SELECT id FROM users WHERE email = ?';
      const [existing] = await pool.promise().query(checkQuery, [email]);
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // 2. Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Generate Verification Token
      const token = crypto.randomBytes(32).toString('hex');

      // 4. Insert User
      const insertQuery = `
        INSERT INTO users (email, password_hash, full_name, verification_token, is_verified)
        VALUES (?, ?, ?, ?, 0)
      `;
      
      await pool.promise().query(insertQuery, [email, hashedPassword, full_name || null, token]);

      // 5. Send Email
      // Construct verification link. 
      // Assuming server runs on the host defined in .env or localhost:3000
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
      const findQuery = 'SELECT id FROM users WHERE verification_token = ?';
      const [users] = await pool.promise().query(findQuery, [token]);

      if (users.length === 0) {
        return res.status(400).send('<h1>Invalid or Expired Verification Link</h1>');
      }

      const userId = users[0].id;

      // 2. Update user status
      const updateQuery = 'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?';
      await pool.promise().query(updateQuery, [userId]);

      // 3. Response
      // You can redirect to a frontend login page here: res.redirect('/login.html?verified=true');
      // For now, sending a simple success HTML page.
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

  return router;
};

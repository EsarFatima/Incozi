const express = require('express');
const router = express.Router();
const paymentService = require('./paymentService');
const emailService = require('./emailService');

// Supabase-backed payments routes
module.exports = (supabase) => {

  // PROCESS PAYMENT ROUTE
  // Endpoint: POST /api/payments/checkout
  router.post('/checkout', async (req, res) => {
    
    // 1. Validate Input
    const { userId, planId, amount, currency, paymentMethod } = req.body;
    
    // In a real app, you should fetch 'amount' from the database using 'planId' 
    // to prevent users from manipulating the price on the frontend.
    if (!userId || !planId || !amount) {
      return res.status(400).json({ error: 'Missing required checkout details.' });
    }

    try {
      // 2. Fetch User & Plan Details (to ensure validity)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('full_name,email')
        .eq('id', userId)
        .maybeSingle();

      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('name')
        .eq('id', planId)
        .maybeSingle();

      if (userError || planError) {
        throw userError || planError;
      }

      if (!user || !plan) {
        throw new Error('Invalid User or Plan ID');
      }

      // 3. Create 'Pending' Subscription/Order in DB
      const { data: subInsert, error: subError } = await supabase
        .from('subscriptions')
        .insert([{ user_id: userId, plan_id: planId, status: 'pending', start_date: new Date().toISOString() }])
        .select('id')
        .maybeSingle();

      if (subError) throw subError;

      const subscriptionId = subInsert.id;

      // 4. Call Payment Gateway (The Adapter)
      const paymentResult = await paymentService.processPayment(
        amount, 
        currency || 'USD', 
        { email: user.email, name: user.full_name }, 
        paymentMethod // Token or card details from frontend
      );

      // 5. Handle Result
      if (paymentResult.success) {
        // A) Update Subscription to Active
        const { error: subUpdateError } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', subscriptionId);

        if (subUpdateError) throw subUpdateError;

        // B) Record Payment
        const { error: payError } = await supabase
          .from('payments')
          .insert([{ 
            user_id: userId,
            subscription_id: subscriptionId,
            amount,
            currency: currency || 'USD',
            payment_provider: paymentService.PROVIDER_NAME,
            transaction_id: paymentResult.transactionId,
            payment_status: 'success'
          }]);

        if (payError) throw payError;

        // C) Send Confirmation Email (Async, don't block response)
        const orderDetails = {
           planName: plan.name,
           amount: amount,
           currency: currency || 'USD',
           transactionId: paymentResult.transactionId,
           customerName: user.full_name,
           customerEmail: user.email
        };
        emailService.sendPurchaseConfirmation(user.email, orderDetails);
        emailService.sendNewOrderNotificationToAdmin(orderDetails);

        return res.status(200).json({ 
          success: true, 
          message: 'Payment successful', 
          transactionId: paymentResult.transactionId 
        });

      } else {
        // Payment Failed
        const { error: cancelError } = await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscriptionId);

        if (cancelError) throw cancelError;

        const { error: payError } = await supabase
          .from('payments')
          .insert([{ 
            user_id: userId,
            subscription_id: subscriptionId,
            amount,
            currency: currency || 'USD',
            payment_provider: paymentService.PROVIDER_NAME,
            payment_status: 'failed'
          }]);

        if (payError) throw payError;

        return res.status(402).json({ 
          success: false, 
          error: 'Payment declined', 
          details: paymentResult.error 
        });
      }

    } catch (error) {
      console.error('Checkout Error:', error);
      res.status(500).json({ error: 'Transaction failed' });
    }
  });

  return router;
};

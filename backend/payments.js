const express = require('express');
const router = express.Router();
const paymentService = require('./paymentService');
const emailService = require('./emailService');

// Middleware to ensure user is authenticated (Optional but recommended)
// const { authenticateToken } = require('./auth'); 

module.exports = (pool) => {

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

    let connection;
    try {
      // Get a connection for transaction support
      connection = await pool.promise().getConnection();
      await connection.beginTransaction();

      // 2. Fetch User & Plan Details (to ensure validity)
      const [users] = await connection.query('SELECT full_name, email FROM users WHERE id = ?', [userId]);
      const [plans] = await connection.query('SELECT name FROM plans WHERE id = ?', [planId]);

      if (users.length === 0 || plans.length === 0) {
        throw new Error('Invalid User or Plan ID');
      }
      const user = users[0];
      const plan = plans[0];

      // 3. Create 'Pending' Subscription/Order in DB
      const [subResult] = await connection.query(`
        INSERT INTO subscriptions (user_id, plan_id, status, start_date)
        VALUES (?, ?, 'pending', CURDATE())
      `, [userId, planId]);
      
      const subscriptionId = subResult.insertId;

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
        await connection.query(
          'UPDATE subscriptions SET status = ? WHERE id = ?', 
          ['active', subscriptionId]
        );

        // B) Record Payment
        await connection.query(`
          INSERT INTO payments 
          (user_id, subscription_id, amount, currency, payment_provider, transaction_id, payment_status)
          VALUES (?, ?, ?, ?, ?, ?, 'success')
        `, [userId, subscriptionId, amount, currency || 'USD', paymentService.PROVIDER_NAME, paymentResult.transactionId]);

        await connection.commit();

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
        await connection.query(
            'UPDATE subscriptions SET status = ? WHERE id = ?', 
            ['cancelled', subscriptionId]
        );
        
        await connection.query(`
            INSERT INTO payments 
            (user_id, subscription_id, amount, currency, payment_provider, payment_status)
            VALUES (?, ?, ?, ?, ?, 'failed')
        `, [userId, subscriptionId, amount, currency || 'USD', paymentService.PROVIDER_NAME]);

        await connection.commit(); // Commit the failed record request

        return res.status(402).json({ 
          success: false, 
          error: 'Payment declined', 
          details: paymentResult.error 
        });
      }

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Checkout Error:', error);
      res.status(500).json({ error: 'Transaction failed' });
    } finally {
      if (connection) connection.release();
    }
  });

  return router;
};

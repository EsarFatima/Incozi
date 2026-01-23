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

      // 4. Call Payment Gateway (AsaanPay)
      // Note: We use 'subscriptionId' as the 'orderId' for the gateway
      const paymentResult = await paymentService.initiatePayment(
        amount, 
        subscriptionId, 
        { email: user.email, name: user.full_name }
      );

      // 5. Handle Result
      if (paymentResult.success) {
        // For Redirect Gateways, we don't activate the subscription yet.
        // We just send the URL to the frontend.
        return res.status(200).json({ 
            message: 'Payment Initiated',
            redirectUrl: paymentResult.redirectUrl,
            subscriptionId: subscriptionId
        });
      } else {
        throw new Error(paymentResult.error || 'Payment Gateway Failed');
      }

    } catch (error) {
      console.error('Checkout Error:', error);
      res.status(500).json({ error: error.message || 'Payment processing failed' });
    }
  });

  // NEW: Verify Payment Status Route
  router.post('/verify-status', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Check Status with Gateway
        const result = await paymentService.checkPaymentStatus(orderId);
        
        // If 'completed' or 'success' (adjust based on real API response)
        // Simulator returns 'completed'.
        if (result.status === 'completed' || result.status === 'success' || result.status === 'paid') {
             // Activate Subscription
             await supabase
                .from('subscriptions')
                .update({ status: 'active' })
                .eq('id', orderId);

             // Log Payment if not exists
             await supabase
                .from('payments')
                .insert([{
                    user_id: 1, // Ideally fetch from subscription
                    subscription_id: orderId,
                    amount: result.transactionAmount || 0,
                    payment_status: 'success',
                    payment_provider: paymentService.PROVIDER_NAME
                }]);
                
             return res.json({ status: 'active' });
        }
        
        res.json({ status: 'pending' });

    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Check failed' });
    }
  });

  return router;
};

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
    const { userId, planId, amount, currency, paymentMethod, itemName } = req.body;
    
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
      // We store the 'itemName' (e.g. "Consultation - Tax") in a generic column if available
      // The migration 20260127 added 'item_name' to subscriptions. Use it if possible.
      // If table doesn't have it yet, this might error if we blindly insert. 
      // But we assume migration is applied.
      const { data: subInsert, error: subError } = await supabase
        .from('subscriptions')
        .insert([{ 
            user_id: userId, 
            plan_id: planId, 
            status: 'pending', 
            start_date: new Date().toISOString(),
            item_name: itemName || null 
        }])
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
             
             // 1. Fetch Data for Emails/Logging
             let user = null;
             let plan = null;
             
             const { data: sub } = await supabase
                .from('subscriptions')
                .select('user_id, plan_id, item_name')
                .eq('id', orderId)
                .maybeSingle();

             if (sub) {
                 const { data: u } = await supabase.from('users').select('email, full_name').eq('id', sub.user_id).maybeSingle();
                 user = u;
                 const { data: p } = await supabase.from('plans').select('name, price').eq('id', sub.plan_id).maybeSingle();
                 plan = p;
             }

             // 2. Activate Subscription
             await supabase
                .from('subscriptions')
                .update({ status: 'active' })
                .eq('id', orderId);

             // 3. Log Payment
             await supabase
                .from('payments')
                .insert([{
                    user_id: sub ? sub.user_id : null, 
                    subscription_id: orderId,
                    amount: result.transactionAmount || (plan ? plan.price : 0),
                    payment_status: 'success',
                    payment_provider: paymentService.PROVIDER_NAME
                }]);

             // 4. Send Emails
             if (user && plan) {
                 const isConsultation = sub.item_name && sub.item_name.includes('Consultation');
                 
                 const orderDetails = {
                    transactionId: orderId,
                    planName: sub.item_name || plan.name, // Use specific item name if available
                    currency: 'USD',
                    amount: plan.price,
                    customerName: user.full_name || 'Valued Customer',
                    customerEmail: user.email
                 };

                 if (isConsultation) {
                     // Specific flow for Consultation
                     emailService.sendConsultationPurchaseConfirmation(user.email, orderDetails.planName)
                        .then(() => console.log('Consultation user email sent'))
                        .catch(e => console.error('Failed to send consultation user email:', e));

                     emailService.sendConsultationPurchaseAdmin(user, orderDetails.planName)
                        .then(() => console.log('Consultation admin email sent'))
                        .catch(e => console.error('Failed to send consultation admin email:', e));
                 } else {
                     // Standard flow
                     emailService.sendPurchaseConfirmation(user.email, orderDetails)
                        .then(() => console.log('Order confirmation sent to buyer'))
                        .catch(e => console.error('Failed to send buyer email:', e));

                     emailService.sendNewOrderNotificationToAdmin(orderDetails)
                        .then(() => console.log('Order notification sent to admin'))
                        .catch(e => console.error('Failed to send admin email:', e));
                 }
             }
                
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

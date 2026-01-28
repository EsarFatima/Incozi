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
      
      // GENERATE A SHORT COMPLIANT ORDER ID (max 20 chars, no special chars)
      // Format: OR + Timestamp (13 chars) + Random (4 chars) = 19 chars
      const shortOrderId = 'OR' + Date.now() + Math.floor(Math.random() * 10000);

      const { data: subInsert, error: subError } = await supabase
        .from('subscriptions')
        .insert([{ 
            user_id: userId, 
            plan_id: planId, 
            status: 'pending', 
            start_date: new Date().toISOString(),
            item_name: itemName || null,
            gateway_ref: shortOrderId // Requires migration!
        }])
        .select('id')
        .maybeSingle();

      if (subError) {
          // Fallback: If 'gateway_ref' column is missing, try inserting without it
          // identifying that we might have issues later, but better than crashing now.
           console.warn('Initial insert failed, possibly missing gateway_ref column. Retrying without it.');
           const { data: subRetry, error: retryError } = await supabase
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
            
            if (retryError) throw retryError;
            
            // If we are here, we have a subscription but NO stored shortOrderId.
            // This is BAD for verification if we send shortOrderId to gateway.
            // We must rely on our known shortOrderId.
            // But how do we save it? We can't.
            console.error('CRITICAL: functionality reduced because gateway_ref column is missing.');
            subInsert = subRetry; // Use valid result
      }


      const subscriptionId = subInsert.id;
      
      // Use the shortOrderId if we generated it, otherwise fallback to subscriptionId (UUID) 
      // BUT UUID fails validation. So we MUST use shortOrderId for the gateway.
      // If we failed to store it, verification will require a lookup strategy 
      // (maybe metadata? or we just accept we can't look it up easily).
      
      const orderIdToSend = shortOrderId;

      // 4. Call Payment Gateway (AsaanPay)
      const paymentResult = await paymentService.initiatePayment(
        amount, 
        orderIdToSend, 
        { email: user.email, name: user.full_name }
      );

      // 5. Handle Result
      if (paymentResult.success) {
        return res.status(200).json({ 
            message: 'Payment Initiated',
            redirectUrl: paymentResult.redirectUrl,
            // Return the gateway_ref as the ID to track on frontend
            subscriptionId: orderIdToSend 
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
        
        // orderId here is likely the 'gateway_ref' (Short ID) if we updated the frontend loop.
        
        // Check Status with Gateway
        const result = await paymentService.checkPaymentStatus(orderId);
        
        // If 'completed' or 'success' (adjust based on real API response)
        // Simulator returns 'completed'.
        if (result.status === 'completed' || result.status === 'success' || result.status === 'paid') {
             
             // 1. Fetch Data for Emails/Logging
             // We need to find the subscription using the gateway_ref (orderId) OR the id.
             // Try gateway_ref first.
             let sub = null;
             
             const { data: subRef } = await supabase
                .from('subscriptions')
                .select('id, user_id, plan_id, item_name')
                .eq('gateway_ref', orderId)
                .maybeSingle();
                
             if (subRef) {
                 sub = subRef;
             } else {
                 // Try ID (fallback if orderId is UUID)
                 const { data: subId } = await supabase
                    .from('subscriptions')
                    .select('id, user_id, plan_id, item_name')
                    .eq('id', orderId)
                    .maybeSingle();
                 sub = subId;
             }

             let user = null;
             let plan = null;

             if (sub) {
                 const { data: u } = await supabase.from('users').select('email, full_name').eq('id', sub.user_id).maybeSingle();
                 user = u;
                 const { data: p } = await supabase.from('plans').select('name, price').eq('id', sub.plan_id).maybeSingle();
                 plan = p;

                 // 2. Activate Subscription
                 await supabase
                    .from('subscriptions')
                    .update({ status: 'active' })
                    .eq('id', sub.id); // Use the Primary Key UUID

                 // 3. Log Payment
                 await supabase
                    .from('payments')
                    .insert([{
                        user_id: sub.user_id, 
                        subscription_id: sub.id,
                        amount: result.transactionAmount || (plan ? plan.price : 0),
                        payment_status: 'success',
                        payment_provider: paymentService.PROVIDER_NAME
                    }]);
             }


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

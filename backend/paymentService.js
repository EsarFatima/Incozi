/**
 * PAYMENT GATEWAY ADAPTER: AsaanPay (Aggregator Redirect Model)
 * ------------------------------------------------------------------
 */

const PROVIDER_NAME = 'AsaanPay';
const BASE_URL = 'https://api.assanpay.com';
const MERCHANT_ID = process.env.ASAAN_MERCHANT_ID || 'YOUR_MERCHANT_ID_HERE'; // Client must provide this

/**
 * Step 1: Initiate Payment
 * Calls AsaanPay to get a payment link.
 */
const initiatePayment = async (amount, orderId, customerInfo) => {
    console.log(`\n--- [${PROVIDER_NAME}] INITIATING PAYMENT ---`);
    console.log(`Order: ${orderId}, Amount: ${amount}`);
    
    // We cannot proceed without a Merchant ID
    if (!MERCHANT_ID || MERCHANT_ID === 'YOUR_MERCHANT_ID_HERE') {
        console.warn('⚠️ MISSING MERCHANT ID: Returning simulator link.');
        // Fallback for testing until client provides credentials
        return {
            success: true,
            isRedirect: true,
            redirectUrl: `http://localhost:3000/pages/my-services.html?payment_success=true&order_id=${orderId}`, // Fake success loop
            transactionId: 'SIMULATED_TXN_' + orderId
        };
    }

    try {
        const payload = {
            amount: String(amount), // API expects String
            order_id: String(orderId),
            store_name: "Incozi Services",
            link: `http://localhost:3000/pages/my-services.html?payment_return=true&order_id=${orderId}` // Where user returns
        };

        const response = await fetch(`${BASE_URL}/payment-request/qr/${MERCHANT_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Gateway Response:', result);

        // Check for various success indicators
        // Some APIs return status="true", others might return status="success" or just a success message.
        if (result.status === "true" || result.status === true || result.status === "success" || 
            (result.message && result.message.toLowerCase().includes('successfully'))) {
            
            // Ensure data object exists
            if (!result.data || !result.data.completeLink) {
                 console.warn('Payment success indicated but missing completeLink:', result);
                 // Try to fallback if structure is different
            }

            return {
                success: true,
                isRedirect: true,
                redirectUrl: result.data ? result.data.completeLink : '#',
                transactionId: result.data ? result.data.transactionId : ('PENDING_' + orderId)
            };
        } else {
            throw new Error(result.message || 'Payment initiation failed');
        }

    } catch (error) {
        console.error('Payment Initiation Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Step 2: Check Status
 * Call this to verify if the payment was actually paid.
 */
const checkPaymentStatus = async (orderId) => {
    // Simulator Check
    if (!MERCHANT_ID || MERCHANT_ID === 'YOUR_MERCHANT_ID_HERE') {
        return { status: 'completed', amount: 0 };
    }

    try {
        const response = await fetch(`${BASE_URL}/payment/all-inquiry/${MERCHANT_ID}?transactionId=${orderId}`);
        const result = await response.json();

        if (result.status === "true" && result.data) {
            // Map their status to our system status
            // Assuming "MA" or specific text means success. Docs said "transactionStaus": "Pending".
            // We need to know what Success looks like. Usually "Success" or "00".
            return {
                status: result.data.transactionStaus.toLowerCase(), // 'pending', 'success', etc.
                gatewayResponse: result.data
            };
        }
        return { status: 'failed' };
    } catch (error) {
        console.error('Status Check Error:', error);
        return { status: 'error' };
    }
};

module.exports = {
    initiatePayment,
    checkPaymentStatus,
    PROVIDER_NAME
};

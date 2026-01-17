/**
 * PAYMENT GATEWAY ADAPTER
 * ------------------------------------------------------------------
 * This file serves as a placeholder for the specific payment gateway integration.
 * 
 * INSTRUCTIONS FOR CLIENT:
 * 1. Replace the code inside 'processPayment' with your Gateway's API call.
 * 2. Ensure it returns an object with { success: boolean, transactionId: string }.
 * 3. Update 'PROVIDER_NAME' with the name of your service (e.g., 'Stripe', 'Square').
 */

const PROVIDER_NAME = 'Simulator'; // Change this to 'Stripe', 'PayPal', etc.

const processPayment = async (amount, currency, customerInfo, paymentMethodDetails) => {
    console.log(`\n--- [${PROVIDER_NAME}] PAYMENT INITIATED ---`);
    console.log(`Amount: ${amount} ${currency}`);
    console.log(`Customer: ${customerInfo.email}`);
    
    try {
        // ============================================================
        // [START] YOUR GATEWAY CODE GOES HERE 
        // ============================================================
        
        // Example logic (Pseudo-code):
        // const response = await MyGateway.charge({
        //    amount: amount,
        //    card: paymentMethodDetails.token
        // });
        
        // For now, we simulate a successful API call delay:
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock Response
        const simulatedResult = {
            success: true, // Change to false to test failure
            transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            rawResponse: { status: 'approved', code: 200 }
        };

        // ============================================================
        // [END] YOUR GATEWAY CODE ENDS HERE
        // ============================================================

        console.log(`--- [${PROVIDER_NAME}] RESULT: ${simulatedResult.success ? 'APPROVED' : 'DECLINED'} ---\n`);
        return simulatedResult;

    } catch (error) {
        console.error('Payment Processing Error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    processPayment,
    PROVIDER_NAME
};

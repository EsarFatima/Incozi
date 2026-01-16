require('dotenv').config();
const emailService = require('./backend/emailService');

const targetEmail = process.argv[2];

if (!targetEmail) {
    console.log('\nUsage: node test_email.js <your-valid-email-address>');
    console.log('Example: node test_email.js myname@gmail.com\n');
    process.exit(1);
}

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n❌ ERROR: SMTP credentials missing in .env file.');
    console.log('Please ensure SMTP_USER and SMTP_PASS are set in your .env file.\n');
    process.exit(1);
}

console.log(`\n📧 Sending test emails to: ${targetEmail}`);
console.log('----------------------------------------');

async function runTests() {
    // 1. Test Newsletter Welcome
    console.log('1️⃣  Testing "Newsletter Welcome" email...');
    const res1 = await emailService.sendNewsletterWelcome(targetEmail);
    if (res1) {
        console.log('   ✅ Success! Message ID:', res1.messageId);
    } else {
        console.log('   ❌ Failed. Check console for error details.');
    }

    // 2. Test Contact Acknowledgment
    console.log('\n2️⃣  Testing "Contact Acknowledgment" email...');
    const res2 = await emailService.sendContactFormAcknowledgement(targetEmail, 'Test User');
    if (res2) {
        console.log('   ✅ Success! Message ID:', res2.messageId);
    } else {
        console.log('   ❌ Failed. Check console for error details.');
    }

    // 3. Test Admin Notification
    console.log('\n3️⃣  Testing "Admin Notification" (simulating a form submission)...');
    
    // Temporarily override ADMIN_EMAIL to the target email so the tester sees it
    const originalAdminEmail = process.env.ADMIN_EMAIL;
    process.env.ADMIN_EMAIL = targetEmail; 
    console.log(`   (Sending to ${targetEmail} instead of configured admin email for this test)`);

    const res3 = await emailService.sendContactFormNotificationToAdmin({ 
        name: 'Test Client', 
        email: 'client@example.com', 
        message: 'Hello, this is a test inquiry from the test script.' 
    });
    
    if (res3) {
        console.log('   ✅ Success! Message ID:', res3.messageId);
    } else {
        console.log('   ❌ Failed. Check console for error details.');
    }

    // Restore env just in case
    process.env.ADMIN_EMAIL = originalAdminEmail;

    console.log('\n----------------------------------------');
    console.log('Done.');
}

runTests();

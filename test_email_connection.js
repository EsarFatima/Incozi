const { sendEmail } = require('./backend/emailService');
require('dotenv').config();

async function testEmail() {
  const testRecipient = process.env.ADMIN_EMAIL || 'incozillc@gmail.com';
  console.log(`Attempting to send a test email to: ${testRecipient}`);
  
  const subject = 'Incozi Email Configuration Test';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #00668c;">Configuration Success!</h2>
      <p>This is a test email from your Incozi application setup.</p>
      <p>If you are seeing this, it means your <b>SMTP_USER</b> and <b>SMTP_PASS</b> are correctly configured for <b>${process.env.SMTP_USER}</b>.</p>
      <hr>
      <p style="font-size: 12px; color: #666;">Timestamp: ${new Date().toLocaleString()}</p>
    </div>
  `;

  try {
    const result = await sendEmail(testRecipient, subject, html);
    if (result) {
      console.log('✅ Test email sent successfully!');
      console.log('Check your inbox at:', testRecipient);
    } else {
      console.error('❌ Failed to send test email. Check the error logs above.');
    }
  } catch (error) {
    console.error('❌ An unexpected error occurred during the test:', error);
  }
}

testEmail();

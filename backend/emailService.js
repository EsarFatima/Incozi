const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper: Base Template for consistent branding
const wrapWithTemplate = (title, bodyContent) => {
  const primaryColor = '#00668c'; // Matches site's accent-200
  const backgroundColor = '#f5f4f1'; // Matches site's bg-200
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: ${backgroundColor}; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: ${primaryColor}; padding: 25px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 30px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        h2 { color: ${primaryColor}; margin-top: 0; }
        p { margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>INCOZI</h1>
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Incozi. All rights reserved.</p>
          <p>Accounting & Financial Services</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Incozi Support'}" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

const sendNewsletterWelcome = async (email) => {
  const subject = 'Welcome to the Incozi Community!';
  const content = `
    <h2>Welcome Aboard!</h2>
    <p>Hi there,</p>
    <p>Thank you for subscribing to the Incozi newsletter. You've just taken the first step towards smarter financial management.</p>
    <p>Here is what you can expect from us:</p>
    <ul>
      <li>Bi-weekly tips on tax optimization</li>
      <li>Updates on financial regulations</li>
      <li>Exclusive offers for our bookkeeping services</li>
    </ul>
    <p>We promise to keep your inbox clutter-free and value-packed.</p>
    <p>Cheers,<br>The Incozi Team</p>
  `;
  return sendEmail(email, subject, wrapWithTemplate('Welcome', content));
};

const sendContactFormAcknowledgement = async (email, name) => {
  const subject = 'We received your message - Incozi';
  const content = `
    <h2>Thanks for reaching out, ${name || 'there'}!</h2>
    <p>We have successfully received your inquiry via our contact form.</p>
    <p>One of our financial specialists will review your message and get back to you within 24-48 hours.</p>
    <p>In the meantime, feel free to browse our services or read our latest updates on the website.</p>
    <a href="#" class="button">Visit Our Website</a>
    <p style="margin-top: 30px;">Best regards,<br>The Incozi Team</p>
  `;
  return sendEmail(email, subject, wrapWithTemplate('Message Received', content));
};

const sendContactFormNotificationToAdmin = async (data) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const subject = `[New Lead] Contact Form: ${data.name}`;
    const content = `
      <h2>New Contact Submission</h2>
      <p>You have received a new message from the website contact form.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #4338ca; border-radius: 4px;">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>
      <p><em>Please reply to the client directly by clicking their email address above.</em></p>
    `;
    return sendEmail(adminEmail, subject, wrapWithTemplate('New Lead', content));
};

const sendVerificationEmail = async (email, link) => {
  const subject = 'Verify your email address - Incozi';
  const content = `
    <h2>Verify your email</h2>
    <p>Thanks for signing up for Incozi! We're excited to have you.</p>
    <p>Please click the button below to verify your email address and activate your account.</p>
    <a href="${link}" class="button">Verify Email</a>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `;
  return sendEmail(email, subject, wrapWithTemplate('Verify Email', content));
};

const sendPasswordResetEmail = async (email, link) => {
  const subject = 'Reset Your Password - Incozi';
  const content = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password for your Incozi account.</p>
    <p>Click the button below to set a new password:</p>
    <a href="${link}" class="button">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
  `;
  return sendEmail(email, subject, wrapWithTemplate('Reset Password', content));
};

const sendPurchaseConfirmation = async (email, order) => {
  const subject = `Order Confirmation #${order.transactionId || 'Pending'}`;
  const content = `
    <h2>Thank you for your business!</h2>
    <p>We have received your payment for <strong>${order.planName}</strong>.</p>
    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #1d1c1c;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Service:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${order.planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${order.currency} ${order.amount}</td>
        </tr>
         <tr>
          <td style="padding: 8px 0; color: #6b7280;">Date:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500;">${new Date().toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">${order.transactionId}</td>
        </tr>
      </table>
    </div>
    <p><strong>What happens next?</strong></p>
    <p>Our team will begin processing your service immediately. You can track the status of your order in your dashboard.</p>
    <a href="${process.env.BASE_URL || 'http://localhost:3000'}/pages/account.html" class="button">Go to Dashboard</a>
  `;
  return sendEmail(email, subject, wrapWithTemplate('Order Confirmed', content));
};

const sendNewOrderNotificationToAdmin = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const subject = `[New Sale] ${order.planName} - ${order.amount} ${order.currency}`;
  const content = `
    <h2>New Order Received! 💰</h2>
    <p>A new purchase has been made on Incozi.</p>
    <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; border-radius: 4px;">
      <p><strong>Customer:</strong> ${order.customerName} (<a href="mailto:${order.customerEmail}">${order.customerEmail}</a>)</p>
      <p><strong>Service:</strong> ${order.planName}</p>
      <p><strong>Amount:</strong> ${order.currency} ${order.amount}</p>
      <p><strong>Transaction ID:</strong> ${order.transactionId}</p>
    </div>
    <p>Please log in to the admin panel to manage this order.</p>
  `;
  return sendEmail(adminEmail, subject, wrapWithTemplate('New Order', content));
};

const sendConsultationBookingConfirmation = async (email, booking) => {
  const subject = 'Consultation Confirmed - Incozi';
  const content = `
    <h2>Booking Confirmed! 📅</h2>
    <p>Your consultation has been successfully scheduled.</p>
    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Time:</strong> ${booking.time}</p>
      <p><strong>Topic:</strong> ${booking.topic || 'General Consultation'}</p>
      ${booking.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${booking.meetingLink}" style="color: #00668c;">Join Meeting</a></p>` : ''}
    </div>
    <p>Please make sure to join a few minutes early. If you need to reschedule, please contact us or visit your dashboard.</p>
    <a href="${process.env.BASE_URL || 'http://localhost:3000'}/pages/account.html" class="button">View Booking</a>
  `;
  return sendEmail(email, subject, wrapWithTemplate('Consultation Confirmed', content));
};

const sendDocumentUploadNotification = async (email, doc) => {
  const subject = 'New Document Available - Incozi';
  const content = `
    <h2>New Document Uploaded 📄</h2>
    <p>A new document is available for your review.</p>
    <div style="background: #f9fafb; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #e5e7eb;">
      <p><strong>Document:</strong> ${doc.name}</p>
      <p><strong>Type:</strong> ${doc.type}</p>
      ${doc.description ? `<p><strong>Note:</strong> ${doc.description}</p>` : ''}
    </div>
    <p>You can download this document securely from your dashboard.</p>
    <a href="${process.env.BASE_URL || 'http://localhost:3000'}/pages/account.html" class="button">View Document</a>
  `;
  return sendEmail(email, subject, wrapWithTemplate('New Document', content));
};

const sendSubscriptionRenewalSuccess = async (email, subscription) => {
  const subject = 'Subscription Renewal Successful - Incozi';
  const content = `
    <h2>Subscription Renewed ✅</h2>
    <p>Your subscription for <strong>${subscription.planName}</strong> has been successfully renewed.</p>
    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <p><strong>Amount:</strong> ${subscription.currency} ${subscription.amount}</p>
      <p><strong>Next Billing Date:</strong> ${subscription.nextBillingDate}</p>
    </div>
    <p>You can manage your subscriptions and view invoices in your dashboard.</p>
    <a href="${process.env.BASE_URL || 'http://localhost:3000'}/pages/account.html" class="button">Manage Subscription</a>
  `;
  return sendEmail(email, subject, wrapWithTemplate('Renewal Successful', content));
};

const sendSubscriptionRenewalFailure = async (email, subscription) => {
  const subject = 'Action Required: Subscription Renewal Failed - Incozi';
  const content = `
    <h2 style="color: #ef4444;">Payment Failed ❌</h2>
    <p>We were unable to process the renewal payment for your <strong>${subscription.planName}</strong> subscription.</p>
    <p>Please update your payment method to ensure uninterrupted service.</p>
    <a href="${process.env.BASE_URL || 'http://localhost:3000'}/pages/account.html" class="button" style="background-color: #ef4444;">Update Payment Method</a>
    <p style="margin-top:20px; font-size: 0.9em; color: #666;">If you have already updated your payment info, please ignore this email. We will retry automatically.</p>
  `;
  return sendEmail(email, subject, wrapWithTemplate('Payment Failed', content));
};

module.exports = {
  sendNewsletterWelcome,
  sendContactFormAcknowledgement,
  sendContactFormNotificationToAdmin,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPurchaseConfirmation,
  sendNewOrderNotificationToAdmin,
  sendConsultationBookingConfirmation,
  sendDocumentUploadNotification,
  sendSubscriptionRenewalSuccess,
  sendSubscriptionRenewalFailure
};

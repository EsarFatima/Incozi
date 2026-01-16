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
  const primaryColor = '#4338ca'; // Matches your site's accent color (roughly)
  const backgroundColor = '#f3f4f6';
  
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
        .button { display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
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

module.exports = {
  sendNewsletterWelcome,
  sendContactFormAcknowledgement,
  sendContactFormNotificationToAdmin,
  sendVerificationEmail
};

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Email service not configured:', error.message);
    console.log('   Set GMAIL_APP_PASSWORD in .env to enable email notifications');
  } else {
    console.log('✅ Email service ready');
  }
});

// Send notification email to admin
export const sendAccessRequestEmail = async (user) => {
  const mailOptions = {
    from: `"AirApp System" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '🔔 New Access Request - AirApp Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Access Request</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Someone has requested access to the AirApp Admin System:</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.full_name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0;"><strong>Requested:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/admin" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Review Request
            </a>
          </p>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">AirApp Admin Management System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Notification email sent to admin');
    return true;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    return false;
  }
};

// Send approval email to user
export const sendApprovalEmail = async (user) => {
  const mailOptions = {
    from: `"AirApp System" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: '✅ Access Approved - AirApp Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Access Approved!</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Hello ${user.full_name},</p>
          <p style="color: #334155;">Great news! Your access request to the AirApp Admin System has been approved.</p>
          
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Login Now
            </a>
          </p>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">AirApp Admin Management System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send approval email:', error.message);
    return false;
  }
};

// Send rejection email to user
export const sendRejectionEmail = async (user, reason) => {
  const mailOptions = {
    from: `"AirApp System" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: '❌ Access Request Update - AirApp Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Access Request Update</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Hello ${user.full_name},</p>
          <p style="color: #334155;">Unfortunately, your access request to the AirApp Admin System was not approved at this time.</p>
          
          ${reason ? `
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 15px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${reason}</p>
          </div>
          ` : ''}
          
          <p style="color: #334155;">You may submit a new request if you believe this was in error.</p>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">AirApp Admin Management System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send rejection email:', error.message);
    return false;
  }
};

export default transporter;

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

// Send password reset email to user
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"AirApp System" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: '🔐 Password Reset Request - AirApp Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Hello ${user.full_name},</p>
          <p style="color: #334155;">We received a request to reset your password for your AirApp Admin account.</p>
          
          <p style="margin-top: 20px; text-align: center;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </p>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ This link expires in 1 hour.</strong><br>
              If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
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
    console.log('📧 Password reset email sent to', user.email);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
    return false;
  }
};

// Send OTP code for login verification
export const sendLoginOTPEmail = async (user, otpCode) => {
  const mailOptions = {
    from: `"AirApp Security" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: '🔐 Your Login Verification Code - AirApp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Login Verification</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Hello ${user.full_name},</p>
          <p style="color: #334155;">Your verification code for logging into AirApp Admin is:</p>
          
          <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 2px dashed #3b82f6;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${otpCode}</span>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ This code expires in 10 minutes.</strong><br>
              If you didn't try to login, please secure your account immediately.
            </p>
          </div>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">AirApp Admin Security System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Login OTP sent to', user.email);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    return false;
  }
};

// Send admin transfer confirmation email to OLD admin
export const sendAdminTransferOldAdminEmail = async (oldAdmin, newAdmin, confirmToken, completesAt) => {
  const confirmUrl = `${process.env.FRONTEND_URL}/admin/confirm-transfer?token=${confirmToken}&type=old`;
  const cancelUrl = `${process.env.FRONTEND_URL}/admin/cancel-transfer?token=${confirmToken}`;
  
  const mailOptions = {
    from: `"AirApp Security" <${process.env.GMAIL_USER}>`,
    to: oldAdmin.email,
    subject: '⚠️ CRITICAL: Admin Role Transfer Initiated - AirApp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">⚠️ Admin Transfer Request</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Hello ${oldAdmin.full_name},</p>
          <p style="color: #334155;"><strong>A request has been made to transfer your admin privileges to another user.</strong></p>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 15px 0;">
            <p style="margin: 5px 0; color: #991b1b;"><strong>Transfer To:</strong> ${newAdmin.full_name}</p>
            <p style="margin: 5px 0; color: #991b1b;"><strong>Email:</strong> ${newAdmin.email}</p>
            <p style="margin: 5px 0; color: #991b1b;"><strong>Completes At:</strong> ${new Date(completesAt).toLocaleString()}</p>
          </div>
          
          <p style="color: #334155;">This transfer requires confirmation from <strong>BOTH</strong> you and the new admin. It will complete after a 48-hour waiting period.</p>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${confirmUrl}" 
               style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 5px;">
              Confirm Transfer
            </a>
            <a href="${cancelUrl}" 
               style="background: #6b7280; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 5px;">
              Cancel Transfer
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>🔒 Security Notice:</strong><br>
              • You can cancel this transfer anytime before completion<br>
              • After 48 hours, if both parties confirm, transfer is permanent<br>
              • If you didn't initiate this, cancel immediately and change your password
            </p>
          </div>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">AirApp Admin Security System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send admin transfer email to old admin:', error.message);
    return false;
  }
};

// Send admin transfer confirmation email to NEW admin
export const sendAdminTransferNewAdminEmail = async (oldAdmin, newAdmin, confirmToken, completesAt) => {
  const confirmUrl = `${process.env.FRONTEND_URL}/admin/confirm-transfer?token=${confirmToken}&type=new`;
  
  const mailOptions = {
    from: `"AirApp Security" <${process.env.GMAIL_USER}>`,
    to: newAdmin.email,
    subject: '👑 Admin Role Transfer - Action Required - AirApp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">👑 Admin Role Offer</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Hello ${newAdmin.full_name},</p>
          <p style="color: #334155;"><strong>${oldAdmin.full_name}</strong> wants to transfer admin privileges to you.</p>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; margin: 15px 0;">
            <p style="margin: 5px 0; color: #065f46;"><strong>Current Admin:</strong> ${oldAdmin.full_name}</p>
            <p style="margin: 5px 0; color: #065f46;"><strong>Transfer Completes:</strong> ${new Date(completesAt).toLocaleString()}</p>
          </div>
          
          <p style="color: #334155;">Both you and the current admin must confirm for the transfer to complete. There is a 48-hour waiting period for security.</p>
          
          <p style="margin-top: 20px; text-align: center;">
            <a href="${confirmUrl}" 
               style="background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Accept Admin Role
            </a>
          </p>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            If you don't want to accept, simply ignore this email. The transfer will expire.
          </p>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">AirApp Admin Security System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send admin transfer email to new admin:', error.message);
    return false;
  }
};

// Send deletion verification email to the user being deleted
export const sendDeletionVerificationEmail = async (targetUser, adminUser, verificationToken) => {
  const confirmUrl = `${process.env.FRONTEND_URL}/verify-deletion?token=${verificationToken}`;
  const denyUrl = `${process.env.FRONTEND_URL}/deny-deletion?token=${verificationToken}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toLocaleString();
  
  const mailOptions = {
    from: `"AirApp Security" <${process.env.GMAIL_USER}>`,
    to: targetUser.email,
    subject: '⚠️ URGENT: Account Deletion Request - Response Required in 30 Minutes - AirApp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">⚠️ Account Deletion Request</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Hello ${targetUser.full_name},</p>
          <p style="color: #334155;">An administrator has requested to delete your account from AirApp.</p>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 15px 0;">
            <p style="margin: 5px 0; color: #991b1b;"><strong>Requested By:</strong> ${adminUser.full_name}</p>
            <p style="margin: 5px 0; color: #991b1b;"><strong>Admin Email:</strong> ${adminUser.email}</p>
            <p style="margin: 5px 0; color: #991b1b;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 15px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ TIME SENSITIVE:</strong><br>
              You have <strong>30 minutes</strong> to respond to this request.<br>
              <strong>Expires at:</strong> ${expiresAt}<br><br>
              <strong>If you don't respond, the deletion will be automatically CANCELLED</strong> and your account will remain safe.
            </p>
          </div>
          
          <p style="color: #334155;"><strong>Your verification is required for this deletion to proceed.</strong></p>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${confirmUrl}" 
               style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 5px;">
              Yes, Delete My Account
            </a>
            <a href="${denyUrl}" 
               style="background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 5px;">
              No, Keep My Account
            </a>
          </div>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              <strong>🔒 Security Notice:</strong><br>
              • If you did not request this deletion, you can safely ignore this email<br>
              • Ignoring this email = automatic rejection (your account stays safe)<br>
              • Your account data will be preserved for 30 days after deletion<br>
              • Contact support if you believe this is unauthorized
            </p>
          </div>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">AirApp Admin Security System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Deletion verification email sent to', targetUser.email);
    return true;
  } catch (error) {
    console.error('Failed to send deletion verification email:', error.message);
    return false;
  }
};

// Send notification that admin transfer is complete
export const sendAdminTransferCompleteEmail = async (user, isNewAdmin) => {
  const mailOptions = {
    from: `"AirApp Security" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: isNewAdmin ? '👑 You Are Now Admin - AirApp' : '✅ Admin Transfer Complete - AirApp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, ${isNewAdmin ? '#059669, #047857' : '#3b82f6, #8b5cf6'}); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">${isNewAdmin ? '👑 Welcome, New Admin!' : '✅ Transfer Complete'}</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155;">Hello ${user.full_name},</p>
          <p style="color: #334155;">
            ${isNewAdmin 
              ? 'The admin role transfer is complete. You are now the administrator of AirApp.' 
              : 'The admin role transfer is complete. Your admin privileges have been transferred successfully.'}
          </p>
          
          ${isNewAdmin ? `
          <p style="margin-top: 20px; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/admin" 
               style="background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Go to Admin Dashboard
            </a>
          </p>
          ` : ''}
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">AirApp Admin Security System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send admin transfer complete email:', error.message);
    return false;
  }
};

export default transporter;

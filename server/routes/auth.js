import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { 
  sendAccessRequestEmail, 
  sendPasswordResetEmail, 
  sendLoginOTPEmail,
  sendAdminTransferCompleteEmail 
} from '../config/email.js';
import crypto from 'crypto';

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to log audit events
const logAudit = (action, category, userId, targetUserId, details, req) => {
  try {
    db.prepare(`
      INSERT INTO audit_logs (action, category, user_id, target_user_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      action,
      category,
      userId,
      targetUserId,
      typeof details === 'object' ? JSON.stringify(details) : details,
      req?.ip || req?.connection?.remoteAddress || 'unknown',
      req?.headers?.['user-agent'] || 'unknown'
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

export { logAudit };

const router = express.Router();

// POST /api/auth/signup - Submit access request
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id, status FROM users WHERE email = ?').get(email);
    
    if (existingUser) {
      if (existingUser.status === 'pending') {
        return res.status(400).json({ message: 'A request with this email is already pending' });
      }
      if (existingUser.status === 'approved') {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }
      if (existingUser.status === 'rejected') {
        // Allow re-application - update existing record
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare(`
          UPDATE users 
          SET full_name = ?, password = ?, status = 'pending', updated_at = CURRENT_TIMESTAMP, rejection_reason = NULL
          WHERE id = ?
        `).run(fullName, hashedPassword, existingUser.id);

        // Create notification for admin
        db.prepare(`
          INSERT INTO notifications (type, message, user_id)
          VALUES ('access_request', ?, ?)
        `).run(`${fullName} has re-applied for access`, existingUser.id);

        // Send email notification to admin
        await sendAccessRequestEmail({ full_name: fullName, email });

        return res.status(201).json({ 
          message: 'Your access request has been resubmitted. You will be notified once reviewed.' 
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with pending status
    const result = db.prepare(`
      INSERT INTO users (full_name, email, password, status)
      VALUES (?, ?, ?, 'pending')
    `).run(fullName, email, hashedPassword);

    // Create notification for admin
    db.prepare(`
      INSERT INTO notifications (type, message, user_id)
      VALUES ('access_request', ?, ?)
    `).run(`${fullName} has requested access`, result.lastInsertRowid);

    // Send email notification to admin
    await sendAccessRequestEmail({ full_name: fullName, email });

    res.status(201).json({ 
      message: 'Your access request has been submitted. You will be notified once reviewed.' 
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login - Step 1: Verify credentials and send OTP (or bypass if email not configured)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user (exclude soft-deleted users)
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND (is_deleted = 0 OR is_deleted IS NULL)').get(email);

    if (!user) {
      logAudit('login_failed', 'auth', null, null, { email, reason: 'user_not_found' }, req);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logAudit('login_failed', 'auth', user.id, null, { reason: 'invalid_password' }, req);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check status
    if (user.status === 'pending') {
      logAudit('login_failed', 'auth', user.id, null, { reason: 'pending_approval' }, req);
      return res.status(403).json({ 
        message: 'Your access request is still pending approval',
        status: 'pending'
      });
    }

    if (user.status === 'rejected') {
      logAudit('login_failed', 'auth', user.id, null, { reason: 'rejected' }, req);
      return res.status(403).json({ 
        message: 'Your access request was not approved. You may submit a new request.',
        status: 'rejected'
      });
    }

    // Delete any existing unused OTPs for this user
    db.prepare('DELETE FROM otp_codes WHERE user_id = ? AND type = ? AND used = 0').run(user.id, 'login');

    // Generate OTP
    const otpCode = generateOTP();
    
    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store OTP in database
    db.prepare(`
      INSERT INTO otp_codes (user_id, code, type, expires_at)
      VALUES (?, ?, 'login', ?)
    `).run(user.id, otpCode, expiresAt);

    // Send OTP via email
    const emailSent = await sendLoginOTPEmail({ full_name: user.full_name, email: user.email }, otpCode);

    // DEV MODE: If email fails, bypass OTP and log in directly
    if (!emailSent) {
      console.log(`\n🔓 DEV MODE: OTP bypass for ${user.email}`);
      console.log(`   (Email service not configured - skipping OTP verification)\n`);
      
      // Generate actual JWT token directly
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      logAudit('login_success_dev_mode', 'auth', user.id, null, { email: user.email, otp_bypassed: true }, req);

      return res.json({
        message: 'Login successful',
        requiresOTP: false,
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Generate temporary session token (valid for 10 minutes, only for OTP verification)
    const tempToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'otp_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    logAudit('login_otp_sent', 'auth', user.id, null, { email: user.email }, req);

    res.json({
      message: 'Verification code sent to your email',
      requiresOTP: true,
      tempToken,
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/verify-otp - Step 2: Verify OTP and complete login
router.post('/verify-otp', async (req, res) => {
  try {
    const { tempToken, otpCode } = req.body;

    if (!tempToken || !otpCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    if (decoded.purpose !== 'otp_verification') {
      return res.status(401).json({ message: 'Invalid session. Please login again.' });
    }

    // Find valid OTP
    const otp = db.prepare(`
      SELECT * FROM otp_codes 
      WHERE user_id = ? AND code = ? AND type = 'login' AND used = 0 AND expires_at > datetime('now')
    `).get(decoded.id, otpCode);

    if (!otp) {
      logAudit('otp_failed', 'auth', decoded.id, null, { reason: 'invalid_or_expired' }, req);
      return res.status(401).json({ message: 'Invalid or expired verification code' });
    }

    // Mark OTP as used
    db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(otp.id);

    // Get user details
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    // Generate actual JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logAudit('login_success', 'auth', user.id, null, { email: user.email }, req);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/resend-otp - Resend OTP code
router.post('/resend-otp', async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({ message: 'Session required' });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    if (decoded.purpose !== 'otp_verification') {
      return res.status(401).json({ message: 'Invalid session' });
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check rate limiting (max 3 OTPs per 10 minutes)
    const recentOTPs = db.prepare(`
      SELECT COUNT(*) as count FROM otp_codes 
      WHERE user_id = ? AND type = 'login' AND created_at > datetime('now', '-10 minutes')
    `).get(user.id);

    if (recentOTPs.count >= 3) {
      return res.status(429).json({ message: 'Too many requests. Please wait before requesting another code.' });
    }

    // Delete existing unused OTPs
    db.prepare('DELETE FROM otp_codes WHERE user_id = ? AND type = ? AND used = 0').run(user.id, 'login');

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO otp_codes (user_id, code, type, expires_at)
      VALUES (?, ?, 'login', ?)
    `).run(user.id, otpCode, expiresAt);

    // Send OTP
    await sendLoginOTPEmail({ full_name: user.full_name, email: user.email }, otpCode);

    logAudit('otp_resent', 'auth', user.id, null, { email: user.email }, req);

    res.json({ message: 'New verification code sent to your email' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT id, full_name, email, role, status FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Always return success message (don't reveal if email exists)
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      });
    }

    // Check if user is approved (only approved users can reset password)
    if (user.status !== 'approved') {
      return res.json({ 
        message: 'If an account with that email exists, you will receive a password reset link.' 
      });
    }

    // Delete any existing unused tokens for this user
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0').run(user.id);

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store token in database
    db.prepare(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, resetToken, expiresAt);

    // Send email
    await sendPasswordResetEmail({ full_name: user.full_name, email: user.email }, resetToken);

    res.json({ 
      message: 'If an account with that email exists, you will receive a password reset link.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Find valid token
    const resetToken = db.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(token);

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(resetToken.user_id);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, user.id);

    // Mark token as used
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id);

    res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/auth/verify-reset-token - Verify if reset token is valid
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, message: 'Token is required' });
    }

    const resetToken = db.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(token);

    if (!resetToken) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired reset link' });
    }

    res.json({ valid: true });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
});

// ==================== ADMIN TRANSFER CONFIRMATION (Public routes via email) ====================

// POST /api/auth/confirm-admin-transfer - Confirm admin transfer via email link
router.post('/confirm-admin-transfer', async (req, res) => {
  try {
    const { token, type } = req.body;

    if (!token || !type) {
      return res.status(400).json({ message: 'Token and type are required' });
    }

    // Find transfer by token
    const tokenColumn = type === 'old' ? 'old_admin_token' : 'new_admin_token';
    const confirmedColumn = type === 'old' ? 'old_admin_confirmed' : 'new_admin_confirmed';

    const transfer = db.prepare(`
      SELECT * FROM admin_transfers 
      WHERE ${tokenColumn} = ? AND status IN ('pending', 'confirmed_by_old', 'confirmed_by_new')
    `).get(token);

    if (!transfer) {
      return res.status(400).json({ message: 'Invalid or expired confirmation link' });
    }

    // Check if already confirmed by this party
    if (transfer[confirmedColumn] === 1) {
      return res.status(400).json({ message: 'You have already confirmed this transfer' });
    }

    // Update confirmation
    db.prepare(`
      UPDATE admin_transfers SET ${confirmedColumn} = 1 WHERE id = ?
    `).run(transfer.id);

    // Get updated transfer
    const updatedTransfer = db.prepare('SELECT * FROM admin_transfers WHERE id = ?').get(transfer.id);

    // Check if both parties have confirmed
    if (updatedTransfer.old_admin_confirmed === 1 && updatedTransfer.new_admin_confirmed === 1) {
      // Check if 48 hours have passed
      const completesAt = new Date(transfer.completes_at);
      const now = new Date();

      if (now >= completesAt) {
        // Complete the transfer
        await completeAdminTransfer(transfer.id);
        return res.json({ 
          message: 'Admin transfer completed successfully!',
          completed: true
        });
      } else {
        // Update status to show both confirmed
        db.prepare(`
          UPDATE admin_transfers SET status = 'confirmed_by_new' WHERE id = ?
        `).run(transfer.id);
        
        const timeRemaining = Math.ceil((completesAt - now) / (1000 * 60 * 60));
        return res.json({ 
          message: `Both parties confirmed. Transfer will complete in ${timeRemaining} hours.`,
          completed: false,
          completesAt: transfer.completes_at
        });
      }
    }

    // Update status based on who confirmed
    const newStatus = type === 'old' ? 'confirmed_by_old' : 'confirmed_by_new';
    db.prepare(`
      UPDATE admin_transfers SET status = ? WHERE id = ?
    `).run(newStatus, transfer.id);

    logAudit('admin_transfer_confirmed', 'admin', type === 'old' ? transfer.from_user_id : transfer.to_user_id, null, { 
      transfer_id: transfer.id,
      confirmed_by: type
    }, req);

    res.json({ 
      message: 'Your confirmation has been recorded. Waiting for the other party to confirm.',
      completed: false
    });

  } catch (error) {
    console.error('Admin transfer confirmation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to complete admin transfer
async function completeAdminTransfer(transferId) {
  const transfer = db.prepare('SELECT * FROM admin_transfers WHERE id = ?').get(transferId);
  
  if (!transfer) return false;

  const oldAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(transfer.from_user_id);
  const newAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(transfer.to_user_id);

  // Update roles
  db.prepare(`UPDATE users SET role = 'user' WHERE id = ?`).run(transfer.from_user_id);
  db.prepare(`UPDATE users SET role = 'admin' WHERE id = ?`).run(transfer.to_user_id);

  // Mark transfer as completed
  db.prepare(`
    UPDATE admin_transfers SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(transferId);

  // Send completion emails
  await sendAdminTransferCompleteEmail({ full_name: oldAdmin.full_name, email: oldAdmin.email }, false);
  await sendAdminTransferCompleteEmail({ full_name: newAdmin.full_name, email: newAdmin.email }, true);

  logAudit('admin_transfer_completed', 'admin', transfer.from_user_id, transfer.to_user_id, { transfer_id: transferId }, null);

  return true;
}

// GET /api/auth/admin-transfer-status - Get transfer status by token (public)
router.get('/admin-transfer-status', (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const transfer = db.prepare(`
      SELECT t.*, 
             f.full_name as from_name, 
             n.full_name as to_name
      FROM admin_transfers t
      JOIN users f ON t.from_user_id = f.id
      JOIN users n ON t.to_user_id = n.id
      WHERE t.old_admin_token = ? OR t.new_admin_token = ?
    `).get(token, token);

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    res.json({
      status: transfer.status,
      fromName: transfer.from_name,
      toName: transfer.to_name,
      oldAdminConfirmed: transfer.old_admin_confirmed === 1,
      newAdminConfirmed: transfer.new_admin_confirmed === 1,
      completesAt: transfer.completes_at,
      completedAt: transfer.completed_at
    });

  } catch (error) {
    console.error('Error fetching transfer status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== DELETION VERIFICATION (Public routes via email) ====================

// POST /api/auth/verify-deletion - User confirms their account deletion
router.post('/verify-deletion', async (req, res) => {
  try {
    const { token, action } = req.body;

    if (!token || !action) {
      return res.status(400).json({ message: 'Token and action are required' });
    }

    const deletion = db.prepare(`
      SELECT d.*, u.full_name, u.email
      FROM deletion_requests d
      JOIN users u ON d.target_user_id = u.id
      WHERE d.verification_token = ?
    `).get(token);

    if (!deletion) {
      return res.status(400).json({ message: 'Invalid verification link' });
    }

    // Check if already processed
    if (deletion.status !== 'pending') {
      return res.status(400).json({ 
        message: deletion.status === 'expired' 
          ? 'This deletion request has expired (30-minute timeout). No action was taken on your account.'
          : `This deletion request has already been ${deletion.status}.`
      });
    }

    // Check if expired (30 minutes)
    if (deletion.expires_at && new Date(deletion.expires_at) < new Date()) {
      // Mark as expired
      db.prepare(`UPDATE deletion_requests SET status = 'expired' WHERE id = ?`).run(deletion.id);
      
      logAudit('deletion_expired', 'user', deletion.requested_by, deletion.target_user_id, { 
        deletion_id: deletion.id,
        reason: 'User did not respond within 30 minutes'
      }, req);

      return res.status(400).json({ 
        message: 'This deletion request has expired. The 30-minute response window has passed. Your account is safe.'
      });
    }

    if (action === 'confirm') {
      // User confirmed deletion - perform soft delete
      db.prepare(`
        UPDATE users 
        SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ?
        WHERE id = ?
      `).run(deletion.requested_by, deletion.target_user_id);

      db.prepare(`
        UPDATE deletion_requests 
        SET status = 'completed', target_confirmed = 1, verified_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(deletion.id);

      logAudit('user_deleted', 'user', deletion.requested_by, deletion.target_user_id, { 
        deletion_id: deletion.id,
        confirmed_by_user: true
      }, req);

      res.json({ 
        message: 'Your account has been deleted. Your data will be preserved for 30 days.',
        deleted: true
      });

    } else if (action === 'deny') {
      // User denied deletion
      db.prepare(`
        UPDATE deletion_requests SET status = 'cancelled', target_confirmed = 0 WHERE id = ?
      `).run(deletion.id);

      logAudit('deletion_denied_by_user', 'user', deletion.target_user_id, null, { 
        deletion_id: deletion.id
      }, req);

      res.json({ 
        message: 'Deletion request has been cancelled. Your account is safe.',
        deleted: false
      });

    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

  } catch (error) {
    console.error('Deletion verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/deletion-status - Get deletion request status by token
router.get('/deletion-status', (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const deletion = db.prepare(`
      SELECT d.*, u.full_name as target_name, a.full_name as admin_name
      FROM deletion_requests d
      JOIN users u ON d.target_user_id = u.id
      JOIN users a ON d.requested_by = a.id
      WHERE d.verification_token = ?
    `).get(token);

    if (!deletion) {
      return res.status(404).json({ message: 'Deletion request not found' });
    }

    res.json({
      status: deletion.status,
      targetName: deletion.target_name,
      adminName: deletion.admin_name,
      reason: deletion.reason,
      createdAt: deletion.created_at
    });

  } catch (error) {
    console.error('Error fetching deletion status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

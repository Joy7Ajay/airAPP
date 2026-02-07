import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { 
  sendApprovalEmail, 
  sendRejectionEmail,
  sendAdminTransferOldAdminEmail,
  sendAdminTransferNewAdminEmail,
  sendAdminTransferCompleteEmail,
  sendDeletionVerificationEmail
} from '../config/email.js';
import { logAudit } from './auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// GET /api/admin/requests - Get all access requests
router.get('/requests', (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT id, full_name, email, status, created_at, updated_at, rejection_reason
      FROM users 
      WHERE role = 'user' AND (is_deleted = 0 OR is_deleted IS NULL)
    `;
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ` AND status = '${status}'`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const requests = db.prepare(query).all();
    
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/requests/:id - Get single request details
router.get('/requests/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const request = db.prepare(`
      SELECT id, full_name, email, status, created_at, updated_at, approved_at, rejection_reason
      FROM users WHERE id = ? AND role = 'user'
    `).get(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({ request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/approve/:id - Approve access request
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(id, 'user');
    
    if (!user) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (user.status === 'approved') {
      return res.status(400).json({ message: 'User is already approved' });
    }
    
    // Update status to approved
    db.prepare(`
      UPDATE users 
      SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(req.user.id, id);
    
    // Create notification
    db.prepare(`
      INSERT INTO notifications (type, message, user_id)
      VALUES ('approval', ?, ?)
    `).run(`You approved ${user.full_name}'s access request`, id);
    
    // Send approval email to user
    await sendApprovalEmail(user);
    
    // Log audit
    logAudit('user_approved', 'user', req.user.id, parseInt(id), { email: user.email }, req);
    
    res.json({ message: `${user.full_name} has been approved` });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/reject/:id - Reject access request
router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(id, 'user');
    
    if (!user) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (user.status === 'rejected') {
      return res.status(400).json({ message: 'Request is already rejected' });
    }
    
    // Update status to rejected
    db.prepare(`
      UPDATE users 
      SET status = 'rejected', rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reason || null, id);
    
    // Create notification
    db.prepare(`
      INSERT INTO notifications (type, message, user_id)
      VALUES ('rejection', ?, ?)
    `).run(`You rejected ${user.full_name}'s access request`, id);
    
    // Send rejection email to user
    await sendRejectionEmail(user, reason);
    
    // Log audit
    logAudit('user_rejected', 'user', req.user.id, parseInt(id), { email: user.email, reason }, req);
    
    res.json({ message: `${user.full_name}'s request has been rejected` });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/notifications - Get admin notifications
router.get('/notifications', (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT n.*, u.full_name as user_name, u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
      LIMIT 50
    `).all();
    
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0').get();
    
    res.json({ 
      notifications,
      unreadCount: unreadCount.count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/notifications/read - Mark notifications as read
router.post('/notifications/read', (req, res) => {
  try {
    const { ids } = req.body;
    
    if (ids && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders})`).run(...ids);
    } else {
      db.prepare('UPDATE notifications SET is_read = 1').run();
    }
    
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/stats - Get dashboard stats
router.get('/stats', (req, res) => {
  try {
    const pending = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending' AND role = 'user' AND (is_deleted = 0 OR is_deleted IS NULL)").get();
    const approved = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'approved' AND role = 'user' AND (is_deleted = 0 OR is_deleted IS NULL)").get();
    const rejected = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'rejected' AND role = 'user' AND (is_deleted = 0 OR is_deleted IS NULL)").get();
    const total = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND (is_deleted = 0 OR is_deleted IS NULL)").get();
    
    res.json({
      stats: {
        pending: pending.count,
        approved: approved.count,
        rejected: rejected.count,
        total: total.count,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ADMIN TRANSFER SYSTEM ====================

// POST /api/admin/transfer/initiate - Initiate admin transfer (requires password re-authentication)
router.post('/transfer/initiate', async (req, res) => {
  try {
    const { targetUserId, password } = req.body;

    if (!targetUserId || !password) {
      return res.status(400).json({ message: 'Target user and password are required' });
    }

    // Get current admin
    const currentAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    
    // Re-authenticate with password
    const isValidPassword = await bcrypt.compare(password, currentAdmin.password);
    if (!isValidPassword) {
      logAudit('admin_transfer_failed', 'security', req.user.id, targetUserId, { reason: 'invalid_password' }, req);
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Get target user
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)').get(targetUserId);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    if (targetUser.status !== 'approved') {
      return res.status(400).json({ message: 'Target user must be approved first' });
    }

    if (targetUser.id === currentAdmin.id) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    // Check for existing pending transfer
    const existingTransfer = db.prepare(`
      SELECT * FROM admin_transfers 
      WHERE status IN ('pending', 'confirmed_by_old', 'confirmed_by_new')
      AND (from_user_id = ? OR to_user_id = ?)
    `).get(currentAdmin.id, targetUserId);

    if (existingTransfer) {
      return res.status(400).json({ message: 'There is already a pending admin transfer' });
    }

    // Generate tokens for both parties
    const oldAdminToken = crypto.randomBytes(32).toString('hex');
    const newAdminToken = crypto.randomBytes(32).toString('hex');

    // Calculate completion time (48 hours from now)
    const completesAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    // Create transfer record
    const result = db.prepare(`
      INSERT INTO admin_transfers (from_user_id, to_user_id, old_admin_token, new_admin_token, completes_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(currentAdmin.id, targetUser.id, oldAdminToken, newAdminToken, completesAt);

    // Send emails to both parties
    await sendAdminTransferOldAdminEmail(
      { full_name: currentAdmin.full_name, email: currentAdmin.email },
      { full_name: targetUser.full_name, email: targetUser.email },
      oldAdminToken,
      completesAt
    );

    await sendAdminTransferNewAdminEmail(
      { full_name: currentAdmin.full_name, email: currentAdmin.email },
      { full_name: targetUser.full_name, email: targetUser.email },
      newAdminToken,
      completesAt
    );

    logAudit('admin_transfer_initiated', 'admin', req.user.id, targetUserId, { 
      completes_at: completesAt,
      transfer_id: result.lastInsertRowid
    }, req);

    res.json({ 
      message: 'Admin transfer initiated. Both parties must confirm via email. Transfer will complete in 48 hours.',
      transferId: result.lastInsertRowid,
      completesAt
    });

  } catch (error) {
    console.error('Admin transfer initiation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/transfer/status - Get current transfer status
router.get('/transfer/status', (req, res) => {
  try {
    const transfer = db.prepare(`
      SELECT t.*, 
             f.full_name as from_name, f.email as from_email,
             t2.full_name as to_name, t2.email as to_email
      FROM admin_transfers t
      JOIN users f ON t.from_user_id = f.id
      JOIN users t2 ON t.to_user_id = t2.id
      WHERE t.status IN ('pending', 'confirmed_by_old', 'confirmed_by_new')
      AND (t.from_user_id = ? OR t.to_user_id = ?)
      ORDER BY t.created_at DESC
      LIMIT 1
    `).get(req.user.id, req.user.id);

    res.json({ transfer: transfer || null });
  } catch (error) {
    console.error('Error fetching transfer status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/transfer/cancel - Cancel admin transfer
router.post('/transfer/cancel', async (req, res) => {
  try {
    const { reason } = req.body;

    const transfer = db.prepare(`
      SELECT * FROM admin_transfers 
      WHERE status IN ('pending', 'confirmed_by_old', 'confirmed_by_new')
      AND from_user_id = ?
    `).get(req.user.id);

    if (!transfer) {
      return res.status(404).json({ message: 'No pending transfer found' });
    }

    db.prepare(`
      UPDATE admin_transfers 
      SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, cancelled_by = ?, cancel_reason = ?
      WHERE id = ?
    `).run(req.user.id, reason || 'Cancelled by admin', transfer.id);

    logAudit('admin_transfer_cancelled', 'admin', req.user.id, transfer.to_user_id, { 
      transfer_id: transfer.id,
      reason
    }, req);

    res.json({ message: 'Admin transfer cancelled' });

  } catch (error) {
    console.error('Error cancelling transfer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users - Get all users (for transfer selection)
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, full_name, email, role, status, created_at
      FROM users 
      WHERE status = 'approved' AND role = 'user' AND (is_deleted = 0 OR is_deleted IS NULL)
      ORDER BY full_name ASC
    `).all();

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SECURE DELETION SYSTEM ====================

// POST /api/admin/delete/initiate - Initiate user deletion (requires confirmation typing)
router.post('/delete/initiate', async (req, res) => {
  try {
    const { targetUserId, password, confirmText, confirmEmail, reason } = req.body;

    if (!targetUserId || !password || !confirmText || !confirmEmail) {
      return res.status(400).json({ message: 'All confirmation fields are required' });
    }

    // Verify confirmation typing
    if (confirmText !== 'DELETE') {
      return res.status(400).json({ message: 'Please type DELETE to confirm' });
    }

    // Get current admin
    const currentAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    // Verify admin email was typed correctly
    if (confirmEmail !== currentAdmin.email) {
      return res.status(400).json({ message: 'Admin email does not match' });
    }

    // Re-authenticate with password
    const isValidPassword = await bcrypt.compare(password, currentAdmin.password);
    if (!isValidPassword) {
      logAudit('deletion_failed', 'security', req.user.id, targetUserId, { reason: 'invalid_password' }, req);
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Get target user
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)').get(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users. Transfer admin role first.' });
    }

    // Check for existing pending deletion
    const existingDeletion = db.prepare(`
      SELECT * FROM deletion_requests 
      WHERE target_user_id = ? AND status = 'pending'
    `).get(targetUserId);

    if (existingDeletion) {
      return res.status(400).json({ message: 'There is already a pending deletion request for this user' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Request expires in 30 minutes - auto-rejection if ignored
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Create deletion request
    const result = db.prepare(`
      INSERT INTO deletion_requests (target_user_id, requested_by, verification_token, admin_confirmed, reason, expires_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `).run(targetUserId, req.user.id, verificationToken, reason || null, expiresAt);

    // Send verification email to target user
    await sendDeletionVerificationEmail(
      { full_name: targetUser.full_name, email: targetUser.email },
      { full_name: currentAdmin.full_name, email: currentAdmin.email },
      verificationToken
    );

    logAudit('deletion_initiated', 'user', req.user.id, targetUserId, { 
      deletion_id: result.lastInsertRowid,
      reason,
      expires_at: expiresAt
    }, req);

    res.json({ 
      message: 'Deletion request created. User has 30 minutes to respond via email. If ignored, deletion will be automatically cancelled.',
      deletionId: result.lastInsertRowid,
      expiresAt
    });

  } catch (error) {
    console.error('Deletion initiation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/delete/pending - Get pending deletion requests
router.get('/delete/pending', (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT d.*, u.full_name as target_name, u.email as target_email
      FROM deletion_requests d
      JOIN users u ON d.target_user_id = u.id
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
    `).all();

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching pending deletions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/delete/cancel/:id - Cancel deletion request
router.post('/delete/cancel/:id', (req, res) => {
  try {
    const { id } = req.params;

    const deletion = db.prepare(`
      SELECT * FROM deletion_requests WHERE id = ? AND status = 'pending' AND requested_by = ?
    `).get(id, req.user.id);

    if (!deletion) {
      return res.status(404).json({ message: 'Deletion request not found or not authorized' });
    }

    db.prepare(`
      UPDATE deletion_requests SET status = 'cancelled' WHERE id = ?
    `).run(id);

    logAudit('deletion_cancelled', 'user', req.user.id, deletion.target_user_id, { deletion_id: id }, req);

    res.json({ message: 'Deletion request cancelled' });

  } catch (error) {
    console.error('Error cancelling deletion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== AUDIT LOGS ====================

// GET /api/admin/audit-logs - Get audit logs
router.get('/audit-logs', (req, res) => {
  try {
    const { category, limit = 100 } = req.query;

    let query = `
      SELECT a.*, 
             u.full_name as user_name, u.email as user_email,
             t.full_name as target_name, t.email as target_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN users t ON a.target_user_id = t.id
    `;

    if (category) {
      query += ` WHERE a.category = '${category}'`;
    }

    query += ` ORDER BY a.created_at DESC LIMIT ${parseInt(limit)}`;

    const logs = db.prepare(query).all();

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

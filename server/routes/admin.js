import express from 'express';
import db from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { sendApprovalEmail, sendRejectionEmail } from '../config/email.js';

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
      WHERE role = 'user'
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
    const pending = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending' AND role = 'user'").get();
    const approved = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'approved' AND role = 'user'").get();
    const rejected = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'rejected' AND role = 'user'").get();
    const total = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get();
    
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

export default router;

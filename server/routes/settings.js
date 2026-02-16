import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

const ensureUserSettings = (userId) => {
  const existing = db.prepare('SELECT user_id FROM user_settings WHERE user_id = ?').get(userId);
  if (!existing) {
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
  }
};

router.get('/', (req, res) => {
  ensureUserSettings(req.user.id);
  const user = db.prepare('SELECT id, full_name, email, phone, location, department FROM users WHERE id = ?').get(req.user.id);
  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
  res.json({ user, settings });
});

router.put('/profile', (req, res) => {
  const { fullName, email, phone, location, department } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ message: 'Full name and email are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
  if (existing) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  db.prepare(`
    UPDATE users
    SET full_name = ?, email = ?, phone = ?, location = ?, department = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(fullName, email, phone || null, location || null, department || null, req.user.id);

  res.json({ message: 'Profile updated' });
});

router.put('/security', (req, res) => {
  const { twoFactor, loginAlerts, sessionTimeout } = req.body;
  ensureUserSettings(req.user.id);
  db.prepare(`
    UPDATE user_settings
    SET two_factor = ?, login_alerts = ?, session_timeout = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(twoFactor ? 1 : 0, loginAlerts ? 1 : 0, sessionTimeout || '30', req.user.id);

  res.json({ message: 'Security settings updated' });
});

router.put('/appearance', (req, res) => {
  const { theme, language, timezone, dateFormat } = req.body;
  ensureUserSettings(req.user.id);
  db.prepare(`
    UPDATE user_settings
    SET theme = ?, language = ?, timezone = ?, date_format = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(theme || 'dark', language || 'en', timezone || 'UTC', dateFormat || 'DD/MM/YYYY', req.user.id);

  res.json({ message: 'Appearance settings updated' });
});

router.put('/notifications', (req, res) => {
  const { email, push, security, updates, marketing } = req.body;
  ensureUserSettings(req.user.id);
  db.prepare(`
    UPDATE user_settings
    SET notify_email = ?, notify_push = ?, notify_security = ?, notify_updates = ?, notify_marketing = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(email ? 1 : 0, push ? 1 : 0, security ? 1 : 0, updates ? 1 : 0, marketing ? 1 : 0, req.user.id);

  res.json({ message: 'Notification preferences updated' });
});

router.post('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashed, req.user.id);
  res.json({ message: 'Password updated' });
});

router.post('/avatar', (req, res) => {
  const { image } = req.body;
  ensureUserSettings(req.user.id);
  db.prepare('UPDATE user_settings SET avatar_data = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(image || null, req.user.id);
  res.json({ message: image ? 'Avatar updated' : 'Avatar removed' });
});

export default router;

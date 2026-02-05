import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { sendAccessRequestEmail } from '../config/email.js';

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

// POST /api/auth/login - Login (only approved users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check status
    if (user.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your access request is still pending approval',
        status: 'pending'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ 
        message: 'Your access request was not approved. You may submit a new request.',
        status: 'rejected'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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
    console.error('Login error:', error);
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

export default router;

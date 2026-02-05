import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// Verify JWT token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is approved
export const isApproved = (req, res, next) => {
  const user = db.prepare('SELECT status FROM users WHERE id = ?').get(req.user.id);
  
  if (!user || user.status !== 'approved') {
    return res.status(403).json({ message: 'Account not approved' });
  }
  next();
};

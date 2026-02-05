import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

// Import database (initializes tables)
import './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AirApp Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🛫 ================================== 🛬');
  console.log('   AirApp Admin Server');
  console.log('🛫 ================================== 🛬');
  console.log('');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📧 Admin email: ${process.env.ADMIN_EMAIL}`);
  console.log('');
  console.log('Endpoints:');
  console.log('  POST /api/auth/signup  - Submit access request');
  console.log('  POST /api/auth/login   - Login');
  console.log('  GET  /api/auth/me      - Get current user');
  console.log('  GET  /api/admin/requests  - Get access requests');
  console.log('  POST /api/admin/approve/:id  - Approve request');
  console.log('  POST /api/admin/reject/:id   - Reject request');
  console.log('');
});

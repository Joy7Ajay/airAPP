import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import dashboardRoutes from './routes/dashboard.js';
import actionsRoutes from './routes/actions.js';
import settingsRoutes from './routes/settings.js';

// Import database (initializes tables)
import './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// Middleware
const allowedOrigins = new Set(
  [process.env.FRONTEND_URL, ...(process.env.CORS_ORIGINS || '').split(',')]
    .map((value) => (value || '').trim())
    .filter(Boolean)
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    try {
      const { hostname } = new URL(origin);
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      if (isLocalhost || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
    } catch {
      // fall through to reject
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AirApp Server is running' });
});

// Error handling
app.use((err, req, res, _next) => {
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

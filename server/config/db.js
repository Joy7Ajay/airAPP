import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database file in server folder
const db = new Database(join(__dirname, '..', 'airapp.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    approved_by INTEGER,
    rejection_reason TEXT
  )
`);

// Create notifications table for admin
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Create password reset tokens table
db.exec(`
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Create OTP codes table for email verification on login
db.exec(`
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    type TEXT DEFAULT 'login' CHECK(type IN ('login', 'delete_verification', 'admin_transfer')),
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Create audit logs table - permanent record of all actions
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('auth', 'user', 'admin', 'security', 'data')),
    user_id INTEGER,
    target_user_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id)
  )
`);

// Create admin transfers table - tracks admin role transfers with waiting period
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed_by_old', 'confirmed_by_new', 'completed', 'cancelled', 'expired')),
    old_admin_confirmed INTEGER DEFAULT 0,
    new_admin_confirmed INTEGER DEFAULT 0,
    old_admin_token TEXT,
    new_admin_token TEXT,
    initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completes_at DATETIME NOT NULL,
    completed_at DATETIME,
    cancelled_at DATETIME,
    cancelled_by INTEGER,
    cancel_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id)
  )
`);

// Create deletion requests table - for soft delete with verification
db.exec(`
  CREATE TABLE IF NOT EXISTS deletion_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_user_id INTEGER NOT NULL,
    requested_by INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'completed', 'cancelled', 'expired')),
    verification_token TEXT,
    admin_confirmed INTEGER DEFAULT 0,
    target_confirmed INTEGER DEFAULT 0,
    reason TEXT,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (target_user_id) REFERENCES users(id),
    FOREIGN KEY (requested_by) REFERENCES users(id)
  )
`);

// Add expires_at column if not exists (for existing databases)
try {
  db.exec(`ALTER TABLE deletion_requests ADD COLUMN expires_at DATETIME`);
} catch (e) {
  // Column already exists
}

// Add soft delete columns to users table if not exists
try {
  db.exec(`ALTER TABLE users ADD COLUMN is_deleted INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists
}
try {
  db.exec(`ALTER TABLE users ADD COLUMN deleted_at DATETIME`);
} catch (e) {
  // Column already exists
}
try {
  db.exec(`ALTER TABLE users ADD COLUMN deleted_by INTEGER`);
} catch (e) {
  // Column already exists
}

// Check if admin exists, if not create placeholder (will be activated on first login)
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('ljoy23200@gmail.com');
if (!adminExists) {
  // Insert admin with pre-approved status
  const hashedPassword = bcrypt.hashSync('admin123', 10); // Default password, change immediately!
  
  db.prepare(`
    INSERT INTO users (full_name, email, password, role, status)
    VALUES (?, ?, ?, 'admin', 'approved')
  `).run('System Administrator', 'ljoy23200@gmail.com', hashedPassword);
  
  console.log('✅ Admin account created with default password: admin123');
  console.log('⚠️  Please change this password immediately after first login!');
}

export default db;

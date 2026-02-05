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

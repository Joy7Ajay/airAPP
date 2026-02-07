import db from './config/db.js';

console.log('\n=== Users in Database ===\n');

const users = db.prepare('SELECT id, email, full_name, role, status, is_deleted FROM users').all();

if (users.length === 0) {
  console.log('No users found in the database.\n');
  console.log('You need to either:');
  console.log('1. Sign up through the app (will require admin approval)');
  console.log('2. Or create an admin user directly\n');
} else {
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.full_name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Status: ${user.status}`);
    console.log(`Deleted: ${user.is_deleted ? 'Yes' : 'No'}`);
    console.log('---');
  });
}

process.exit(0);

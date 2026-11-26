import 'dotenv/config';
import db from '../config/db.js';
import { hashPassword, verifyPassword } from '../middleware/auth.js';
// Explicit, one-time LOCAL DEVELOPMENT action. Does not touch legacy cafe_users.
// Existing passwords (including customized ones) will be replaced for these
// three demo usernames only. Run manually: npm run reset:demo-passwords
const accounts = [
  { username: 'admin', role: 'admin', password: 'Admin123' },
  { username: 'cashier', role: 'cashier', password: 'Cashier123' },
  { username: 'kitchen', role: 'kitchen', password: 'Kitchen123' },
];
if (process.env.NODE_ENV === 'production') {
  console.error('Demo password reset is blocked in production.');
  process.exit(1);
}
if ((process.env.DB_NAME || 'laycafedb') !== 'laycafedb') {
  console.error('Database mismatch. This package expects DB_NAME=laycafedb.');
  process.exit(1);
}
let conn;
try {
  conn = await db.getConnection();
  await conn.beginTransaction();
  const [rows] = await conn.query('SELECT id, username, role FROM users WHERE username IN (?,?,?) FOR UPDATE', accounts.map((a) => a.username));
  const byName = new Map(rows.map((row) => [row.username, row]));
  for (const account of accounts) {
    const existing = byName.get(account.username);
    if (!existing)
      throw new Error(`Missing user: ${account.username}. Run npm run seed first.`);
    if (existing.role !== account.role) {
      throw new Error(`Unexpected role for ${account.username}; refusing to reset.`);
    }
  }
  for (const account of accounts) {
    const hashed = hashPassword(account.password);
    if (!verifyPassword(account.password, hashed))
      throw new Error('Password hashing verification failed.');
    await conn.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      hashed, byName.get(account.username).id,
    ]);
  }
  await conn.commit();
  console.log('Done. Updated only the three demo accounts in laycafedb.users.');
  console.log('Login: admin / Admin123 | cashier / Cashier123 | kitchen / Kitchen123');
  console.log('Legacy laycafedb.cafe_users was NOT changed.');
  console.log('The database stores secure password hashes, not readable passwords.');
}
catch (err) {
  if (conn)
    await conn.rollback();
  console.error('Reset failed:', err.sqlMessage || err.message);
  console.error('Confirm MySQL in XAMPP is running and npm run seed completed successfully.');
  process.exitCode = 1;
}
finally {
  conn?.release();
  await db.end();
}

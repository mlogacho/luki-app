/**
 * Seed script — creates the first superadmin user.
 *
 * Usage:
 *   SEED_EMAIL=admin@example.com SEED_PASSWORD=MyP@ss node src/seed.js
 *
 * Or just run it without env vars for default demo credentials
 * (change them immediately after first login!).
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize database (creates tables if needed)
const db = require('./database');

const email = (process.env.SEED_EMAIL || '').toLowerCase().trim();
const password = process.env.SEED_PASSWORD || '';
const name = process.env.SEED_NAME || 'Super Admin';

if (!email || !password) {
  console.error(
    '\n❌ SEED_EMAIL and SEED_PASSWORD are required.\n\n' +
    'Usage:\n' +
    '  SEED_EMAIL=admin@example.com \\\n' +
    '  SEED_PASSWORD=YourSecurePass123! \\\n' +
    '  node src/seed.js\n'
  );
  process.exit(1);
}

async function seed() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log(`\n✅ User "${email}" already exists. Skipping seed.\n`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 12);
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, plan_id, must_change_password, created_at)
    VALUES (?, ?, ?, ?, 'superadmin', 'admin', 0, ?)
  `).run(id, name, email, hash, now);

  console.log('\n🌱 Superadmin created:');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log('\n⚠️  Change this password immediately after first login!\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

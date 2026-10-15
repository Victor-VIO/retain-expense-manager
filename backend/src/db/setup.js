// Creates the tables and seeds the default categories + an admin account.
// Safe to run more than once.
import bcrypt from 'bcryptjs';
import db from './client.js';

const schema = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    title TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    date TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, month)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id)',
];

const defaultCategories = [
  'Food & Dining',
  'Transport',
  'Housing & Rent',
  'Utilities',
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
];

async function setup() {
  for (const sql of schema) await db.execute(sql);

  await db.execute({
    sql: 'INSERT OR IGNORE INTO categories (name, is_default) VALUES (?, 1)',
    args: ['Uncategorized'],
  });
  for (const name of defaultCategories) {
    await db.execute({ sql: 'INSERT OR IGNORE INTO categories (name) VALUES (?)', args: [name] });
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.execute({
      sql: `INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Admin', ?, ?, 'admin')`,
      args: [ADMIN_EMAIL.toLowerCase(), hash],
    });
    console.log(`Admin account ready: ${ADMIN_EMAIL}`);
  }

  console.log('Database is set up.');
}

setup().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});

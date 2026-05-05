const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../database.sqlite');

let db;

async function initDB() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_type TEXT UNIQUE,
      template TEXT,
      default_model TEXT DEFAULT 'gemini-3.1-pro',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_id TEXT,
      issue_type TEXT,
      prompt_sent TEXT,
      model_used TEXT,
      response_received TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create default admin if not exists
  const admin = await db.get('SELECT * FROM admins WHERE username = ?', ['admin']);
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
    console.log('Default admin created: admin / admin123');
  }

  console.log('Database initialized.');
  return db;
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

module.exports = { initDB, getDB };

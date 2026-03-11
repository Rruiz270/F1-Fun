import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { calendar2025 } from '@/data/calendar-2025';

const DB_PATH = path.join(process.cwd(), 'database', 'f1fun.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player' CHECK(role IN ('player', 'admin')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      balance INTEGER NOT NULL DEFAULT 1000,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round INTEGER NOT NULL,
      name TEXT NOT NULL,
      circuit TEXT NOT NULL,
      country TEXT NOT NULL,
      qualifying_date TEXT NOT NULL,
      qualifying_time TEXT NOT NULL,
      sprint_date TEXT,
      sprint_time TEXT,
      race_date TEXT NOT NULL,
      race_time TEXT NOT NULL,
      has_sprint INTEGER NOT NULL DEFAULT 0,
      allow_late_bet INTEGER NOT NULL DEFAULT 0,
      season INTEGER NOT NULL DEFAULT 2025
    );

    CREATE TABLE IF NOT EXISTS bets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      session_type TEXT NOT NULL CHECK(session_type IN ('qualifying', 'sprint', 'race')),
      positions TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id),
      UNIQUE(user_id, event_id, session_type)
    );

    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      session_type TEXT NOT NULL CHECK(session_type IN ('qualifying', 'sprint', 'race')),
      positions TEXT NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id),
      UNIQUE(event_id, session_type)
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      session_type TEXT NOT NULL CHECK(session_type IN ('qualifying', 'sprint', 'race')),
      points INTEGER NOT NULL DEFAULT 0,
      computed_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id),
      UNIQUE(user_id, event_id, session_type)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('entry_fee', 'winnings')),
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
  `);

  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'odi.ribeiro@gmail.com';
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!adminExists) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(
      'INSERT INTO users (name, email, password_hash, role, status, balance) VALUES (?, ?, ?, ?, ?, ?)'
    ).run('Odair', adminEmail, hash, 'admin', 'approved', 1000);
  }

  // Seed events from calendar
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  if (eventCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO events (round, name, circuit, country, qualifying_date, qualifying_time,
        sprint_date, sprint_time, race_date, race_time, has_sprint, allow_late_bet, season)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction(() => {
      for (const event of calendar2025) {
        insert.run(
          event.round,
          event.name,
          event.circuit,
          event.country,
          event.qualifyingDate,
          event.qualifyingTime,
          event.sprintDate,
          event.sprintTime,
          event.raceDate,
          event.raceTime,
          event.hasSprint ? 1 : 0,
          event.allowLateBet ? 1 : 0,
          2025
        );
      }
    });
    insertMany();
  }
}

export default getDb;

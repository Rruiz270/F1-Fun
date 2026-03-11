import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';
import { setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = getDb();

    // Check max 6 players
    const playerCount = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE role = 'player'"
    ).get() as { count: number };

    if (playerCount.count >= 6) {
      return NextResponse.json({ error: 'Maximum number of players reached (6)' }, { status: 400 });
    }

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, status, balance) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, email, passwordHash, 'player', 'pending', 1000);

    await setAuthCookie({
      userId: result.lastInsertRowid as number,
      email,
      role: 'player',
      status: 'pending',
    });

    return NextResponse.json({
      message: 'Registration successful. Awaiting admin approval.',
      user: { id: result.lastInsertRowid, name, email, status: 'pending' },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

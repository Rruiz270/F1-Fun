import { NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth';
import getDb from '@/lib/db';
import { User } from '@/types';

export async function GET() {
  try {
    const auth = await getAuthCookie();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare(
      'SELECT id, name, email, role, status, balance, created_at FROM users WHERE id = ?'
    ).get(auth.userId) as Omit<User, 'password_hash'> | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

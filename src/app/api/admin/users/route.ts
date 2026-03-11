import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const db = getDb();
  const users = db.prepare(
    'SELECT id, name, email, role, status, balance, created_at FROM users ORDER BY created_at DESC'
  ).all();

  return NextResponse.json({ users });
}

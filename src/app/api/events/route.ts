import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAuth } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const db = getDb();
  const events = db.prepare('SELECT * FROM events ORDER BY round ASC').all();

  return NextResponse.json({ events });
}

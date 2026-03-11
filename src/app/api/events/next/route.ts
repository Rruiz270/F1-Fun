import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAuth } from '@/lib/middleware-auth';
import { Event } from '@/types';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const db = getDb();
  const now = new Date().toISOString().split('T')[0];

  // Get next upcoming race (race_date >= today)
  const event = db.prepare(
    'SELECT * FROM events WHERE race_date >= ? ORDER BY race_date ASC LIMIT 1'
  ).get(now) as Event | undefined;

  if (!event) {
    return NextResponse.json({ event: null, message: 'Season is over' });
  }

  return NextResponse.json({ event });
}

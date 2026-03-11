import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireApproved } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  const auth = await requireApproved(req);
  if (auth instanceof Response) return auth;

  const db = getDb();

  const eventId = req.nextUrl.searchParams.get('eventId');

  if (eventId) {
    const results = db.prepare(
      'SELECT * FROM results WHERE event_id = ?'
    ).all(eventId);
    return NextResponse.json({ results });
  }

  // Get all results with scores
  const results = db.prepare('SELECT * FROM results ORDER BY event_id ASC').all();

  const scores = db.prepare(`
    SELECT s.*, u.name as user_name
    FROM scores s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.event_id ASC
  `).all();

  const users = db.prepare(
    "SELECT id, name, balance FROM users WHERE status = 'approved' AND role = 'player'"
  ).all();

  const events = db.prepare('SELECT * FROM events ORDER BY round ASC').all();

  return NextResponse.json({ results, scores, users, events });
}

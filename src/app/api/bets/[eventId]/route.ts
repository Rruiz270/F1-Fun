import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireApproved } from '@/lib/middleware-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await requireApproved(req);
  if (auth instanceof Response) return auth;

  const { eventId } = await params;
  const db = getDb();

  // Get user's bets for this event
  const bets = db.prepare(
    'SELECT * FROM bets WHERE user_id = ? AND event_id = ?'
  ).all(auth.userId, eventId);

  // Get event info
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);

  // Get results if available
  const results = db.prepare(
    'SELECT * FROM results WHERE event_id = ?'
  ).all(eventId);

  // Get all bets for this event (for comparison after results are in)
  let allBets: unknown[] = [];
  if (results.length > 0) {
    allBets = db.prepare(`
      SELECT b.*, u.name as user_name
      FROM bets b JOIN users u ON b.user_id = u.id
      WHERE b.event_id = ?
    `).all(eventId);
  }

  return NextResponse.json({ bets, event, results, allBets });
}

import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireApproved } from '@/lib/middleware-auth';

export async function GET(req: NextRequest) {
  const auth = await requireApproved(req);
  if (auth instanceof Response) return auth;

  const db = getDb();

  // Get leaderboard (all approved players sorted by balance)
  const leaderboard = db.prepare(`
    SELECT id, name, balance
    FROM users
    WHERE status = 'approved' AND role = 'player'
    ORDER BY balance DESC
  `).all();

  // Get transactions for the requesting user
  const userId = req.nextUrl.searchParams.get('userId') || auth.userId;
  const transactions = db.prepare(`
    SELECT t.*, e.name as event_name
    FROM transactions t
    JOIN events e ON t.event_id = e.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `).all(userId);

  return NextResponse.json({ leaderboard, transactions });
}

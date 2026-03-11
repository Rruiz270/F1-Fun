import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireApproved } from '@/lib/middleware-auth';
import { Event } from '@/types';
import { drivers2025 } from '@/data/drivers-2025';

const validDriverCodes = new Set(drivers2025.map(d => d.code));

export async function POST(req: NextRequest) {
  const auth = await requireApproved(req);
  if (auth instanceof Response) return auth;

  try {
    const { eventId, sessionType, positions } = await req.json();

    // Validate session type
    if (!['qualifying', 'sprint', 'race'].includes(sessionType)) {
      return NextResponse.json({ error: 'Invalid session type' }, { status: 400 });
    }

    // Validate positions count
    const expectedCount = sessionType === 'race' ? 10 : 3;
    if (!Array.isArray(positions) || positions.length !== expectedCount) {
      return NextResponse.json(
        { error: `Must pick exactly ${expectedCount} drivers for ${sessionType}` },
        { status: 400 }
      );
    }

    // Validate driver codes
    const uniqueCodes = new Set(positions);
    if (uniqueCodes.size !== positions.length) {
      return NextResponse.json({ error: 'Duplicate drivers not allowed' }, { status: 400 });
    }
    for (const code of positions) {
      if (!validDriverCodes.has(code)) {
        return NextResponse.json({ error: `Invalid driver code: ${code}` }, { status: 400 });
      }
    }

    const db = getDb();
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as Event | undefined;

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Sprint bet only for sprint weekends
    if (sessionType === 'sprint' && !event.has_sprint) {
      return NextResponse.json({ error: 'This event has no sprint session' }, { status: 400 });
    }

    // Deadline enforcement (skip if allow_late_bet is set)
    if (!event.allow_late_bet) {
      const now = new Date();
      let sessionDate: string;
      let sessionTime: string;

      if (sessionType === 'qualifying') {
        sessionDate = event.qualifying_date;
        sessionTime = event.qualifying_time;
      } else if (sessionType === 'sprint') {
        sessionDate = event.sprint_date!;
        sessionTime = event.sprint_time!;
      } else {
        sessionDate = event.race_date;
        sessionTime = event.race_time;
      }

      const deadline = new Date(`${sessionDate}T${sessionTime}:00Z`);
      if (now >= deadline) {
        return NextResponse.json(
          { error: 'Betting deadline has passed for this session' },
          { status: 400 }
        );
      }
    }

    // Check if result already exists
    const existingResult = db.prepare(
      'SELECT id FROM results WHERE event_id = ? AND session_type = ?'
    ).get(eventId, sessionType);
    if (existingResult) {
      return NextResponse.json({ error: 'Results already posted for this session' }, { status: 400 });
    }

    // Upsert bet
    const existingBet = db.prepare(
      'SELECT id FROM bets WHERE user_id = ? AND event_id = ? AND session_type = ?'
    ).get(auth.userId, eventId, sessionType);

    const positionsJson = JSON.stringify(positions);

    if (existingBet) {
      db.prepare(
        "UPDATE bets SET positions = ?, updated_at = datetime('now') WHERE user_id = ? AND event_id = ? AND session_type = ?"
      ).run(positionsJson, auth.userId, eventId, sessionType);
    } else {
      db.prepare(
        'INSERT INTO bets (user_id, event_id, session_type, positions) VALUES (?, ?, ?, ?)'
      ).run(auth.userId, eventId, sessionType, positionsJson);
    }

    return NextResponse.json({ message: 'Bet placed successfully' });
  } catch (error) {
    console.error('Bet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireApproved(req);
  if (auth instanceof Response) return auth;

  const db = getDb();
  const bets = db.prepare(
    'SELECT * FROM bets WHERE user_id = ? ORDER BY event_id ASC'
  ).all(auth.userId);

  return NextResponse.json({ bets });
}

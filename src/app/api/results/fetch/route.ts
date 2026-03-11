import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/middleware-auth';
import { fetchQualifyingResults, fetchSprintResults, fetchRaceResults } from '@/lib/jolpica';
import { computeScores } from '@/lib/scoring';
import { distributeEventMoney } from '@/lib/money';
import { Event } from '@/types';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const { eventId, sessionType } = await req.json();

    if (!eventId || !['qualifying', 'sprint', 'race'].includes(sessionType)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const db = getDb();
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as Event | undefined;
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if results already exist
    const existing = db.prepare(
      'SELECT id FROM results WHERE event_id = ? AND session_type = ?'
    ).get(eventId, sessionType);
    if (existing) {
      return NextResponse.json({ error: 'Results already fetched for this session' }, { status: 400 });
    }

    // Fetch from Jolpica API
    let positions: string[];
    try {
      if (sessionType === 'qualifying') {
        positions = await fetchQualifyingResults(event.round, event.season);
      } else if (sessionType === 'sprint') {
        positions = await fetchSprintResults(event.round, event.season);
      } else {
        positions = await fetchRaceResults(event.round, event.season);
      }
    } catch (apiError) {
      console.error('Jolpica API error:', apiError);
      return NextResponse.json(
        { error: `Failed to fetch results from F1 API: ${(apiError as Error).message}` },
        { status: 502 }
      );
    }

    // Store results
    db.prepare(
      'INSERT INTO results (event_id, session_type, positions) VALUES (?, ?, ?)'
    ).run(eventId, sessionType, JSON.stringify(positions));

    // Compute scores
    computeScores(eventId, sessionType, positions);

    // Check if all sessions for this event have results, then distribute money
    const sessionsNeeded = event.has_sprint ? 3 : 2; // qualifying + race, or qualifying + sprint + race
    const resultCount = db.prepare(
      'SELECT COUNT(*) as count FROM results WHERE event_id = ?'
    ).get(eventId) as { count: number };

    if (resultCount.count >= sessionsNeeded) {
      distributeEventMoney(eventId);
    }

    return NextResponse.json({
      message: `Results fetched and scores computed for ${sessionType}`,
      positions: positions.slice(0, 10),
    });
  } catch (error) {
    console.error('Fetch results error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

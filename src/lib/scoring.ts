import getDb from './db';
import { Bet } from '@/types';

/**
 * Calculate points for a bet: 1 point per exact position match
 */
export function calculatePoints(betPositions: string[], actualPositions: string[]): number {
  let points = 0;
  const maxCheck = Math.min(betPositions.length, actualPositions.length);
  for (let i = 0; i < maxCheck; i++) {
    if (betPositions[i] === actualPositions[i]) {
      points += 1;
    }
  }
  return points;
}

/**
 * Compute and store scores for all bets on a given event + session
 */
export function computeScores(eventId: number, sessionType: string, actualPositions: string[]): void {
  const db = getDb();

  // Get all bets for this event + session
  const bets = db.prepare(
    'SELECT * FROM bets WHERE event_id = ? AND session_type = ?'
  ).all(eventId, sessionType) as Bet[];

  const upsertScore = db.prepare(`
    INSERT INTO scores (user_id, event_id, session_type, points)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, event_id, session_type)
    DO UPDATE SET points = excluded.points, computed_at = datetime('now')
  `);

  const transaction = db.transaction(() => {
    for (const bet of bets) {
      const betPositions: string[] = JSON.parse(bet.positions);
      const points = calculatePoints(betPositions, actualPositions);
      upsertScore.run(bet.user_id, eventId, sessionType, points);
    }
  });

  transaction();
}

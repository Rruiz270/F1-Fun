import getDb from './db';

const ENTRY_FEE = 100;

/**
 * Distribute F1 money for an event.
 * - Each player who bet pays 100 coins entry fee
 * - Total pool = N * 100
 * - Pool distributed proportionally to points scored
 * - If no one scored any points, everyone gets their entry fee back
 * - Zero-sum system
 */
export function distributeEventMoney(eventId: number): void {
  const db = getDb();

  // Check if money already distributed for this event
  const existing = db.prepare(
    'SELECT id FROM transactions WHERE event_id = ? AND type = ?'
  ).get(eventId, 'entry_fee');
  if (existing) return; // Already distributed

  // Get all unique users who bet on this event
  const bettors = db.prepare(`
    SELECT DISTINCT user_id FROM bets WHERE event_id = ?
  `).all(eventId) as { user_id: number }[];

  if (bettors.length === 0) return;

  // Get total points per user for this event (across all sessions)
  const userPoints = db.prepare(`
    SELECT user_id, SUM(points) as total_points
    FROM scores
    WHERE event_id = ?
    GROUP BY user_id
  `).all(eventId) as { user_id: number; total_points: number }[];

  const pointsMap = new Map<number, number>();
  let totalPoints = 0;
  for (const up of userPoints) {
    pointsMap.set(up.user_id, up.total_points);
    totalPoints += up.total_points;
  }

  const totalPool = bettors.length * ENTRY_FEE;

  const insertTx = db.prepare(`
    INSERT INTO transactions (user_id, event_id, amount, type, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  const updateBalance = db.prepare(
    'UPDATE users SET balance = balance + ? WHERE id = ?'
  );

  const transaction = db.transaction(() => {
    // Deduct entry fee from each bettor
    for (const bettor of bettors) {
      insertTx.run(bettor.user_id, eventId, -ENTRY_FEE, 'entry_fee', 'Event entry fee');
      updateBalance.run(-ENTRY_FEE, bettor.user_id);
    }

    // Distribute winnings
    if (totalPoints === 0) {
      // No one scored - refund everyone
      for (const bettor of bettors) {
        insertTx.run(bettor.user_id, eventId, ENTRY_FEE, 'winnings', 'No scores - refund');
        updateBalance.run(ENTRY_FEE, bettor.user_id);
      }
    } else {
      // Distribute proportionally
      let distributed = 0;
      const sortedBettors = [...bettors].sort((a, b) => {
        return (pointsMap.get(b.user_id) || 0) - (pointsMap.get(a.user_id) || 0);
      });

      for (let i = 0; i < sortedBettors.length; i++) {
        const bettor = sortedBettors[i];
        const pts = pointsMap.get(bettor.user_id) || 0;

        let winnings: number;
        if (i === sortedBettors.length - 1) {
          // Last person gets remainder to ensure zero-sum
          winnings = totalPool - distributed;
        } else {
          winnings = Math.floor((pts / totalPoints) * totalPool);
        }

        distributed += winnings;

        if (winnings > 0) {
          insertTx.run(
            bettor.user_id,
            eventId,
            winnings,
            'winnings',
            `Won ${winnings} coins (${pts}/${totalPoints} points)`
          );
          updateBalance.run(winnings, bettor.user_id);
        }
      }
    }
  });

  transaction();
}

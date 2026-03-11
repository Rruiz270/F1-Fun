'use client';

import { Event, Score } from '@/types';

interface UserScore {
  id: number;
  name: string;
  balance: number;
}

interface Props {
  events: Event[];
  scores: (Score & { user_name: string })[];
  users: UserScore[];
}

export default function StandingsTable({ events, scores, users }: Props) {
  // Build score map: userId -> eventId-sessionType -> points
  const scoreMap = new Map<number, Map<string, number>>();
  const totalPoints = new Map<number, number>();

  for (const score of scores) {
    if (!scoreMap.has(score.user_id)) {
      scoreMap.set(score.user_id, new Map());
      totalPoints.set(score.user_id, 0);
    }
    const key = `${score.event_id}-${score.session_type}`;
    scoreMap.get(score.user_id)!.set(key, score.points);
    totalPoints.set(score.user_id, (totalPoints.get(score.user_id) || 0) + score.points);
  }

  // Events that have at least one result
  const scoredEventIds = new Set(scores.map(s => s.event_id));
  const scoredEvents = events.filter(e => scoredEventIds.has(e.id));

  // Sort users by total points desc
  const sortedUsers = [...users].sort((a, b) =>
    (totalPoints.get(b.id) || 0) - (totalPoints.get(a.id) || 0)
  );

  if (scoredEvents.length === 0) {
    return (
      <div className="card-f1 text-center text-gray-500 py-8">
        No results yet. Check back after the first race!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-2 text-gray-400 sticky left-0 bg-f1-carbon z-10">Player</th>
            {scoredEvents.map(event => (
              <th key={event.id} className="text-center py-3 px-2 text-gray-400 min-w-[60px]">
                <div className="text-xs">R{event.round}</div>
              </th>
            ))}
            <th className="text-center py-3 px-2 text-f1-gold font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, idx) => (
            <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
              <td className="py-3 px-2 sticky left-0 bg-f1-carbon z-10">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs w-5 ${idx === 0 ? 'text-f1-gold' : idx === 1 ? 'text-f1-silver' : idx === 2 ? 'text-f1-bronze' : 'text-gray-500'}`}>
                    {idx + 1}
                  </span>
                  <span className="text-white font-medium">{user.name}</span>
                </div>
              </td>
              {scoredEvents.map(event => {
                const userScores = scoreMap.get(user.id);
                let eventTotal = 0;
                const sessions = ['qualifying', 'sprint', 'race'];
                for (const session of sessions) {
                  eventTotal += userScores?.get(`${event.id}-${session}`) || 0;
                }
                return (
                  <td key={event.id} className="text-center py-3 px-2">
                    <span className={`${eventTotal > 0 ? 'text-green-400 font-semibold' : 'text-gray-600'}`}>
                      {eventTotal}
                    </span>
                  </td>
                );
              })}
              <td className="text-center py-3 px-2">
                <span className="text-f1-gold font-bold" style={{ fontFamily: 'Orbitron' }}>
                  {totalPoints.get(user.id) || 0}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

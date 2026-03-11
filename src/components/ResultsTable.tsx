'use client';

import { getDriverByCode } from '@/data/drivers-2025';

interface BetWithUser {
  user_id: number;
  user_name: string;
  session_type: string;
  positions: string;
}

interface ResultData {
  session_type: string;
  positions: string;
}

interface Props {
  results: ResultData[];
  allBets: BetWithUser[];
  sessionType: string;
}

export default function ResultsTable({ results, allBets, sessionType }: Props) {
  const result = results.find(r => r.session_type === sessionType);
  if (!result) return null;

  const actualPositions: string[] = JSON.parse(result.positions);
  const sessionBets = allBets.filter(b => b.session_type === sessionType);
  const maxShow = sessionType === 'race' ? 10 : 3;

  return (
    <div className="card-f1">
      <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Orbitron' }}>
        {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Results
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-2 text-gray-400">Pos</th>
              <th className="text-left py-2 px-2 text-gray-400">Actual</th>
              {sessionBets.map(bet => (
                <th key={bet.user_id} className="text-left py-2 px-2 text-gray-400">
                  {bet.user_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actualPositions.slice(0, maxShow).map((code, idx) => {
              const driver = getDriverByCode(code);
              return (
                <tr key={idx} className="border-b border-gray-800/50">
                  <td className="py-2 px-2 text-f1-gold font-bold" style={{ fontFamily: 'Orbitron' }}>
                    P{idx + 1}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ backgroundColor: driver?.teamColor }} />
                      <span className="text-white">{driver?.name || code}</span>
                    </div>
                  </td>
                  {sessionBets.map(bet => {
                    const betPositions: string[] = JSON.parse(bet.positions);
                    const betCode = betPositions[idx];
                    const betDriver = getDriverByCode(betCode);
                    const isCorrect = betCode === code;
                    return (
                      <td key={bet.user_id} className="py-2 px-2">
                        <span className={`${isCorrect ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                          {betDriver?.name || betCode || '-'}
                          {isCorrect && ' ✓'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

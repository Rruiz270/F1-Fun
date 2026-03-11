'use client';

interface LeaderboardEntry {
  id: number;
  name: string;
  balance: number;
}

interface Transaction {
  id: number;
  event_name: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface Props {
  leaderboard: LeaderboardEntry[];
  transactions: Transaction[];
  currentUserId?: number;
}

export default function MoneyLeaderboard({ leaderboard, transactions, currentUserId }: Props) {
  return (
    <div className="space-y-8">
      {/* Leaderboard */}
      <div className="card-f1">
        <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron' }}>
          F1 Coin Rankings
        </h3>
        <div className="space-y-3">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all
                ${entry.id === currentUserId ? 'border-f1-red bg-f1-red/5' : 'border-gray-800 bg-gray-900/50'}
                ${idx === 0 ? 'glow-gold' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                ${idx === 0 ? 'bg-f1-gold text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                style={{ fontFamily: 'Orbitron' }}
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{entry.name}</p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${entry.balance >= 1000 ? 'text-green-400' : entry.balance >= 0 ? 'text-f1-gold' : 'text-f1-red'}`}
                  style={{ fontFamily: 'Orbitron' }}>
                  {entry.balance}
                </p>
                <p className="text-xs text-gray-500">F1 coins</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div className="card-f1">
          <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron' }}>
            Your Transaction History
          </h3>
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                <div>
                  <p className="text-sm text-white">{tx.event_name}</p>
                  <p className="text-xs text-gray-500">{tx.description}</p>
                </div>
                <span className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-f1-red'}`}
                  style={{ fontFamily: 'Orbitron' }}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

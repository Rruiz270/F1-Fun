'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import MoneyLeaderboard from '@/components/MoneyLeaderboard';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [userId, setUserId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/money').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([moneyData, meData]) => {
      setLeaderboard(moneyData.leaderboard || []);
      setTransactions(moneyData.transactions || []);
      setUserId(meData.user?.id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Orbitron' }}>
          F1 Money
        </h1>
        <MoneyLeaderboard
          leaderboard={leaderboard}
          transactions={transactions}
          currentUserId={userId}
        />
      </main>
    </div>
  );
}

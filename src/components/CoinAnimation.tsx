'use client';

import { useEffect, useState } from 'react';

interface Props {
  amount: number;
  show: boolean;
}

export default function CoinAnimation({ amount, show }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-slide-up">
        <div className="flex items-center gap-2 bg-f1-carbon border border-f1-gold rounded-xl px-6 py-4 glow-gold">
          <div className="animate-coin-spin">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-f1-gold to-f1-gold-dark flex items-center justify-center text-black font-bold text-lg">
              F1
            </div>
          </div>
          <span className={`text-2xl font-bold ${amount >= 0 ? 'text-green-400' : 'text-f1-red'}`}
            style={{ fontFamily: 'Orbitron' }}>
            {amount >= 0 ? '+' : ''}{amount}
          </span>
        </div>
      </div>
    </div>
  );
}

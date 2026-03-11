'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-f1-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-f1-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter" style={{ fontFamily: 'Orbitron' }}>
            <span className="text-f1-red">F1</span>
            <span className="text-white"> FUN</span>
          </h1>
          <div className="h-1 w-32 mx-auto mt-4 bg-gradient-to-r from-f1-red via-f1-gold to-f1-red rounded-full" />
        </div>

        <p className="text-xl text-gray-400 mb-2">
          The ultimate F1 prediction league
        </p>
        <p className="text-gray-500 mb-12">
          Predict qualifying, sprint, and race results. Earn F1 coins. Compete with friends.
        </p>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="card-f1 text-center">
            <p className="text-3xl font-bold text-f1-red" style={{ fontFamily: 'Orbitron' }}>24</p>
            <p className="text-xs text-gray-500 mt-1">Races</p>
          </div>
          <div className="card-f1 text-center">
            <p className="text-3xl font-bold text-f1-gold" style={{ fontFamily: 'Orbitron' }}>1000</p>
            <p className="text-xs text-gray-500 mt-1">Starting Coins</p>
          </div>
          <div className="card-f1 text-center">
            <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Orbitron' }}>6</p>
            <p className="text-xs text-gray-500 mt-1">Max Players</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-f1 text-lg px-8 py-4 text-center">
            Join the League
          </Link>
          <Link href="/login" className="btn-f1-outline text-lg px-8 py-4 text-center">
            Sign In
          </Link>
        </div>

        <div className="mt-16 text-left">
          <h2 className="text-xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Orbitron' }}>
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card-f1">
              <p className="text-f1-red font-bold text-sm mb-2" style={{ fontFamily: 'Orbitron' }}>01. PREDICT</p>
              <p className="text-gray-400 text-sm">Pick your top 3 for qualifying &amp; sprint, top 10 for the race</p>
            </div>
            <div className="card-f1">
              <p className="text-f1-gold font-bold text-sm mb-2" style={{ fontFamily: 'Orbitron' }}>02. SCORE</p>
              <p className="text-gray-400 text-sm">1 point for each exact position match</p>
            </div>
            <div className="card-f1">
              <p className="text-green-400 font-bold text-sm mb-2" style={{ fontFamily: 'Orbitron' }}>03. WIN</p>
              <p className="text-gray-400 text-sm">Win F1 coins from the pool based on your points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BetForm from '@/components/BetForm';
import { Event, Bet, Result } from '@/types';

export default function BetPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bets/${eventId}`)
      .then(r => r.json())
      .then(data => {
        setEvent(data.event);
        setBets(data.bets || []);
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [eventId]);

  const handleSubmit = async (sessionType: string, positions: string[]) => {
    const res = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: parseInt(eventId), sessionType, positions }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Refresh bets
    const refreshRes = await fetch(`/api/bets/${eventId}`);
    const refreshData = await refreshRes.json();
    setBets(refreshData.bets || []);
  };

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

  if (!event) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">Event not found</div>
        </div>
      </div>
    );
  }

  const getBetPositions = (sessionType: string): string[] | undefined => {
    const bet = bets.find(b => b.session_type === sessionType);
    return bet ? JSON.parse(bet.positions) : undefined;
  };

  const isSessionClosed = (sessionType: string): boolean => {
    if (event.allow_late_bet) return false;
    const now = new Date();
    let date: string, time: string;
    if (sessionType === 'qualifying') {
      date = event.qualifying_date;
      time = event.qualifying_time;
    } else if (sessionType === 'sprint') {
      date = event.sprint_date!;
      time = event.sprint_time!;
    } else {
      date = event.race_date;
      time = event.race_time;
    }
    return now >= new Date(`${date}T${time}:00Z`);
  };

  const hasResult = (sessionType: string): boolean => {
    return results.some(r => r.session_type === sessionType);
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-1 text-sm"
        >
          &larr; Back to Dashboard
        </button>

        <div className="mb-8">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Round {event.round}</span>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
            {event.name}
          </h1>
          <p className="text-gray-400 mt-1">{event.circuit}</p>
          {event.allow_late_bet ? (
            <span className="inline-block mt-2 px-3 py-1 bg-green-900/50 text-green-400 text-xs font-bold rounded">
              LATE BETS ALLOWED
            </span>
          ) : null}
        </div>

        <div className="space-y-8">
          {/* Qualifying */}
          <BetForm
            event={event}
            sessionType="qualifying"
            existingBet={getBetPositions('qualifying')}
            onSubmit={(positions) => handleSubmit('qualifying', positions)}
            disabled={isSessionClosed('qualifying') || hasResult('qualifying')}
            disabledReason={hasResult('qualifying') ? 'Results already posted' : 'Session has started'}
          />

          {/* Sprint (if applicable) */}
          {event.has_sprint ? (
            <BetForm
              event={event}
              sessionType="sprint"
              existingBet={getBetPositions('sprint')}
              onSubmit={(positions) => handleSubmit('sprint', positions)}
              disabled={isSessionClosed('sprint') || hasResult('sprint')}
              disabledReason={hasResult('sprint') ? 'Results already posted' : 'Session has started'}
            />
          ) : null}

          {/* Race */}
          <BetForm
            event={event}
            sessionType="race"
            existingBet={getBetPositions('race')}
            onSubmit={(positions) => handleSubmit('race', positions)}
            disabled={isSessionClosed('race') || hasResult('race')}
            disabledReason={hasResult('race') ? 'Results already posted' : 'Session has started'}
          />
        </div>
      </main>
    </div>
  );
}

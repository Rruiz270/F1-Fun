'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { Event, Bet } from '@/types';

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(r => r.json()),
      fetch('/api/bets').then(r => r.json()),
      fetch('/api/events/next').then(r => r.json()),
    ]).then(([eventsData, betsData, nextData]) => {
      setEvents(eventsData.events || []);
      setBets(betsData.bets || []);
      setNextEvent(nextData.event || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Build bet status map
  const betMap = new Map<number, { qualifying?: boolean; sprint?: boolean; race?: boolean }>();
  for (const bet of bets) {
    if (!betMap.has(bet.event_id)) betMap.set(bet.event_id, {});
    const entry = betMap.get(bet.event_id)!;
    entry[bet.session_type as 'qualifying' | 'sprint' | 'race'] = true;
  }

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

  // Split events into upcoming and past
  const now = new Date();
  const upcoming = events.filter(e => new Date(`${e.race_date}T${e.race_time}:00Z`) >= now || e.allow_late_bet);
  const past = events.filter(e => new Date(`${e.race_date}T${e.race_time}:00Z`) < now && !e.allow_late_bet);

  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Next race highlight */}
        {nextEvent && (
          <div className="mb-8 card-f1 border-f1-red/50 glow-red">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
              <span className="text-xs text-f1-red uppercase tracking-wider font-bold" style={{ fontFamily: 'Orbitron' }}>
                Next Race
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
              {nextEvent.name}
            </h2>
            <p className="text-gray-400 mt-1">{nextEvent.circuit} - Round {nextEvent.round}</p>
            <p className="text-gray-500 text-sm mt-1">
              Race: {new Date(nextEvent.race_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}

        {/* Upcoming events */}
        <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron' }}>
          Upcoming Races
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {upcoming.map(event => (
            <EventCard key={event.id} event={event} hasBet={betMap.get(event.id)} />
          ))}
        </div>

        {/* Past events */}
        {past.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-500 mb-4" style={{ fontFamily: 'Orbitron' }}>
              Past Races
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {past.map(event => (
                <EventCard key={event.id} event={event} hasBet={betMap.get(event.id)} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

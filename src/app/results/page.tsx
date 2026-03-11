'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StandingsTable from '@/components/StandingsTable';
import ResultsTable from '@/components/ResultsTable';
import { Event, Score, Result } from '@/types';

interface UserScore {
  id: number;
  name: string;
  balance: number;
}

export default function ResultsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [scores, setScores] = useState<(Score & { user_name: string })[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [users, setUsers] = useState<UserScore[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [eventBets, setEventBets] = useState<{ user_id: number; user_name: string; session_type: string; positions: string }[]>([]);
  const [eventResults, setEventResults] = useState<{ session_type: string; positions: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/results')
      .then(r => r.json())
      .then(data => {
        setEvents(data.events || []);
        setScores(data.scores || []);
        setResults(data.results || []);
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectEvent = async (eventId: number) => {
    setSelectedEvent(eventId);
    try {
      const res = await fetch(`/api/bets/${eventId}`);
      const data = await res.json();
      setEventBets(data.allBets || []);
      setEventResults(data.results || []);
    } catch {
      // ignore
    }
  };

  const eventsWithResults = events.filter(e =>
    results.some(r => r.event_id === e.id)
  );

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Orbitron' }}>
          Season Standings
        </h1>

        {/* Standings matrix */}
        <div className="card-f1 mb-8 overflow-hidden">
          <StandingsTable events={events} scores={scores} users={users} />
        </div>

        {/* Event detail selector */}
        <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron' }}>
          Event Details
        </h2>

        {eventsWithResults.length === 0 ? (
          <div className="card-f1 text-center text-gray-500 py-8">
            No results available yet
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {eventsWithResults.map(event => (
                <button
                  key={event.id}
                  onClick={() => handleSelectEvent(event.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${selectedEvent === event.id
                      ? 'bg-f1-red text-white'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
                >
                  R{event.round}
                </button>
              ))}
            </div>

            {selectedEvent && eventResults.length > 0 && (
              <div className="space-y-4">
                {['qualifying', 'sprint', 'race'].map(sessionType => {
                  if (!eventResults.find(r => r.session_type === sessionType)) return null;
                  return (
                    <ResultsTable
                      key={sessionType}
                      results={eventResults}
                      allBets={eventBets}
                      sessionType={sessionType}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

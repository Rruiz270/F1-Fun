'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Event } from '@/types';

interface UserEntry {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  created_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [results, setResults] = useState<{ event_id: number; session_type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingResult, setFetchingResult] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, eventsRes, resultsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/events'),
        fetch('/api/results'),
      ]);
      const usersData = await usersRes.json();
      const eventsData = await eventsRes.json();
      const resultsData = await resultsRes.json();
      setUsers(usersData.users || []);
      setEvents(eventsData.events || []);
      setResults(resultsData.results || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`User ${action}d successfully`);
      loadData();
    } catch (err) {
      setMessage((err as Error).message);
    }
  };

  const handleFetchResult = async (eventId: number, sessionType: string) => {
    const key = `${eventId}-${sessionType}`;
    setFetchingResult(key);
    setMessage('');
    try {
      const res = await fetch('/api/results/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, sessionType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`Results fetched for ${sessionType}: ${data.positions?.join(', ')}`);
      loadData();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setFetchingResult(null);
    }
  };

  const hasResult = (eventId: number, sessionType: string) => {
    return results.some(r => r.event_id === eventId && r.session_type === sessionType);
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

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');

  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Orbitron' }}>
          Admin Panel
        </h1>

        {message && (
          <div className="mb-6 card-f1 border-f1-gold/30 text-f1-gold text-sm">
            {message}
          </div>
        )}

        {/* User Management */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron' }}>
            User Management
          </h2>

          {pendingUsers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-f1-gold uppercase tracking-wider mb-3">
                Pending Approval ({pendingUsers.length})
              </h3>
              <div className="space-y-3">
                {pendingUsers.map(user => (
                  <div key={user.id} className="card-f1 flex items-center justify-between border-f1-gold/30">
                    <div>
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(user.id, 'approve')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprove(user.id, 'reject')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            All Users ({approvedUsers.length} approved)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400">Name</th>
                  <th className="text-left py-2 px-3 text-gray-400">Email</th>
                  <th className="text-left py-2 px-3 text-gray-400">Role</th>
                  <th className="text-left py-2 px-3 text-gray-400">Status</th>
                  <th className="text-right py-2 px-3 text-gray-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-800/50">
                    <td className="py-2 px-3 text-white">{user.name}</td>
                    <td className="py-2 px-3 text-gray-400">{user.email}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-f1-red/20 text-f1-red' : 'bg-blue-900/30 text-blue-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold
                        ${user.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                          user.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-f1-gold font-bold" style={{ fontFamily: 'Orbitron' }}>
                      {user.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Results Fetch */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron' }}>
            Fetch Results
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Click to fetch results from the Jolpica F1 API. Scores will be computed automatically.
          </p>

          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="card-f1">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-gray-500">Round {event.round}</span>
                    <h3 className="text-white font-semibold">{event.name}</h3>
                  </div>
                  {event.has_sprint ? (
                    <span className="px-2 py-1 bg-f1-gold/20 text-f1-gold text-xs font-bold rounded">SPRINT</span>
                  ) : null}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['qualifying', 'sprint', 'race'].map(session => {
                    if (session === 'sprint' && !event.has_sprint) return null;
                    const done = hasResult(event.id, session);
                    const isFetching = fetchingResult === `${event.id}-${session}`;
                    return (
                      <button
                        key={session}
                        onClick={() => handleFetchResult(event.id, session)}
                        disabled={done || isFetching}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors
                          ${done
                            ? 'bg-green-900/30 text-green-400 cursor-default'
                            : isFetching
                              ? 'bg-gray-700 text-gray-400 cursor-wait'
                              : 'bg-gray-800 text-gray-300 hover:bg-f1-red hover:text-white'}`}
                      >
                        {done ? `${session} ✓` : isFetching ? 'Fetching...' : `Fetch ${session}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

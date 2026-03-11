'use client';

import { Event } from '@/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Props {
  event: Event;
  hasBet?: { qualifying?: boolean; sprint?: boolean; race?: boolean };
}

function getCountdown(targetDate: string, targetTime: string): string {
  const target = new Date(`${targetDate}T${targetTime}:00Z`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const countryFlags: Record<string, string> = {
  'Australia': '🇦🇺', 'China': '🇨🇳', 'Japan': '🇯🇵', 'Bahrain': '🇧🇭',
  'Saudi Arabia': '🇸🇦', 'USA': '🇺🇸', 'Italy': '🇮🇹', 'Monaco': '🇲🇨',
  'Spain': '🇪🇸', 'Canada': '🇨🇦', 'Austria': '🇦🇹', 'United Kingdom': '🇬🇧',
  'Belgium': '🇧🇪', 'Hungary': '🇭🇺', 'Netherlands': '🇳🇱', 'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Qatar': '🇶🇦',
  'Abu Dhabi': '🇦🇪',
};

export default function EventCard({ event, hasBet }: Props) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    setCountdown(getCountdown(event.race_date, event.race_time));
    const interval = setInterval(() => {
      setCountdown(getCountdown(event.race_date, event.race_time));
    }, 60000);
    return () => clearInterval(interval);
  }, [event.race_date, event.race_time]);

  const flag = countryFlags[event.country] || '🏁';
  const isPast = new Date(`${event.race_date}T${event.race_time}:00Z`) < new Date();

  return (
    <div className={`card-f1 transition-all hover:border-f1-red/50 ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Round {event.round}</span>
          <h3 className="text-lg font-bold text-white mt-1">
            {flag} {event.name}
          </h3>
          <p className="text-sm text-gray-400">{event.circuit}</p>
        </div>
        {event.has_sprint ? (
          <span className="px-2 py-1 bg-f1-gold/20 text-f1-gold text-xs font-bold rounded">
            SPRINT
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span>Race: {new Date(event.race_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        {!isPast && <span className="text-f1-red font-semibold">{countdown}</span>}
      </div>

      {/* Bet status indicators */}
      <div className="flex gap-2 mb-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${hasBet?.qualifying ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
          Q {hasBet?.qualifying ? '✓' : '○'}
        </span>
        {event.has_sprint ? (
          <span className={`px-2 py-1 rounded text-xs font-medium ${hasBet?.sprint ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
            S {hasBet?.sprint ? '✓' : '○'}
          </span>
        ) : null}
        <span className={`px-2 py-1 rounded text-xs font-medium ${hasBet?.race ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
          R {hasBet?.race ? '✓' : '○'}
        </span>
      </div>

      {!isPast || event.allow_late_bet ? (
        <Link href={`/bet/${event.id}`} className="btn-f1 block text-center text-sm">
          {hasBet?.qualifying || hasBet?.race ? 'Edit Bets' : 'Place Bets'}
        </Link>
      ) : (
        <span className="block text-center text-gray-500 text-sm py-3">Race completed</span>
      )}
    </div>
  );
}

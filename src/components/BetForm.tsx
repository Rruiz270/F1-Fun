'use client';

import { useState } from 'react';
import { Event } from '@/types';
import DriverSelector from './DriverSelector';

interface Props {
  event: Event;
  sessionType: 'qualifying' | 'sprint' | 'race';
  existingBet?: string[];
  onSubmit: (positions: string[]) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

export default function BetForm({ event, sessionType, existingBet, onSubmit, disabled, disabledReason }: Props) {
  const [positions, setPositions] = useState<string[]>(existingBet || []);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const maxPositions = sessionType === 'race' ? 10 : 3;
  const sessionLabel = sessionType === 'qualifying' ? 'Qualifying Top 3' : sessionType === 'sprint' ? 'Sprint Top 3' : 'Race Top 10';

  const handleSubmit = async () => {
    if (positions.length !== maxPositions) {
      setMessage(`Please select exactly ${maxPositions} drivers`);
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await onSubmit(positions);
      setMessage('Bet saved successfully!');
    } catch (err) {
      setMessage((err as Error).message || 'Failed to save bet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-f1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
          {sessionLabel}
        </h3>
        {event.allow_late_bet ? (
          <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-bold rounded">
            LATE BET OK
          </span>
        ) : null}
      </div>

      {disabled ? (
        <p className="text-gray-500 text-center py-4">{disabledReason || 'Betting closed'}</p>
      ) : (
        <>
          <DriverSelector
            selectedDrivers={positions}
            onSelect={setPositions}
            maxPositions={maxPositions}
          />
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={submitting || positions.length !== maxPositions}
              className="btn-f1 flex-1"
            >
              {submitting ? 'Saving...' : existingBet ? 'Update Bet' : 'Place Bet'}
            </button>
          </div>
        </>
      )}

      {message && (
        <p className={`mt-3 text-sm text-center ${message.includes('success') ? 'text-green-400' : 'text-f1-red'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

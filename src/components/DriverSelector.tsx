'use client';

import { drivers2025 } from '@/data/drivers-2025';
import { Driver } from '@/types';

interface Props {
  selectedDrivers: string[];
  onSelect: (drivers: string[]) => void;
  maxPositions: number;
  disabled?: boolean;
}

export default function DriverSelector({ selectedDrivers, onSelect, maxPositions, disabled }: Props) {
  const handleToggle = (code: string) => {
    if (disabled) return;

    const idx = selectedDrivers.indexOf(code);
    if (idx >= 0) {
      // Remove driver
      onSelect(selectedDrivers.filter(c => c !== code));
    } else if (selectedDrivers.length < maxPositions) {
      // Add driver
      onSelect([...selectedDrivers, code]);
    }
  };

  const handleReorder = (fromIdx: number, toIdx: number) => {
    if (disabled) return;
    const newOrder = [...selectedDrivers];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    onSelect(newOrder);
  };

  // Group drivers by team
  const teams = new Map<string, Driver[]>();
  for (const driver of drivers2025) {
    const list = teams.get(driver.team) || [];
    list.push(driver);
    teams.set(driver.team, list);
  }

  return (
    <div className="space-y-6">
      {/* Selected order */}
      {selectedDrivers.length > 0 && (
        <div className="card-f1 border-f1-red/30">
          <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
            Your Picks ({selectedDrivers.length}/{maxPositions})
          </h4>
          <div className="space-y-2">
            {selectedDrivers.map((code, idx) => {
              const driver = drivers2025.find(d => d.code === code)!;
              return (
                <div
                  key={code}
                  className="flex items-center gap-3 bg-gray-900 rounded-lg px-3 py-2"
                >
                  <span className="text-f1-gold font-bold w-6 text-center" style={{ fontFamily: 'Orbitron' }}>
                    P{idx + 1}
                  </span>
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: driver.teamColor }}
                  />
                  <span className="text-white font-medium flex-1">
                    {driver.name}
                  </span>
                  <span className="text-gray-500 text-xs">{driver.code}</span>
                  {!disabled && (
                    <div className="flex gap-1">
                      {idx > 0 && (
                        <button
                          onClick={() => handleReorder(idx, idx - 1)}
                          className="text-gray-500 hover:text-white p-1"
                        >
                          ▲
                        </button>
                      )}
                      {idx < selectedDrivers.length - 1 && (
                        <button
                          onClick={() => handleReorder(idx, idx + 1)}
                          className="text-gray-500 hover:text-white p-1"
                        >
                          ▼
                        </button>
                      )}
                      <button
                        onClick={() => handleToggle(code)}
                        className="text-gray-500 hover:text-f1-red p-1 ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Driver grid */}
      {!disabled && (
        <div className="space-y-4">
          {Array.from(teams.entries()).map(([teamName, teamDrivers]) => (
            <div key={teamName}>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{teamName}</h4>
              <div className="grid grid-cols-2 gap-2">
                {teamDrivers.map(driver => {
                  const isSelected = selectedDrivers.includes(driver.code);
                  const isFull = selectedDrivers.length >= maxPositions;

                  return (
                    <button
                      key={driver.code}
                      onClick={() => handleToggle(driver.code)}
                      disabled={!isSelected && isFull}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left
                        ${isSelected
                          ? 'border-f1-red bg-f1-red/10 text-white'
                          : isFull
                            ? 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                            : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-600'
                        }`}
                    >
                      <div
                        className="w-1 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: driver.teamColor }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{driver.name}</div>
                        <div className="text-xs text-gray-500">#{driver.number}</div>
                      </div>
                      {isSelected && (
                        <span className="ml-auto text-f1-red text-xs font-bold">
                          P{selectedDrivers.indexOf(driver.code) + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

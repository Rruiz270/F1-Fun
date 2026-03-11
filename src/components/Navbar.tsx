'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  balance: number;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setUser(data.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="racing-stripe bg-f1-carbon/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 pt-1">
          {/* Logo */}
          <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <span className="text-f1-red font-bold text-xl" style={{ fontFamily: 'Orbitron' }}>
              F1
            </span>
            <span className="text-white font-semibold text-lg" style={{ fontFamily: 'Orbitron' }}>
              FUN
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {isAdmin ? (
              <Link href="/admin" className="text-gray-300 hover:text-f1-red transition-colors">
                Admin Panel
              </Link>
            ) : (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-f1-red transition-colors">
                  Dashboard
                </Link>
                <Link href="/results" className="text-gray-300 hover:text-f1-red transition-colors">
                  Results
                </Link>
                <Link href="/leaderboard" className="text-gray-300 hover:text-f1-red transition-colors">
                  Leaderboard
                </Link>
              </>
            )}

            {user && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
                {!isAdmin && (
                  <span className="text-f1-gold font-semibold">
                    {user.balance} coins
                  </span>
                )}
                <span className="text-gray-400 text-sm">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-f1-red text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAdmin ? (
              <Link href="/admin" className="block py-2 text-gray-300 hover:text-f1-red" onClick={() => setMenuOpen(false)}>
                Admin Panel
              </Link>
            ) : (
              <>
                <Link href="/dashboard" className="block py-2 text-gray-300 hover:text-f1-red" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/results" className="block py-2 text-gray-300 hover:text-f1-red" onClick={() => setMenuOpen(false)}>
                  Results
                </Link>
                <Link href="/leaderboard" className="block py-2 text-gray-300 hover:text-f1-red" onClick={() => setMenuOpen(false)}>
                  Leaderboard
                </Link>
              </>
            )}
            {user && (
              <div className="pt-2 border-t border-gray-700">
                {!isAdmin && (
                  <p className="text-f1-gold font-semibold py-1">{user.balance} coins</p>
                )}
                <p className="text-gray-400 text-sm py-1">{user.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-f1-red text-sm py-1"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

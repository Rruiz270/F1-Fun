'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user?.status === 'approved') {
        router.push('/dashboard');
      } else if (data.user?.status === 'rejected') {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card-f1 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-f1-gold/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-f1-gold animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron' }}>
          Awaiting Approval
        </h1>
        <p className="text-gray-400 mb-6">
          Your registration is pending admin approval. Odair will review your request shortly.
        </p>

        <button
          onClick={checkStatus}
          disabled={checking}
          className="btn-f1-outline w-full"
        >
          {checking ? 'Checking...' : 'Check Status'}
        </button>
      </div>
    </div>
  );
}

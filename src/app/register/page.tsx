'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Try to send EmailJS notification (client-side, non-blocking)
      try {
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
        if (serviceId && templateId && publicKey && serviceId !== 'your_service_id') {
          const emailjs = await import('@emailjs/browser');
          await emailjs.send(serviceId, templateId, {
            player_name: form.name,
            player_email: form.email,
            to_email: 'odi.ribeiro@gmail.com',
            app_url: process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
          }, publicKey);
        }
      } catch {
        // EmailJS failure is non-critical
      }

      router.push('/pending');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black" style={{ fontFamily: 'Orbitron' }}>
            <span className="text-f1-red">F1</span> <span className="text-white">FUN</span>
          </h1>
          <p className="text-gray-400 mt-2">Join the prediction league</p>
        </div>

        <form onSubmit={handleSubmit} className="card-f1 space-y-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Orbitron' }}>Register</h2>

          {error && (
            <div className="bg-f1-red/10 border border-f1-red/30 text-f1-red text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              required
              className="input-f1"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="input-f1"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-f1"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-f1 w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-f1-red hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

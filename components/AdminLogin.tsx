'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Re-run the server component so it picks up the new cookie and
        // swaps the login form for the panel — no full navigation needed.
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-[32px] border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md"
    >
      <h1 className="text-center text-xl font-black uppercase italic tracking-tight text-white">Admin</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Master password"
        required
        autoFocus
        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 disabled:opacity-60"
      >
        {loading ? 'Checking…' : 'Log in'}
      </button>
      {error && <p className="text-center text-sm text-red-400">Wrong password.</p>}
    </form>
  );
}

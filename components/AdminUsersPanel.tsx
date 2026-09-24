'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Entry = { email: string; passwordHash: string; addedAt: string };

export default function AdminUsersPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { users: Entry[] }) => setUsers(data.users))
      .catch(() => setError('Failed to load the current user list.'))
      .finally(() => setLoaded(true));
  }, []);

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      const res = await fetch('/api/admin/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error();
      const entry: Entry = await res.json();
      setUsers((prev) => [...prev.filter((u) => u.email.toLowerCase() !== entry.email.toLowerCase()), entry]);
      setEmail('');
      setPassword('');
    } catch {
      setError('Failed to add user.');
    } finally {
      setAdding(false);
    }
  }

  function handleRemove(targetEmail: string) {
    setUsers((prev) => prev.filter((u) => u.email !== targetEmail));
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  // What actually ends up in CLIENT_USERS — removing an entry here only
  // takes effect once this JSON is copied into Vercel; there's no database
  // to delete from.
  const json = JSON.stringify(
    users.map(({ email, passwordHash, addedAt }) => ({ email, passwordHash, addedAt })),
    null,
    2,
  );

  return (
    <div className="w-full max-w-2xl space-y-6 rounded-[32px] border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Client users</h1>
        <button
          onClick={handleLogout}
          className="text-xs font-bold uppercase tracking-widest text-slate-400 transition hover:text-blue-400"
        >
          Log out
        </button>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@company.com"
          className="w-full flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3.5 text-sm text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <input
          type="text"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          className="w-full flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3.5 text-sm text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button
          type="submit"
          disabled={adding}
          className="flex-shrink-0 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 disabled:opacity-60"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="space-y-2">
        {!loaded ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No users yet.</p>
        ) : (
          users.map((u) => (
            <div
              key={u.email}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 px-4 py-3 text-sm"
            >
              <div>
                <p className="text-white">{u.email}</p>
                <p className="text-xs text-slate-500">Added {new Date(u.addedAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleRemove(u.email)}
                className="text-xs font-bold uppercase tracking-widest text-red-400 transition hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          CLIENT_USERS — copy into Vercel → Settings → Environment Variables
        </label>
        <textarea
          readOnly
          value={json}
          rows={8}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-xs text-slate-300 focus:outline-none"
        />
      </div>
    </div>
  );
}

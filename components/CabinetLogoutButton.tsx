'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CabinetLogoutButton({ locale }: { locale: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/logout', { method: 'POST' });
    router.push(`/${locale}/login`);
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full rounded-2xl border border-white/10 py-4 text-sm font-black uppercase tracking-widest text-slate-300 transition-all hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-60"
    >
      Logout
    </button>
  );
}

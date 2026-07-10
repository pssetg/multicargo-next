'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type Gtag = (...args: unknown[]) => void;

export default function CookieBanner() {
  const t = useTranslations('Cookie');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function decide(consent: 'accepted' | 'declined') {
    localStorage.setItem('cookieConsent', consent);
    setShow(false);
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: consent === 'accepted' ? 'granted' : 'denied',
      });
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[99999] border-t border-white/[0.08] bg-[#030712]/[0.97] px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
        <p className="min-w-[200px] flex-1 text-[13px] text-slate-400">{t('text')}</p>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={() => decide('accepted')}
            className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-blue-500"
          >
            {t('accept')}
          </button>
          <button
            onClick={() => decide('declined')}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500 transition-colors hover:text-white"
          >
            {t('decline')}
          </button>
        </div>
      </div>
    </div>
  );
}

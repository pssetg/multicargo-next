'use client';

import { OPEN_COOKIE_BANNER_EVENT } from '@/lib/consent';

/** Footer link that shows the cookie banner again so the visitor can change their choice. */
export default function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_BANNER_EVENT))}
      className="inline-flex min-h-[44px] items-center font-bold uppercase tracking-widest transition hover:text-white"
    >
      {label}
    </button>
  );
}

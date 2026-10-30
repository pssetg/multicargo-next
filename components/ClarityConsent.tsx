'use client';

import { useEffect } from 'react';

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

const CONSENT_KEY = 'cookieConsent';
const CONSENT_EVENT = 'multicargo:cookieConsent';

/**
 * Loads Microsoft Clarity only with the visitor's consent:
 *  - already accepted on a previous visit → load after hydration;
 *  - accepted in the cookie banner now → load immediately;
 *  - declined / not decided → never loaded (no request to clarity.ms, no cookies);
 *  - consent withdrawn after Clarity was loaded → clarity("consent", false).
 */
export default function ClarityConsent({ clarityId }: { clarityId: string }) {
  useEffect(() => {
    const w = window as unknown as { clarity?: ClarityFn; [key: string]: unknown };
    let loaded = false;

    function load() {
      if (loaded) return;
      loaded = true;
      w.clarity =
        w.clarity ||
        (function (...args: unknown[]) {
          const fn = w.clarity as ClarityFn;
          (fn.q = fn.q || []).push(args);
        } as ClarityFn);
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${clarityId}`;
      document.head.appendChild(script);
    }

    function apply(consent: string | null) {
      if (consent === 'accepted') {
        load();
      } else if (loaded && typeof w.clarity === 'function') {
        // Consent withdrawn: tell Clarity to stop and drop its cookies.
        w.clarity('consent', false);
      }
    }

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(CONSENT_KEY);
    } catch {
      // storage unavailable → treat as no consent
    }
    apply(stored);

    const onChange = (e: Event) => apply((e as CustomEvent<string>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, [clarityId]);

  return null;
}

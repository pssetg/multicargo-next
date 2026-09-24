'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';

// Opened from anywhere via the same CustomEvent pattern ChatAgent already
// uses for `multicargo:openChat` — Nav's "Login" button just dispatches
// `multicargo:openLogin` instead of navigating to a /login route.
export default function LoginModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('multicargo:openLogin', onOpen);
    return () => window.removeEventListener('multicargo:openLogin', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);

    // Lock background scroll while the modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-6"
      onClick={() => setOpen(false)}
    >
      {/* Stop propagation so clicks inside the card don't bubble to the
          overlay and close the modal. */}
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <LoginForm />
      </div>
    </div>
  );
}

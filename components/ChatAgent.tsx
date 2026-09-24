'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';

// Only the heavy chat window (message history, API calls) is code-split.
// The trigger button below is rendered eagerly (not behind next/dynamic) so
// it's clickable the instant the page hydrates — see the "first click does
// nothing" fix: previously the whole widget, including this button, was
// loaded via dynamic(..., { ssr: false }), which left a window after paint
// where the button didn't exist in the DOM yet. A click landing in that
// window silently missed, and only the next click (after the chunk had
// finished loading) actually opened the chat.
const ChatWindow = dynamic(() => import('./ChatWindow'), { ssr: false });

const COOKIE_BANNER_ID = 'cookie-banner';

export default function ChatAgent() {
  const t = useTranslations('ChatAgent');
  const [open, setOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');
  const [bannerOffset, setBannerOffset] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Listen for the Hero Smart Console "Calculate" button
  useEffect(() => {
    function onOpen(e: Event) {
      setOpen(true);
      const q = (e as CustomEvent<string>).detail?.trim();
      if (q) setPendingQuery(q);
    }
    window.addEventListener('multicargo:openChat', onOpen as EventListener);
    return () => window.removeEventListener('multicargo:openChat', onOpen as EventListener);
  }, []);

  // Close the chat window with Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Track the cookie banner's height so the bubble/window can lift above it
  // instead of being covered — the banner can wrap onto multiple lines on
  // narrow/mobile viewports, so its height is measured, not assumed.
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    function attach(el: HTMLElement) {
      setBannerOffset(el.getBoundingClientRect().height);
      resizeObserver = new ResizeObserver(([entry]) => {
        setBannerOffset(entry.contentRect.height);
      });
      resizeObserver.observe(el);
    }

    function detach() {
      resizeObserver?.disconnect();
      resizeObserver = null;
      setBannerOffset(0);
    }

    const existing = document.getElementById(COOKIE_BANNER_ID);
    if (existing) attach(existing);

    const mutationObserver = new MutationObserver(() => {
      const banner = document.getElementById(COOKIE_BANNER_ID);
      if (banner && !resizeObserver) attach(banner);
      else if (!banner && resizeObserver) detach();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);

  // Mobile only: hide the bubble while the on-screen keyboard is likely open
  // (any text field elsewhere on the page is focused), so it doesn't sit on
  // top of the keyboard or the field being edited.
  useEffect(() => {
    const isTextField = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

    function onFocusIn(e: FocusEvent) {
      if (window.matchMedia('(max-width: 767px)').matches && isTextField(e.target)) {
        setKeyboardOpen(true);
      }
    }
    function onFocusOut(e: FocusEvent) {
      if (isTextField(e.target)) setKeyboardOpen(false);
    }

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return (
    <>
      {/* Bubble */}
      {!open && !keyboardOpen && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t('title')}
          className="fixed right-6 z-[9999] h-[52px] w-[52px] cursor-pointer transition-[bottom] duration-200 md:h-[60px] md:w-[60px]"
          style={{ bottom: `calc(max(24px, env(safe-area-inset-bottom) + 16px) + ${bannerOffset}px)` }}
        >
          <span className="mc-ping absolute inset-0 rounded-full bg-blue-600/40" />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-blue-600 shadow-[0_0_32px_rgba(37,99,235,0.6)]">
            <MessageSquare className="h-7 w-7 text-white" strokeWidth={1.75} />
          </span>
          <span className="absolute right-[3px] top-[3px] h-3.5 w-3.5 rounded-full border-[2.5px] border-[#030712] bg-green-500" />
        </button>
      )}

      {/* Window */}
      {open && (
        <ChatWindow
          pendingQuery={pendingQuery}
          onQueryConsumed={() => setPendingQuery('')}
          onClose={() => setOpen(false)}
          bottomOffset={bannerOffset}
        />
      )}
    </>
  );
}

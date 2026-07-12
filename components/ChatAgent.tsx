'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MessageSquare, Send, X } from 'lucide-react';
import { WHATSAPP_URL, TELEGRAM_URL } from '@/lib/links';

type Message = { role: 'user' | 'assistant'; content: string };

/** Escape HTML, then apply **bold** and newline formatting */
function formatText(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

function Logo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-600 to-cyan-500"
      style={{ width: size, height: size }}
    >
      <span className="font-black text-white" style={{ fontSize: size * 0.47 }}>
        M
      </span>
    </div>
  );
}

export default function ChatAgent() {
  const t = useTranslations('ChatAgent');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Always-current copy of `messages` so sendMessage can read it synchronously
  const messagesRef = useRef<Message[]>([]);

  // Seed the greeting once
  useEffect(() => {
    setMessages([{ role: 'assistant', content: t('greeting') }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setLoading(true);
      // Build the new history synchronously from the ref (not from a setState
      // updater, whose result isn't available in this scope yet).
      const history: Message[] = [...messagesRef.current, { role: 'user', content: trimmed }];
      messagesRef.current = history;
      setMessages(history);

      // Anthropic requires the conversation to start with a `user` turn, so
      // drop the leading assistant greeting before sending.
      const firstUser = history.findIndex((m) => m.role === 'user');
      const apiMessages = firstUser >= 0 ? history.slice(firstUser) : history;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, language: locale }),
        });
        const data = await res.json();
        const reply = data.reply ?? data.error ?? t('error');
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      } catch {
        setMessages((prev) => [...prev, { role: 'assistant', content: t('error') }]);
      } finally {
        setLoading(false);
      }
    },
    [loading, locale, t],
  );

  // Listen for the Hero Smart Console "Calculate" button
  useEffect(() => {
    function onOpen(e: Event) {
      setOpen(true);
      const q = (e as CustomEvent<string>).detail?.trim();
      if (q) setTimeout(() => sendMessage(q), 600);
    }
    window.addEventListener('multicargo:openChat', onOpen as EventListener);
    return () => window.removeEventListener('multicargo:openChat', onOpen as EventListener);
  }, [sendMessage]);

  // Close the chat window with Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
      setInput('');
    }
  }

  return (
    <>
      {/* Bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t('title')}
          className="fixed bottom-6 right-6 z-[9999] h-[60px] w-[60px] cursor-pointer"
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
        <div className="fixed bottom-6 right-6 z-[9999] flex h-[520px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Logo />
              <div>
                <p className="text-[13px] font-bold leading-tight text-white">{t('title')}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-green-500">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  {t('status')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white"
              >
                {t('whatsapp')}
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-blue-400"
              >
                {t('telegram')}
              </a>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex items-center p-1 text-slate-500 transition-colors hover:text-white"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto scroll-smooth px-4 py-3.5">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div
                    className="max-w-[82%] break-words rounded-2xl rounded-tr-[4px] bg-blue-600 px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                    dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
                  />
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  <Logo size={26} />
                  <div
                    className="max-w-[82%] break-words rounded-2xl rounded-tl-[4px] border border-white/5 bg-slate-800 px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-300"
                    dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
                  />
                </div>
              ),
            )}
            {loading && (
              <div className="flex items-end gap-2">
                <Logo size={26} />
                <div className="mc-typing flex items-center gap-1 rounded-2xl rounded-tl-[4px] border border-white/5 bg-slate-800 px-3.5 py-3">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex flex-shrink-0 items-end gap-2 border-t border-white/[0.07] px-3.5 py-3">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t('placeholder')}
              className="max-h-20 flex-1 resize-none rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2.5 text-[13px] leading-relaxed text-white outline-none transition-colors focus:border-blue-600/50"
            />
            <button
              onClick={() => {
                sendMessage(input);
                setInput('');
              }}
              aria-label="Send"
              className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-500"
            >
              <Send className="h-[15px] w-[15px]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

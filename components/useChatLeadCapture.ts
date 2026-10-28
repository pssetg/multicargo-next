'use client';

import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import { findContactInText, type ContactInfo } from '@/lib/contact-parse';

export type LeadMessage = { role: 'user' | 'assistant'; content: string; ts?: number };

const IDLE_MS = 10 * 60_000; // 10 minutes of silence ends the conversation
const MIN_USER_MESSAGES_ANON = 3; // mirrors /api/chat-lead
const ENDPOINT = '/api/chat-lead';
const MAX_MESSAGES = 40; // mirrors /api/chat-lead limits
const MAX_MESSAGE_CHARS = 4000;

function newSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

type FlushReason = 'contact' | 'idle' | 'close' | 'pagehide';

/**
 * Sends the chat to /api/chat-lead (HubSpot contact/deal/note + email copy):
 *  - as soon as the client leaves a phone or email,
 *  - when the conversation ends (window closed, 10 min idle, page left via
 *    sendBeacon) if there is a contact or at least 3 client messages.
 * The server returns an opaque `ref` for the deal; sending it back makes later
 * requests update the same deal instead of creating a second one. State lives
 * per chat window (history itself resets when the window closes).
 */
export function useChatLeadCapture(messagesRef: MutableRefObject<LeadMessage[]>, language: string) {
  const sessionId = useRef('');
  const ref = useRef('');
  const contact = useRef<ContactInfo>({ email: '', phone: '' });
  const contactSynced = useRef(false); // server already has the contact for this ref
  const lastSentCount = useRef(0);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const languageRef = useRef(language);
  languageRef.current = language;

  const buildPayload = useCallback(() => {
    if (!sessionId.current) sessionId.current = newSessionId();
    const hasContact = Boolean(contact.current.email || contact.current.phone);
    return {
      sessionId: sessionId.current,
      language: languageRef.current,
      ref: ref.current || undefined,
      contact: hasContact ? contact.current : undefined,
      messages: messagesRef.current
        .slice(-MAX_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS), ts: m.ts })),
      website: '', // honeypot, must stay empty
    };
  }, [messagesRef]);

  /** True when there is something new worth sending for this reason. */
  const shouldSend = useCallback(
    (reason: FlushReason) => {
      const msgs = messagesRef.current;
      const hasContact = Boolean(contact.current.email || contact.current.phone);
      if (reason === 'contact') return hasContact && !contactSynced.current;
      if (msgs.length === lastSentCount.current) return false;
      const userCount = msgs.filter((m) => m.role === 'user').length;
      return Boolean(ref.current) || hasContact || userCount >= MIN_USER_MESSAGES_ANON;
    },
    [messagesRef],
  );

  const flush = useCallback(
    (reason: FlushReason) => {
      if (reason === 'pagehide') {
        // Page is going away: fire-and-forget, can't wait for a response.
        if (!shouldSend(reason)) return;
        const body = JSON.stringify(buildPayload());
        lastSentCount.current = messagesRef.current.length;
        navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }));
        return;
      }

      // Serialised so a late response (new ref) is applied before the next request.
      chain.current = chain.current.then(async () => {
        if (!shouldSend(reason)) return;
        const payload = buildPayload();
        const sentCount = messagesRef.current.length;
        const sentContact = Boolean(payload.contact);
        try {
          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          });
          const data = (await res.json()) as { ok?: boolean; ref?: string };
          if (data.ok) {
            if (data.ref) ref.current = data.ref;
            lastSentCount.current = sentCount;
            if (sentContact) contactSynced.current = true;
          }
        } catch {
          // best-effort; the chat itself is unaffected
        }
      });
    },
    [buildPayload, messagesRef, shouldSend],
  );

  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => flush('idle'), IDLE_MS);
  }, [flush]);

  // Page left (tab closed / navigated away) and window closed.
  useEffect(() => {
    const onPageHide = () => flush('pagehide');
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      flush('close');
    };
  }, [flush]);

  /** Call with every client message before it is sent to the assistant. */
  const onUserMessage = useCallback(
    (text: string) => {
      const found = findContactInText(text);
      if (found.email || found.phone) {
        const merged = {
          email: found.email || contact.current.email,
          phone: found.phone || contact.current.phone,
        };
        // New contact details after the server already stored one are ignored there,
        // but keep the latest locally so the final flush stays consistent.
        if (merged.email !== contact.current.email || merged.phone !== contact.current.phone) {
          contact.current = merged;
        }
      }
      resetIdle();
    },
    [resetIdle],
  );

  /** Call after the assistant's reply was appended to messagesRef. */
  const onAssistantReply = useCallback(() => {
    flush('contact');
    resetIdle();
  }, [flush, resetIdle]);

  return { onUserMessage, onAssistantReply };
}

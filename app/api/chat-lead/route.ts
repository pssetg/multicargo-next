import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { EMAIL_RE, normalizePhone } from '@/lib/contact-parse';
import {
  associateDealWithContact,
  associateNoteWithContact,
  createDeal,
  createNote,
  getPortalId,
  updateDeal,
  updateNote,
  upsertContact,
} from '@/lib/hubspot';

export const runtime = 'nodejs';

// Same allowlist as /api/hubspot-lead
const ALLOWED_ORIGINS = [
  'https://multicargoltd.com',
  'https://www.multicargoltd.com',
  'http://localhost:3000',
];

const MAX_BODY_BYTES = 200 * 1024; // 40 messages x 4000 chars + overhead
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4000;
const MAX_NOTE_CHARS = 20_000; // plain text before HTML escaping; HubSpot's limit is 65 536
const MIN_USER_MESSAGES_ANON = 3;
const ORDER_EMAIL = 'order1@multicargoltd.com';
const FALLBACK_NAME = 'Chat visitor';

const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

// Best-effort in-memory rate limits (per serverless instance), same pattern
// as /api/chat and /api/hubspot-lead: by IP and by chat session.
function makeLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (key: string): boolean => {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  };
}
const ipLimited = makeLimiter(10, 60_000);
const sessionLimited = makeLimiter(8, 10 * 60_000);

type ChatMessage = { role: 'user' | 'assistant'; content: string; ts: number };
type Ref = { dealId: string; noteId: string; contactId: string };

// ── Opaque session reference ────────────────────────────────────────────────
// The server keeps no state, so after creating a deal it hands the client a
// signed reference (deal / note / contact ids bound to the chat session id).
// A later request presents it to update the SAME deal instead of creating a
// second one. Signed with HMAC (key derived from HUBSPOT_TOKEN), so ids can't
// be forged to write into someone else's deal.
function sign(token: string, sessionId: string, payload: string): string {
  return createHmac('sha256', token).update(`chat-lead|${sessionId}|${payload}`).digest('hex').slice(0, 32);
}

function makeRef(token: string, sessionId: string, ref: Ref): string {
  const payload = Buffer.from(`${ref.dealId}|${ref.noteId}|${ref.contactId}`).toString('base64url');
  return `${payload}.${sign(token, sessionId, payload)}`;
}

function readRef(token: string, sessionId: string, raw: string): Ref | null {
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expected = sign(token, sessionId, payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [dealId, noteId, contactId] = Buffer.from(payload, 'base64url').toString().split('|');
  if (!dealId || !/^\d+$/.test(dealId)) return null;
  return { dealId, noteId: noteId ?? '', contactId: contactId ?? '' };
}

// ── Input parsing ───────────────────────────────────────────────────────────
type Parsed = {
  sessionId: string;
  language: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  messages: ChatMessage[];
  honeypot: boolean;
};

function parseBody(raw: unknown): Parsed | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;

  const sessionId = input.sessionId;
  if (typeof sessionId !== 'string' || !SESSION_ID_RE.test(sessionId)) return null;

  const str = (v: unknown, max: number): string | null => {
    if (v === undefined || v === null || v === '') return '';
    if (typeof v !== 'string') return null;
    const t = v.trim();
    return t.length > max ? null : t;
  };

  const language = str(input.language, 5);
  const ref = str(input.ref, 200);
  const name = str(input.name, 100);
  const website = input.website; // honeypot — real clients never fill it
  if (language === null || ref === null || name === null) return null;

  let email = '';
  let phone = '';
  if (input.contact !== undefined && input.contact !== null) {
    if (typeof input.contact !== 'object' || Array.isArray(input.contact)) return null;
    const c = input.contact as Record<string, unknown>;
    const e = str(c.email, 254);
    const p = str(c.phone, 40);
    if (e === null || p === null) return null;
    email = EMAIL_RE.test(e) ? e : '';
    phone = normalizePhone(p);
  }

  if (!Array.isArray(input.messages) || input.messages.length === 0) return null;
  const messages: ChatMessage[] = [];
  for (const m of input.messages.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') return null;
    const { role, content, ts } = m as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    messages.push({
      role,
      content: content.slice(0, MAX_MESSAGE_CHARS),
      ts: typeof ts === 'number' && Number.isFinite(ts) ? ts : Date.now(),
    });
  }

  return {
    sessionId,
    language,
    ref,
    name,
    email,
    phone,
    messages,
    honeypot: typeof website === 'string' && website.length > 0,
  };
}

// ── Formatting ──────────────────────────────────────────────────────────────
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

function buildNote(p: Parsed): string {
  const header = `Chat transcript (site language: ${p.language || '—'}, source: chat)`;
  const lines: string[] = [];
  let used = 0;
  let truncated = false;
  for (const m of p.messages) {
    const time = new Date(m.ts).toISOString().slice(0, 19).replace('T', ' ');
    const who = m.role === 'user' ? 'Client' : 'Bot';
    let text = m.content;
    if (used + text.length > MAX_NOTE_CHARS) {
      text = text.slice(0, Math.max(0, MAX_NOTE_CHARS - used));
      truncated = true;
    }
    used += text.length;
    lines.push(`<p><b>${who}</b> <i>${time} UTC</i><br>${escapeHtml(text)}</p>`);
    if (truncated) break;
  }
  const tail = truncated ? '<p><i>[обрезано / truncated]</i></p>' : '';
  return `<p><b>${header}</b></p>${lines.join('')}${tail}`;
}

function buildSummary(p: Parsed): string {
  const userMsgs = p.messages.filter((m) => m.role === 'user').map((m) => m.content.replace(/\s+/g, ' '));
  const joined = userMsgs.join(' | ');
  return joined.length > 600 ? `${joined.slice(0, 600)}…` : joined;
}

// ── Email copy via EmailJS REST API (needs EMAILJS_PRIVATE_KEY) ─────────────
async function sendEmailCopy(params: {
  name: string;
  email: string;
  phone: string;
  language: string;
  summary: string;
  dealUrl: string | null;
}): Promise<void> {
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  if (!privateKey) {
    console.error('[api/chat-lead] EMAILJS_PRIVATE_KEY missing, email copy skipped');
    return;
  }
  const message = [
    `Contact: ${params.email || params.phone || 'not provided'}`,
    `Language: ${params.language || '—'}`,
    `Summary: ${params.summary || '—'}`,
    params.dealUrl ? `HubSpot deal: ${params.dealUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_mlc',
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_j8v1gpg',
        user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'r6yEzcDu-bcJvsCx5',
        accessToken: privateKey,
        template_params: {
          name: params.name,
          email: params.email,
          phone: params.phone,
          message,
          language: params.language,
          date: new Date().toISOString(),
          to_email: ORDER_EMAIL,
        },
      }),
      signal: controller.signal,
    });
    if (!res.ok) console.error(`[api/chat-lead] email copy failed: HTTP ${res.status}`);
  } catch {
    console.error('[api/chat-lead] email copy failed: network error');
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (ipLimited(ip)) return NextResponse.json({ ok: false }, { status: 429 });

    const text = await request.text();
    if (!text || Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const body = parseBody(raw);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    // Honeypot filled: pretend success, do nothing.
    if (body.honeypot) return NextResponse.json({ ok: true });

    if (sessionLimited(body.sessionId)) return NextResponse.json({ ok: false }, { status: 429 });

    const token = process.env.HUBSPOT_TOKEN;
    if (!token) {
      console.error('[api/chat-lead] HUBSPOT_TOKEN missing');
      return NextResponse.json({ ok: false });
    }

    const existing = body.ref ? readRef(token, body.sessionId, body.ref) : null;
    if (body.ref && !existing) return NextResponse.json({ ok: false }, { status: 400 });

    const hasContact = Boolean(body.email || body.phone);
    const userCount = body.messages.filter((m) => m.role === 'user').length;
    // Nothing worth saving: no contact and too short to be an anonymous lead.
    if (!existing && !hasContact && userCount < MIN_USER_MESSAGES_ANON) {
      return NextResponse.json({ ok: false });
    }

    let { dealId, noteId, contactId } = existing ?? { dealId: '', noteId: '', contactId: '' };
    let contactAttached = false;

    if (hasContact && !contactId) {
      const id = await upsertContact(token, { email: body.email, phone: body.phone, name: body.name });
      if (!id) return NextResponse.json({ ok: false });
      contactId = id;
      contactAttached = true;
    }

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const dealName = contactId
      ? `Сайт-чат: ${body.name || body.email || body.phone} — ${date}`
      : `Chat visitor (anon) | ${now.toISOString().slice(0, 16).replace('T', ' ')}`;
    const description = [
      body.phone && `Телефон: ${body.phone}`,
      body.email && `Email: ${body.email}`,
      `Язык: ${body.language || '—'}`,
      'Источник: chat',
      'Переписка — в заметке к сделке',
    ]
      .filter(Boolean)
      .join('\n');

    let created = false;
    if (!dealId) {
      const id = await createDeal(token, { name: dealName, description, contactId: contactId || undefined });
      if (!id) return NextResponse.json({ ok: false });
      dealId = id;
      created = true;
    } else if (contactAttached) {
      // An anonymous deal got a contact later: link it and rename, no second deal.
      await associateDealWithContact(token, dealId, contactId);
      await updateDeal(token, dealId, { dealname: dealName, description });
    }

    const noteHtml = buildNote(body);
    if (noteId) {
      await updateNote(token, noteId, noteHtml);
      if (contactAttached) await associateNoteWithContact(token, noteId, contactId);
    } else {
      noteId = (await createNote(token, noteHtml, dealId, contactId || undefined)) ?? '';
    }

    if (created || contactAttached) {
      const portalId = await getPortalId(token);
      await sendEmailCopy({
        name: body.name || FALLBACK_NAME,
        email: body.email,
        phone: body.phone,
        language: body.language,
        summary: buildSummary(body),
        dealUrl: portalId ? `https://app.hubspot.com/contacts/${portalId}/record/0-3/${dealId}` : null,
      });
    }

    return NextResponse.json({ ok: true, ref: makeRef(token, body.sessionId, { dealId, noteId, contactId }) });
  } catch {
    console.error('[api/chat-lead] unexpected error');
    return NextResponse.json({ ok: false });
  }
}

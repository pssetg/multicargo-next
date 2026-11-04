import { NextResponse } from 'next/server';
import { saveLead } from '@/lib/hubspot';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 10 * 1024;

const ALLOWED_ORIGINS = [
  'https://multicargoltd.com',
  'https://www.multicargoltd.com',
  'http://localhost:3000',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Max length per accepted field; anything else in the body is dropped.
const FIELD_LIMITS = {
  email: 254,
  name: 100,
  phone: 40,
  company: 150,
  message: 2000,
  language: 5,
  source: 50,
} as const;

type Lead = Record<keyof typeof FIELD_LIMITS, string>;

// Best-effort in-memory rate limiting (per serverless instance), same
// pattern as /api/chat.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function parseLead(raw: unknown): Lead | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  const lead = {} as Lead;

  for (const key of Object.keys(FIELD_LIMITS) as (keyof typeof FIELD_LIMITS)[]) {
    const value = input[key];
    if (value === undefined || value === null || value === '') {
      lead[key] = '';
      continue;
    }
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (trimmed.length > FIELD_LIMITS[key]) return null;
    lead[key] = trimmed;
  }

  // Either a valid email or a valid phone is required; anything supplied must be valid.
  if (lead.email && !EMAIL_RE.test(lead.email)) return null;
  if (lead.phone) {
    lead.phone = normalizePhone(lead.phone);
    if (!lead.phone) return null;
  }
  if (!lead.email && !lead.phone) return null;
  return lead;
}

// Removes spaces, brackets, hyphens and dots; the rest must be an optional leading "+"
// and 7–15 digits. Returns '' for anything else.
function normalizePhone(raw: string): string {
  if (!raw) return '';
  const compact = raw.trim().replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(compact) ? compact : '';
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
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

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

    const lead = parseLead(raw);
    if (!lead) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const token = process.env.HUBSPOT_TOKEN;
    if (!token) {
      console.error('[api/hubspot-lead] HUBSPOT_TOKEN missing');
      return NextResponse.json({ ok: false });
    }

    // Same flow as the chat: find/create the contact, ALWAYS create the deal.
    // The visitor gets success regardless (the lead email is sent separately by the
    // form); failures are logged by saveLead without any personal data.
    const date = new Date().toISOString().slice(0, 10);
    const description = [
      lead.phone && `Телефон: ${lead.phone}`,
      lead.email && `Email: ${lead.email}`,
      lead.message,
      `Язык: ${lead.language || '—'}`,
      `Источник: ${lead.source || '—'}`,
    ]
      .filter(Boolean)
      .join('\n');

    await saveLead(token, {
      contact: { email: lead.email, phone: lead.phone, name: lead.name, company: lead.company },
      dealName: `Сайт-чат: ${lead.name || lead.email || lead.phone} — ${date}`,
      description,
    });
    return NextResponse.json({ ok: true });
  } catch {
    console.error('[api/hubspot-lead] unexpected error');
    return NextResponse.json({ ok: false });
  }
}

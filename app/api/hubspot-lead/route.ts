import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const HUBSPOT_API = 'https://api.hubapi.com';
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 1000;
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

  if (!lead.email || !EMAIL_RE.test(lead.email)) return null;
  return lead;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Calls HubSpot with an 8s timeout and one retry on 429/5xx. Returns the
// parsed JSON body, or null on any failure. Logs only status + short label —
// never the token, the response body, or lead data.
async function hubspot<T>(
  token: string,
  label: string,
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  body?: unknown,
): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${HUBSPOT_API}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.ok) return (await res.json()) as T;

      const retryable = res.status === 429 || res.status >= 500;
      console.error(`[api/hubspot-lead] ${label} failed: HTTP ${res.status}`);
      if (!retryable || attempt === 1) return null;
    } catch (error) {
      const reason = error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network error';
      console.error(`[api/hubspot-lead] ${label} failed: ${reason}`);
      if (attempt === 1) return null;
    } finally {
      clearTimeout(timer);
    }
    await sleep(RETRY_DELAY_MS);
  }
  return null;
}

// Cached for the lifetime of the module instance.
let cachedStage: { pipeline: string; stage: string } | null = null;

async function getPipelineStage(token: string): Promise<{ pipeline: string; stage: string } | null> {
  const envPipeline = process.env.HUBSPOT_PIPELINE_ID;
  const envStage = process.env.HUBSPOT_DEAL_STAGE_ID;
  if (envPipeline && envStage) return { pipeline: envPipeline, stage: envStage };
  if (cachedStage) return cachedStage;

  type Pipelines = {
    results?: { id: string; displayOrder?: number; stages?: { id: string; displayOrder: number }[] }[];
  };
  const data = await hubspot<Pipelines>(token, 'get pipelines', 'GET', '/crm/v3/pipelines/deals');
  const pipelines = data?.results ?? [];
  if (pipelines.length === 0) return null;

  const first = [...pipelines].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))[0];
  const stage = [...(first.stages ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)[0];
  if (!stage) return null;

  cachedStage = { pipeline: first.id, stage: stage.id };
  return cachedStage;
}

async function upsertContact(token: string, lead: Lead): Promise<string | null> {
  const [firstname, ...rest] = lead.name.split(/\s+/).filter(Boolean);
  const lastname = rest.join(' ');

  // Only non-empty values, so an existing contact's data is never blanked.
  const properties: Record<string, string> = {};
  if (firstname) properties.firstname = firstname;
  if (lastname) properties.lastname = lastname;
  if (lead.phone) properties.phone = lead.phone;
  if (lead.company) properties.company = lead.company;

  const found = await hubspot<{ results?: { id: string }[] }>(
    token,
    'search contact',
    'POST',
    '/crm/v3/objects/contacts/search',
    {
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: lead.email }] }],
      limit: 1,
    },
  );
  if (!found) return null;

  const existingId = found.results?.[0]?.id;
  if (existingId) {
    if (Object.keys(properties).length > 0) {
      const updated = await hubspot(token, 'update contact', 'PATCH', `/crm/v3/objects/contacts/${existingId}`, {
        properties,
      });
      if (!updated) return null;
    }
    return existingId;
  }

  const created = await hubspot<{ id: string }>(token, 'create contact', 'POST', '/crm/v3/objects/contacts', {
    properties: { email: lead.email, ...properties },
  });
  return created?.id ?? null;
}

async function createDeal(token: string, lead: Lead, contactId: string): Promise<boolean> {
  const target = await getPipelineStage(token);
  if (!target) return false;

  const date = new Date().toISOString().slice(0, 10);
  const description = [
    lead.message,
    `Язык: ${lead.language || '—'}`,
    `Источник: ${lead.source || '—'}`,
  ]
    .filter(Boolean)
    .join('\n');

  const deal = await hubspot(token, 'create deal', 'POST', '/crm/v3/objects/deals', {
    properties: {
      dealname: `Сайт-чат: ${lead.name || lead.email} — ${date}`,
      description,
      pipeline: target.pipeline,
      dealstage: target.stage,
    },
    associations: [
      {
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
      },
    ],
  });
  return deal !== null;
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

    const contactId = await upsertContact(token, lead);
    if (!contactId) return NextResponse.json({ ok: false });

    const dealOk = await createDeal(token, lead, contactId);
    return NextResponse.json({ ok: dealOk });
  } catch {
    console.error('[api/hubspot-lead] unexpected error');
    return NextResponse.json({ ok: false });
  }
}

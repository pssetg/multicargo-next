import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/agent-config';

export const runtime = 'nodejs';

const ALLOWED_HOSTS = ['multicargoltd.com', 'www.multicargoltd.com', 'localhost', '127.0.0.1'];

// Our own Vercel deployments only — the production alias plus preview
// deployments, which are named `<project>-<hash/branch>-<team>.vercel.app`.
const ALLOWED_VERCEL_HOSTS = /^multicargo-next(-[a-z0-9-]+-multicargo)?\.vercel\.app$/;

function isAllowedOrigin(request: Request): boolean {
  const originHeader = request.headers.get('origin') ?? request.headers.get('referer');
  if (!originHeader) return false;

  try {
    const hostname = new URL(originHeader).hostname;
    return ALLOWED_HOSTS.includes(hostname) || ALLOWED_VERCEL_HOSTS.test(hostname);
  } catch {
    return false;
  }
}

const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  uk: 'Ukrainian',
  pl: 'Polish',
  es: 'Spanish',
};

type IncomingMessage = { role: 'user' | 'assistant'; content: string };

// Basic in-memory rate limiting (best-effort — per serverless instance).
// Blocks obvious abuse without an external store.
const RATE_LIMIT = 15; // requests
const RATE_WINDOW_MS = 60_000; // per minute
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

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return new Response('Forbidden', { status: 403 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 },
      );
    }

    const { messages, language } = (await request.json()) as {
      messages: IncomingMessage[];
      language?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Anthropic requires the conversation to start with a `user` turn; drop any
    // leading assistant messages (e.g. the client-side greeting).
    const firstUser = messages.findIndex((m) => m.role === 'user');
    let apiMessages = (firstUser >= 0 ? messages.slice(firstUser) : [])
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    if (apiMessages.length === 0) {
      return NextResponse.json({ error: 'No user message provided' }, { status: 400 });
    }

    if (apiMessages.some((m) => m.content.length > MAX_MESSAGE_LENGTH)) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` },
        { status: 400 },
      );
    }

    if (apiMessages.length > MAX_HISTORY_MESSAGES) {
      apiMessages = apiMessages.slice(-MAX_HISTORY_MESSAGES);
      // Re-anchor on a `user` turn in case truncation left an assistant turn first.
      const truncatedFirstUser = apiMessages.findIndex((m) => m.role === 'user');
      apiMessages = truncatedFirstUser >= 0 ? apiMessages.slice(truncatedFirstUser) : [];
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'placeholder') {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
        { status: 500 },
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const langName = LANGUAGE_NAMES[language ?? 'en'] ?? 'English';

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: buildSystemPrompt(langName),
      messages: apiMessages,
    });

    const reply = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[api/chat] error:', error);
    return NextResponse.json({ error: 'Failed to generate a response.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

// On-brand system prompt for the Multicargo assistant. The page language is
// appended per request so the assistant greets/answers in the right language.
const SYSTEM_PROMPT = `You are a virtual logistics assistant for Multicargo Logistics Group — an international freight forwarding company operating since 2007.

COMPANY FACTS:
- Experience: 15+ years (since 2007)
- Offices: Kyiv, Warsaw, Wroclaw, Valencia, Tallinn, Shenzhen
- Services: Air freight, Sea freight FCL/LCL, Road transport, Rail freight, Customs clearance, LCL groupage, Oversized cargo, Courier services, Tech Importer EU/UKR
- Geography: ANY country — China, Israel, UAE, USA, Brazil, Canada, Vietnam, India, Europe, Ukraine and more
- Minimum shipment: 1 box / 1 kg — NO minimum
- Carriers: MSC, Maersk, CMA CGM, COSCO, ZIM, Lufthansa Cargo, Emirates SkyCargo, Qatar Airways Cargo, FedEx, DHL

TYPICAL TRANSIT TIMES:
- Sea China→Poland/Germany: 28-35 days
- Rail China→Europe: 18-22 days
- Air China→Europe: 5-8 days
- Air UAE→Europe: 1-3 days

LANGUAGE RULES:
- Answer in the page language provided below unless the client clearly writes in another language, then switch to the client's language
- NEVER mix languages in one message

CONVERSATION GOALS:
1. Collect cargo parameters ONE QUESTION AT A TIME (origin, destination, type of goods, weight/volume, incoterms, urgency)
2. Give brief consultation on the best transport mode
3. Collect contact details (name, email or phone)

IMPORTANT RULES:
- ONE question at a time; simple language, explain terms if needed
- NEVER quote specific prices
- NEVER promise exact delivery dates
- NEVER mention competitors
- ALWAYS be helpful, warm and solution-oriented`;

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
    const apiMessages = (firstUser >= 0 ? messages.slice(firstUser) : [])
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    if (apiMessages.length === 0) {
      return NextResponse.json({ error: 'No user message provided' }, { status: 400 });
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
      system: `${SYSTEM_PROMPT}\n\npage_language: ${langName}`,
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

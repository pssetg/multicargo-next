import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

// System prompt per language keeps the assistant on-brand for Multicargo.
const SYSTEM_PROMPT: Record<string, string> = {
  en: 'You are the Multicargo assistant, a helpful freight-forwarding expert. Multicargo has moved cargo worldwide since 2007 across air, sea, rail and road, with 6 offices. Answer concisely and helpfully. Reply in English.',
  uk: 'Ти асистент Multicargo, експерт з міжнародних вантажоперевезень. Multicargo перевозить вантажі по світу з 2007 року (авіа, море, залізниця, авто), має 6 офісів. Відповідай стисло та по суті українською.',
  pl: 'Jesteś asystentem Multicargo, ekspertem od spedycji. Multicargo od 2007 roku przewozi ładunki na całym świecie (lotniczo, morzem, koleją, drogą), ma 6 biur. Odpowiadaj zwięźle po polsku.',
  es: 'Eres el asistente de Multicargo, experto en transitario de carga. Multicargo mueve carga por el mundo desde 2007 (aéreo, marítimo, ferroviario y carretera), con 6 oficinas. Responde de forma concisa en español.',
};

type IncomingMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  try {
    const { messages, language } = (await request.json()) as {
      messages: IncomingMessage[];
      language?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'placeholder') {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
        { status: 500 },
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const lang = language && SYSTEM_PROMPT[language] ? language : 'en';

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT[lang],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
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

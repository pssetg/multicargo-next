import { NextResponse } from 'next/server';
import { getClientUsers, verifyPasswordHash } from '@/lib/auth';
import { signSession } from '@/lib/session';

export const runtime = 'nodejs';

const SESSION_COOKIE = 'mc_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Best-effort in-memory rate limiting (per serverless instance), same
// pattern as /api/chat — blocks obvious credential-stuffing without an
// external store.
const RATE_LIMIT = 10;
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

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Please slow down.' }, { status: 429 });
    }

    const { email, password } = (await request.json()) as { email?: string; password?: string };
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      console.error('[api/login] SESSION_SECRET is not configured');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Empty/missing CLIENT_USERS just means the list is empty — no match,
    // no crash, everyone gets the same 401 as a wrong password.
    const users = getClientUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user || !verifyPasswordHash(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signSession({ type: 'client', email: user.email }, secret, SESSION_MAX_AGE);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (error) {
    console.error('[api/login] error:', error);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}

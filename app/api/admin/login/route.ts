import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { signSession } from '@/lib/session';

export const runtime = 'nodejs';

const ADMIN_COOKIE = 'mc_admin_session';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours — shorter-lived than the client session

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

function timingSafeEqualStr(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  // Compare against a fixed-length buffer first so unequal lengths don't
  // short-circuit on length alone before reaching timingSafeEqual.
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
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

    const { password } = (await request.json()) as { password?: string };

    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.SESSION_SECRET;
    if (!adminPassword || !secret) {
      console.error('[api/admin/login] ADMIN_PASSWORD or SESSION_SECRET is not configured');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    if (!password || typeof password !== 'string' || !timingSafeEqualStr(password, adminPassword)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await signSession({ type: 'admin' }, secret, ADMIN_SESSION_MAX_AGE);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return res;
  } catch (error) {
    console.error('[api/admin/login] error:', error);
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const secret = process.env.SESSION_SECRET;
  const token = cookies().get('mc_admin_session')?.value;
  const session = secret ? await verifySession<{ type: string }>(token, secret) : null;
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, password } = (await request.json()) as { email?: string; password?: string };
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Hashing happens here, server-side, because scrypt needs Node's crypto
  // module — the admin UI never sees the plaintext password again.
  const passwordHash = hashPassword(password);
  return NextResponse.json({ email: email.trim(), passwordHash, addedAt: new Date().toISOString() });
}

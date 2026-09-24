import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { getClientUsers } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const secret = process.env.SESSION_SECRET;
  const token = cookies().get('mc_admin_session')?.value;
  const session = secret ? await verifySession<{ type: string }>(token, secret) : null;
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Includes passwordHash — the admin UI needs it to regenerate a complete
  // CLIENT_USERS JSON blob; it just doesn't render the hash in the list.
  const users = getClientUsers().map((u) => ({
    email: u.email,
    passwordHash: u.passwordHash,
    addedAt: u.addedAt ?? new Date(0).toISOString(),
  }));
  return NextResponse.json({ users });
}

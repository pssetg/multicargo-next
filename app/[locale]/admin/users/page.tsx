import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { unstable_setRequestLocale } from 'next-intl/server';
import AdminLogin from '@/components/AdminLogin';
import AdminUsersPanel from '@/components/AdminUsersPanel';
import { verifySession } from '@/lib/session';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  const secret = process.env.SESSION_SECRET;
  const token = cookies().get('mc_admin_session')?.value;
  const session = secret ? await verifySession<{ type: string }>(token, secret) : null;
  const authenticated = !!session && session.type === 'admin';

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      {authenticated ? <AdminUsersPanel /> : <AdminLogin />}
    </main>
  );
}

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CabinetLogoutButton from '@/components/CabinetLogoutButton';
import LoginModal from '@/components/LoginModal';
import { verifySession } from '@/lib/session';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function CabinetPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  // Middleware already redirects unauthenticated requests before this page
  // renders — this is a defense-in-depth re-check, not the only guard.
  const secret = process.env.SESSION_SECRET;
  const token = cookies().get('mc_session')?.value;
  const session = secret
    ? await verifySession<{ type: string; email: string }>(token, secret)
    : null;

  if (!session || session.type !== 'client') {
    redirect(`/${locale}/login`);
  }

  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-40 text-center">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/40 p-10 shadow-2xl backdrop-blur-md">
          <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">
            Кабінет у розробці
          </h1>
          <p className="mt-3 text-sm text-slate-400">{session.email}</p>
          <div className="mt-8">
            <CabinetLogoutButton locale={locale} />
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal />
    </>
  );
}

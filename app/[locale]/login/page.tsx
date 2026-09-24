import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ChatAgentLoader from '@/components/ChatAgentLoader';
import LoginForm from '@/components/LoginForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Login' });

  return {
    title: t('metaTitle'),
    // Client portal placeholder — not public content, keep it out of search.
    robots: { index: false, follow: false },
  };
}

export default function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <>
      <Nav />
      <main className="flex min-h-screen items-center justify-center px-6 pb-24 pt-40">
        <LoginForm />
      </main>
      <Footer />
      <ChatAgentLoader />
    </>
  );
}

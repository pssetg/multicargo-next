import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import Analytics from '@/components/Analytics';
import CookieBanner from '@/components/CookieBanner';
import '../globals.css';

const SITE_URL = 'https://multicargoltd.com';
const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  uk: 'uk_UA',
  pl: 'pl_PL',
  es: 'es_ES',
};

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const title = t('title');
  const description = t('description');

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        uk: '/uk',
        pl: '/pl',
        es: '/es',
        'x-default': '/en',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Multicargo Logistics Group',
      title,
      description,
      url: `/${locale}`,
      locale: OG_LOCALES[locale] ?? 'en_US',
      images: [{ url: '/img/og-image.jpg', width: 1200, height: 630, alt: 'Multicargo' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/img/og-image.jpg'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Ensure the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen overflow-x-hidden bg-[#030712] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {/* Fixed route map background */}
        <div className="bg-routes pointer-events-none fixed inset-0 z-[-1] h-full w-full opacity-35" />
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}

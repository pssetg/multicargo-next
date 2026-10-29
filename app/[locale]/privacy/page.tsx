import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import ReactMarkdown, { type Components } from 'react-markdown';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { locales, defaultLocale, type Locale } from '@/i18n/config';
import { PRIVACY_POLICY_DATE } from '@/lib/links';

const SITE_URL = 'https://multicargoltd.com';

// Policy texts live in docs/privacy-<locale>.md; "[DATE]" is replaced with PRIVACY_POLICY_DATE.
async function loadPolicy(locale: string): Promise<string> {
  const read = (l: string) => fs.readFile(path.join(process.cwd(), 'docs', `privacy-${l}.md`), 'utf8');
  try {
    return await read(locale);
  } catch {
    return read(defaultLocale); // fall back to English if a locale file is missing
  }
}

function formatPolicyDate(locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${PRIVACY_POLICY_DATE}T00:00:00Z`));
}

const components: Components = {
  h1: (props) => (
    <h1 className="mb-6 text-3xl font-black tracking-tight text-white md:text-4xl" {...props} />
  ),
  h2: (props) => <h2 className="mb-3 mt-10 text-xl font-bold text-white md:text-2xl" {...props} />,
  h3: (props) => <h3 className="mb-2 mt-6 text-lg font-bold text-white" {...props} />,
  p: (props) => <p className="my-4 leading-relaxed text-slate-300" {...props} />,
  ul: (props) => <ul className="my-4 list-disc space-y-2 pl-6 text-slate-300" {...props} />,
  ol: (props) => <ol className="my-4 list-decimal space-y-2 pl-6 text-slate-300" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-white" {...props} />,
  code: (props) => (
    <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-slate-100" {...props} />
  ),
  a: ({ href, ...props }) => (
    <a
      href={href}
      className="break-words text-blue-400 underline underline-offset-2 transition hover:text-blue-300"
      {...props}
    />
  ),
};

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Privacy' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: {
        en: '/en/privacy',
        uk: '/uk/privacy',
        pl: '/pl/privacy',
        es: '/es/privacy',
        'x-default': '/en/privacy',
      },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${SITE_URL}/${locale}/privacy`,
    },
  };
}

export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);

  const markdown = (await loadPolicy(locale)).replaceAll('[DATE]', formatPolicyDate(locale));

  return (
    <>
      <Nav />
      <main className="px-4 pb-16 pt-28 sm:px-6 md:pt-36">
        <article className="mx-auto max-w-[720px]">
          <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
        </article>
      </main>
      <Footer />
      <LoginModal />
    </>
  );
}

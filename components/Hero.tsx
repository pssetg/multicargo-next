import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');

  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
          {t('title')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          {t('subtitle')}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="#contact" className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-700">
            {t('ctaPrimary')}
          </a>
          <a href="#how" className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            {t('ctaSecondary')}
          </a>
        </div>
      </div>
    </section>
  );
}

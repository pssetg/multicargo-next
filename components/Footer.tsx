import { useLocale, useTranslations } from 'next-intl';
import { PRIVACY_POLICY_URL } from '@/lib/links';

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-transparent py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 md:flex-row">
        <div className="mb-8 flex items-center space-x-4 md:mb-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 font-black text-white">
            M
          </div>
          <span className="text-white">{t('company')}</span>
        </div>
        <div className="flex flex-col items-center gap-1 md:flex-row md:gap-8">
          <a
            href={PRIVACY_POLICY_URL[locale] ?? PRIVACY_POLICY_URL.en}
            className="inline-flex min-h-[44px] items-center transition hover:text-white"
          >
            {t('privacy')}
          </a>
          {/* Pass year as a string so next-intl doesn't number-format it (e.g. "2,026") */}
          <p>{t('copyright', { year: String(year) })}</p>
        </div>
      </div>
    </footer>
  );
}

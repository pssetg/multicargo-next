import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
        <div>
          <span className="font-bold text-sky-700 dark:text-sky-400">Multicargo</span> · {t('tagline')}
        </div>
        <div>© {year} Multicargo Logistics Group. {t('rights')}</div>
      </div>
    </footer>
  );
}

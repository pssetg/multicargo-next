import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
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
        <p>{t('copyright', { year })}</p>
      </div>
    </footer>
  );
}

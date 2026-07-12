import { useTranslations } from 'next-intl';
import { Send, Calculator, PackageCheck, type LucideIcon } from 'lucide-react';
import Badge from './Badge';

const STEPS: { key: string; num: string; icon: LucideIcon }[] = [
  { key: 'step1', num: '01', icon: Send },
  { key: 'step2', num: '02', icon: Calculator },
  { key: 'step3', num: '03', icon: PackageCheck },
];

export default function HowItWorks() {
  const t = useTranslations('HowItWorks');

  return (
    <section id="how-it-works" className="w-full bg-transparent py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="mb-10 text-center">
          <Badge label={t('badge')} size="sm" className="mb-4" />
          <h2 className="text-3xl font-black uppercase italic tracking-tight text-white md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ key, num, icon: Icon }) => (
            <div
              key={key}
              className="group rounded-[32px] border border-white/5 bg-slate-900/40 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30"
            >
              <div className="mb-6 flex items-start justify-between">
                <span className="font-mono text-[11px] font-bold tracking-widest text-slate-700">
                  {num}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <h3 className="mb-3 text-base font-bold uppercase tracking-wide text-white">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">{t(`steps.${key}.desc`)}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-slate-500">
          {t('footer')}
        </p>
      </div>
    </section>
  );
}

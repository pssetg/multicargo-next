import { useTranslations } from 'next-intl';
import Badge from './Badge';
import Stats from './Stats';
import Carriers from './Carriers';

const EVOLUTION = ['e1', 'e2', 'e3'] as const;

export default function About() {
  const t = useTranslations('About');

  return (
    <section id="about" className="w-full bg-transparent py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[50px] border border-white/5 bg-slate-950/40 p-8 backdrop-blur-md md:p-12 lg:p-16">
          {/* Ambient glow */}
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative z-10">
            {/* Strategic goal */}
            <div className="mb-16 max-w-4xl space-y-6 text-left">
              <Badge label={t('badge')} size="sm" />
              <h2 className="text-3xl font-black uppercase italic leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
                {t.rich('title', {
                  hl: (chunks) => <span className="text-blue-400">{chunks}</span>,
                })}
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-slate-400 md:text-lg">
                {t('body')}
              </p>
            </div>

            {/* Stats */}
            <Stats />

            {/* Carrier network */}
            <Carriers />

            {/* Company evolution */}
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {t('evolutionTitle')}
                </h3>
                <span className="font-mono text-xs text-slate-400">{t('established')}</span>
              </div>

              <div className="grid grid-cols-1 gap-6 text-left lg:grid-cols-3">
                {EVOLUTION.map((e) => (
                  <div
                    key={e}
                    className="group rounded-[32px] border border-white/5 bg-slate-900/40 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30"
                  >
                    <div className="mb-6 font-mono text-5xl font-black text-slate-800 transition-colors duration-300 group-hover:text-blue-500/20">
                      {t(`evolution.${e}.year`)}
                    </div>
                    <h4 className="mb-3 text-base font-bold uppercase tracking-wide text-white">
                      {t(`evolution.${e}.title`)}
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-400">
                      {t(`evolution.${e}.desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

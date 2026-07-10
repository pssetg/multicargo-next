'use client';

import { useTranslations } from 'next-intl';
import { WHATSAPP_URL } from '@/lib/links';

export default function Careers() {
  const t = useTranslations('Careers');

  return (
    <section id="careers" className="w-full bg-transparent py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[50px] border border-white/5 bg-slate-950/40 p-8 text-white backdrop-blur-md md:p-16 lg:px-20 lg:py-20">
          <div className="absolute bottom-0 right-0 -mb-20 -mr-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start gap-16 lg:flex-row">
            {/* Text */}
            <div className="w-full space-y-8 text-left lg:w-1/2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t('badge')}
                </span>
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-black uppercase italic leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                  {t('titleLine1')}
                  <br />
                  <span className="text-blue-500">{t('titleLine2')}</span>
                </h2>
                <p className="text-lg font-light leading-relaxed text-slate-300 md:text-xl">
                  {t('lead')}
                </p>
                <p className="text-base leading-relaxed text-slate-400">{t('body')}</p>
              </div>
            </div>

            {/* Cards */}
            <div className="w-full space-y-6 lg:w-1/2">
              <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
                <div className="rounded-[30px] border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/[0.08]">
                  <h3 className="mb-3 text-lg font-bold uppercase tracking-wider text-white">
                    {t('cards.flexible.title')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{t('cards.flexible.desc')}</p>
                </div>
                <div className="rounded-[30px] border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/[0.08]">
                  <h3 className="mb-3 text-lg font-bold uppercase tracking-wider text-white">
                    {t('cards.resources.title')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{t('cards.resources.desc')}</p>
                </div>
                <div className="rounded-[30px] border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/[0.08] md:col-span-2">
                  <h3 className="mb-3 text-lg font-bold uppercase tracking-wider text-white">
                    {t('cards.geography.title')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{t('cards.geography.desc')}</p>
                </div>
              </div>
              <div className="pt-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow flex w-full items-center justify-center rounded-2xl bg-blue-600 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700"
                >
                  {t('cta')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

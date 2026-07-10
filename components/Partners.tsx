'use client';

import { useTranslations } from 'next-intl';
import { Handshake, ShieldCheck, TrendingUp, MessageSquare } from 'lucide-react';
import { WHATSAPP_URL } from '@/lib/links';

export default function Partners() {
  const t = useTranslations('Partners');

  return (
    <section id="partners" className="w-full bg-transparent py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[50px] border border-white/5 bg-slate-950/40 p-8 md:p-16 lg:px-20 lg:py-20">
          <div className="absolute left-0 top-0 -ml-20 -mt-20 h-96 w-96 rounded-full bg-blue-600/[0.03] blur-3xl" />

          <div className="relative z-10 flex flex-col items-start gap-16 lg:flex-row-reverse">
            {/* Text */}
            <div className="w-full space-y-8 text-left lg:w-1/2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-600/10 bg-blue-600/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
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
                <div className="rounded-[30px] border border-white/5 bg-slate-900/40 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/50 text-blue-400">
                    <Handshake className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold uppercase tracking-wider text-white">
                    {t('cards.winwin.title')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{t('cards.winwin.desc')}</p>
                </div>

                <div className="rounded-[30px] border border-white/5 bg-slate-900/40 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/50 text-blue-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold uppercase tracking-wider text-white">
                    {t('cards.reliability.title')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{t('cards.reliability.desc')}</p>
                </div>

                <div className="flex flex-col items-start gap-6 rounded-[30px] border border-white/5 bg-slate-900/40 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 md:col-span-2 md:flex-row md:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold uppercase tracking-wider text-white">
                      {t('cards.infrastructure.title')}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {t('cards.infrastructure.desc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow flex w-full animate-pulse items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500"
                >
                  <span>{t('cta')}</span>
                  <MessageSquare className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

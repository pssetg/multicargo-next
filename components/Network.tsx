import { useTranslations } from 'next-intl';

const OFFICES = ['kyiv', 'warsaw', 'wroclaw', 'valencia', 'tallinn', 'shenzhen'] as const;

export default function Network() {
  const t = useTranslations('Network');

  return (
    <section id="network" className="overflow-hidden py-12 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          {/* Mission text */}
          <div>
            <p className="max-w-xl text-xl font-light leading-relaxed text-slate-400">
              {t('mission')}
            </p>
          </div>

          {/* Strategic Offices */}
          <div>
            <div className="rounded-[40px] border border-white/5 bg-slate-950/40 p-8 backdrop-blur-md md:p-12">
              <h2 className="mb-8 text-left text-2xl font-black uppercase italic tracking-tighter">
                {t('officesTitle')}
              </h2>

              <div className="flex flex-col gap-2">
                {OFFICES.map((key, i) => (
                  <div key={key} className="group w-full cursor-pointer">
                    <div className="strategic-wrapper px-4">
                      <div className="flex h-[48px] w-full items-center justify-between">
                        <h3 className="strategic-city-title text-base font-bold uppercase leading-none tracking-[0.2em] text-slate-500 md:text-lg">
                          {t(`offices.${key}.city`)}
                        </h3>
                        <span className="font-mono text-sm text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="address-content">
                        <p className="border-t border-white/5 pt-2 text-[11px] font-light italic text-slate-400">
                          {t(`offices.${key}.address`)}
                        </p>
                      </div>
                    </div>
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

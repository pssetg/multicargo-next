import { useTranslations } from 'next-intl';

/** Headline metrics. Values are brand facts; labels are translated. */
const STATS: { value: string; plus?: boolean; key: string }[] = [
  { value: '15', plus: true, key: 'years' },
  { value: '6', key: 'offices' },
  { value: '30', plus: true, key: 'countries' },
  { value: '500', plus: true, key: 'clients' },
];

export default function Stats() {
  const t = useTranslations('Stats');

  return (
    <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
      {STATS.map((s) => (
        <div
          key={s.key}
          className="group rounded-[24px] border border-white/5 bg-slate-900/40 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30"
        >
          <div className="mb-2 font-mono text-4xl font-black text-white md:text-5xl">
            {s.value}
            {s.plus && <span className="text-blue-400">+</span>}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t(s.key)}
          </p>
        </div>
      ))}
    </div>
  );
}

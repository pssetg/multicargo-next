import { useTranslations } from 'next-intl';
import Section from './Section';

export default function HotOffers() {
  const t = useTranslations('HotOffers');
  // Placeholder offers — wire up to a data source / CMS later
  const offers = [
    { route: 'Shenzhen → Gdańsk', mode: 'Sea FCL', note: '—' },
    { route: 'Istanbul → Kyiv', mode: 'Road LTL', note: '—' },
    { route: 'Tel Aviv → Valencia', mode: 'Air', note: '—' },
  ];

  return (
    <Section id="offers" title={t('title')} subtitle={t('subtitle')} className="border-t border-slate-100 dark:border-slate-900">
      <div className="grid gap-4 sm:grid-cols-3">
        {offers.map((o) => (
          <div key={o.route} className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
            <div className="text-xs font-semibold uppercase text-sky-600 dark:text-sky-400">{o.mode}</div>
            <div className="mt-2 font-semibold text-slate-800 dark:text-slate-200">{o.route}</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{o.note}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

import { useTranslations } from 'next-intl';
import Section from './Section';

export default function Stats() {
  const t = useTranslations('Stats');
  const stats = [
    { value: '18+', label: t('years') },
    { value: '6', label: t('offices') },
    { value: '40+', label: t('countries') },
    { value: '50k+', label: t('shipments') },
  ];

  return (
    <Section id="stats" title={t('title')} className="border-t border-slate-100 dark:border-slate-900">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-4xl font-extrabold text-sky-600 dark:text-sky-400">{s.value}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

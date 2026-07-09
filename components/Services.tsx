import { useTranslations } from 'next-intl';
import Section from './Section';

export default function Services() {
  const t = useTranslations('Services');
  const services = [
    t('air'),
    t('sea'),
    t('rail'),
    t('road'),
    t('customs'),
    t('warehousing'),
  ];

  return (
    <Section id="services" title={t('title')} className="border-t border-slate-100 dark:border-slate-900">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s} className="rounded-xl border border-slate-200 p-6 transition hover:border-sky-400 hover:shadow-sm dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{s}</h3>
          </div>
        ))}
      </div>
    </Section>
  );
}

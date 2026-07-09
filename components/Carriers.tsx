import { useTranslations } from 'next-intl';
import Section from './Section';

export default function Carriers() {
  const t = useTranslations('Carriers');
  // Placeholder carrier names — replace with logos in public/img
  const carriers = ['Maersk', 'MSC', 'DHL', 'CMA CGM', 'Lufthansa Cargo', 'DB Schenker'];

  return (
    <Section id="carriers" title={t('title')} subtitle={t('subtitle')} className="border-t border-slate-100 dark:border-slate-900">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {carriers.map((c) => (
          <div key={c} className="flex items-center justify-center rounded-lg border border-slate-200 p-4 text-sm font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {c}
          </div>
        ))}
      </div>
    </Section>
  );
}

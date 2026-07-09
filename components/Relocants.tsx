import { useTranslations } from 'next-intl';
import Section from './Section';

export default function Relocants() {
  const t = useTranslations('Relocants');

  return (
    <Section id="relocants" className="border-t border-slate-100 dark:border-slate-900">
      <div className="rounded-2xl bg-sky-600 px-8 py-12 text-white">
        <h2 className="text-3xl font-bold">{t('title')}</h2>
        <p className="mt-2 max-w-2xl text-sky-100">{t('subtitle')}</p>
        <a href="#contact" className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-medium text-sky-700 hover:bg-sky-50">
          {t('cta')}
        </a>
      </div>
    </Section>
  );
}

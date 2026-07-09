import { useTranslations } from 'next-intl';
import Section from './Section';

export default function Careers() {
  const t = useTranslations('Careers');

  return (
    <Section id="careers" title={t('title')} subtitle={t('subtitle')} className="border-t border-slate-100 dark:border-slate-900">
      <a href="#contact" className="inline-block rounded-lg border border-sky-600 px-6 py-3 font-medium text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-800">
        {t('cta')}
      </a>
    </Section>
  );
}

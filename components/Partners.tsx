import { useTranslations } from 'next-intl';
import Section from './Section';

export default function Partners() {
  const t = useTranslations('Partners');

  return (
    <Section id="partners" title={t('title')} subtitle={t('subtitle')} className="border-t border-slate-100 dark:border-slate-900">
      <a href="#contact" className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
        {t('cta')}
      </a>
    </Section>
  );
}

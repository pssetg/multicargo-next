import { useTranslations } from 'next-intl';
import Section from './Section';

export default function About() {
  const t = useTranslations('About');

  return (
    <Section id="about" title={t('title')} className="border-t border-slate-100 dark:border-slate-900">
      <p className="max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
        {t('body')}
      </p>
    </Section>
  );
}

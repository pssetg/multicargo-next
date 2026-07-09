import { useTranslations } from 'next-intl';
import Section from './Section';

export default function Downloads() {
  const t = useTranslations('Downloads');

  return (
    <Section id="download" title={t('title')} subtitle={t('subtitle')} className="border-t border-slate-100 dark:border-slate-900">
      <a
        href="/downloads/multicargo-brief.pdf"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        ⬇ {t('brief')}
      </a>
    </Section>
  );
}

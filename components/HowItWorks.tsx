import { useTranslations } from 'next-intl';
import Section from './Section';

export default function HowItWorks() {
  const t = useTranslations('HowItWorks');
  const steps = [t('step1'), t('step2'), t('step3'), t('step4')];

  return (
    <Section id="how" title={t('title')} subtitle={t('subtitle')}>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={i} className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 font-bold text-white">
              {i + 1}
            </span>
            <p className="mt-4 font-medium text-slate-800 dark:text-slate-200">{step}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

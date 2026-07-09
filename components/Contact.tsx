'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Section from './Section';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function Contact() {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      // TODO: integrate EmailJS. Install `@emailjs/browser`, then:
      //   import emailjs from '@emailjs/browser';
      //   await emailjs.send(
      //     process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      //     process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      //     data,
      //     process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      //   );
      console.log('Contact form submission (stub):', data);
      await new Promise((r) => setTimeout(r, 600));
      setStatus('success');
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <Section id="contact" title={t('title')} subtitle={t('subtitle')} className="border-t border-slate-100 dark:border-slate-900">
      <form onSubmit={handleSubmit} className="grid max-w-xl gap-4">
        <input
          name="name"
          required
          placeholder={t('name')}
          className="rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
        />
        <input
          name="email"
          type="email"
          required
          placeholder={t('email')}
          className="rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
        />
        <textarea
          name="message"
          required
          rows={4}
          placeholder={t('message')}
          className="rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {status === 'sending' ? t('sending') : t('send')}
        </button>
        {status === 'success' && <p className="text-sm text-green-600">{t('success')}</p>}
        {status === 'error' && <p className="text-sm text-red-600">{t('error')}</p>}
      </form>
    </Section>
  );
}

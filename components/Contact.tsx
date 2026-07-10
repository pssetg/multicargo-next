'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import emailjs from '@emailjs/browser';
import { Mail, Phone, MapPin } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF, CONTACT_ADDRESS } from '@/lib/links';

type Status = 'idle' | 'sending' | 'success' | 'error';

// Public EmailJS config (safe to expose). Env vars override the defaults.
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_mlc';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_j8v1gpg';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'r6yEzcDu-bcJvsCx5';
const ORDER_EMAIL = 'order1@multicargoltd.com';

export default function Contact() {
  const t = useTranslations('Contact');
  const locale = useLocale();
  const [status, setStatus] = useState<Status>('idle');

  // Initialise EmailJS once on mount with the public key
  useEffect(() => {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      contact: (form.elements.namedItem('contact') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    setStatus('sending');
    try {
      // Template `template_j8v1gpg` expects: name, email, message
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: ORDER_EMAIL,
        name: data.name,
        email: data.contact,
        message:
          `🚢 NEW LEAD — MULTICARGO WEBSITE\n` +
          `━━━━━━━━━━━━━━━━━\n` +
          `📅 ${new Date().toLocaleString()}\n` +
          `🌐 Language: ${locale}\n` +
          `━━━━━━━━━━━━━━━━━\n\n` +
          `👤 Name: ${data.name}\n` +
          `📞 Contact: ${data.contact}\n\n` +
          `📝 Message / Cargo details:\n${data.message}`,
      });
      setStatus('success');
      form.reset();
    } catch (err) {
      console.error('EmailJS send failed:', err);
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="w-full bg-transparent py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[50px] border border-white/5 bg-slate-950/40 p-8 backdrop-blur-md md:p-16 lg:px-20 lg:py-20">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-600/[0.03] blur-3xl" />

          <div className="relative z-10 flex flex-col items-start gap-16 lg:flex-row">
            {/* Info */}
            <div className="w-full space-y-8 text-left lg:w-1/2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-600/10 bg-blue-600/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  {t('badge')}
                </span>
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-black uppercase italic leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                  {t('titleLine1')}
                  <br />
                  <span className="text-blue-500">{t('titleLine2')}</span>
                </h2>
                <p className="text-lg font-light leading-relaxed text-slate-300 md:text-xl">
                  {t('lead')}
                </p>

                <div className="space-y-4 pt-6 text-sm text-slate-400">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-white">
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-400" />
                    <a href={CONTACT_PHONE_HREF} className="transition hover:text-white">
                      {CONTACT_PHONE}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    <span>{CONTACT_ADDRESS}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="w-full rounded-[40px] border border-white/5 bg-slate-900/30 p-8 shadow-2xl backdrop-blur-md md:p-12 lg:w-1/2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label={t('name')}>
                  <input
                    name="name"
                    required
                    placeholder={t('namePlaceholder')}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </Field>
                <Field label={t('contact')}>
                  <input
                    name="contact"
                    required
                    placeholder={t('contactPlaceholder')}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </Field>
                <Field label={t('message')}>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder={t('messagePlaceholder')}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </Field>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-glow w-full rounded-2xl bg-blue-600 py-5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 disabled:opacity-60"
                >
                  {status === 'sending' ? t('sending') : t('submit')}
                </button>
                {status === 'success' && (
                  <p className="text-sm text-green-400">{t('success')}</p>
                )}
                {status === 'error' && <p className="text-sm text-red-400">{t('error')}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}

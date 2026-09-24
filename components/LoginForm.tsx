'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import emailjs from '@emailjs/browser';
import { Lock, MessageSquare } from 'lucide-react';
import { trackLead } from '@/lib/analytics';

type View = 'form' | 'gate' | 'chatOpened';
type EmailStatus = 'idle' | 'sending' | 'success' | 'error' | 'invalid';

// Same public EmailJS config as Contact.tsx — env vars override the defaults.
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_mlc';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_j8v1gpg';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'r6yEzcDu-bcJvsCx5';
const ORDER_EMAIL = 'order1@multicargoltd.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const t = useTranslations('Login');
  const locale = useLocale();
  const router = useRouter();
  const [view, setView] = useState<View>('form');
  const [checkingLogin, setCheckingLogin] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');

  useEffect(() => {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }, []);

  // Real credential check against /api/login. A match sets an httpOnly
  // session cookie and sends the visitor to /cabinet; anything else
  // (wrong password, no matching user, CLIENT_USERS unset) falls through
  // to the same "portal access isn't open yet" gate — no raw error shown.
  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    setCheckingLogin(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push(`/${locale}/cabinet`);
        return;
      }
    } catch {
      // network/server error — same fallback as an invalid login
    }
    setCheckingLogin(false);
    setView('gate');
  }

  function openChat() {
    window.dispatchEvent(new CustomEvent('multicargo:openChat'));
    setView('chatOpened');
  }

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();

    if (!EMAIL_RE.test(email)) {
      setEmailStatus('invalid');
      return;
    }

    setEmailStatus('sending');
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      // Template `template_j8v1gpg` expects: name, email, message — reused
      // from Contact.tsx, with the message noting this lead's source.
      const templateParams = {
        name: 'Client Portal lead',
        email,
        message: 'Lead source: login-page',
        language: locale,
        date: new Date().toLocaleString(),
        to_email: ORDER_EMAIL,
      };
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      trackLead('login_email');
      setEmailStatus('success');
      form.reset();
    } catch (err) {
      console.error('EmailJS send failed:', err);
      setEmailStatus('error');
    }
  }

  return (
    <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md md:p-10">
      {view === 'form' && (
        <>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm text-slate-400">{t('subtitle')}</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <Field label={t('emailLabel')}>
              <input
                type="email"
                name="email"
                required
                placeholder={t('emailPlaceholder')}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </Field>
            <Field label={t('passwordLabel')}>
              <input
                type="password"
                name="password"
                required
                placeholder={t('passwordPlaceholder')}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </Field>
            <button
              type="submit"
              disabled={checkingLogin}
              className="btn-glow w-full rounded-2xl bg-blue-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 disabled:opacity-60"
            >
              {t('submit')}
            </button>
          </form>
        </>
      )}

      {view === 'gate' && (
        <div className="text-center">
          <h2 className="text-xl font-black uppercase italic leading-snug tracking-tight text-white">
            {t('gateTitle')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{t('gateMessage')}</p>

          <div className="mt-8 space-y-3">
            <button
              onClick={openChat}
              className="btn-glow flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500"
            >
              <MessageSquare className="h-4 w-4" />
              {t('chatButton')}
            </button>

            {!showEmailForm && (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full rounded-2xl border border-white/10 py-4 text-sm font-black uppercase tracking-widest text-slate-300 transition-all hover:border-blue-500/30 hover:text-blue-400"
              >
                {t('emailFormTitle')}
              </button>
            )}
          </div>

          {showEmailForm && (
            <div className="mt-6 border-t border-white/5 pt-6">
              {emailStatus === 'success' ? (
                <p className="text-sm text-green-400">{t('emailFormSuccess')}</p>
              ) : (
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t('emailFormPlaceholder')}
                    className="w-full flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3.5 text-sm text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === 'sending'}
                    className="flex-shrink-0 rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 disabled:opacity-60"
                  >
                    {emailStatus === 'sending' ? t('emailFormSending') : t('emailFormSubmit')}
                  </button>
                </form>
              )}
              {emailStatus === 'invalid' && (
                <p className="mt-2 text-xs text-red-400">{t('emailInvalid')}</p>
              )}
              {emailStatus === 'error' && (
                <p className="mt-2 text-xs text-red-400">{t('emailFormError')}</p>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'chatOpened' && (
        <div className="text-center">
          <MessageSquare className="mx-auto mb-4 h-8 w-8 text-blue-400" />
          <p className="text-sm text-slate-400">{t('chatOpenedNote')}</p>
        </div>
      )}
    </div>
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

'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n/config';

export default function Nav() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '#about', label: t('about') },
    { href: '#services', label: t('services') },
    { href: '#carriers', label: t('carriers') },
    { href: '#relocants', label: t('relocants') },
    { href: '#careers', label: t('careers') },
    { href: '#partners', label: t('partners') },
    { href: '#contact', label: t('contact') },
  ];

  function switchLocale(next: string) {
    // Replace the leading locale segment of the current path
    const segments = pathname.split('/');
    segments[1] = next;
    router.push(segments.join('/') || `/${next}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#top" className="text-lg font-bold tracking-tight text-sky-700 dark:text-sky-400">
          Multicargo
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-600 hover:text-sky-700 dark:text-slate-300">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Language"
            value={locale}
            onChange={(e) => switchLocale(e.target.value)}
            className="rounded-md border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-slate-700"
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {localeNames[l as Locale]}
              </option>
            ))}
          </select>
          <a
            href="#contact"
            className="hidden rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 sm:inline-block"
          >
            {t('quote')}
          </a>
          <button
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-200 px-4 py-2 md:hidden dark:border-slate-800">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block py-2 text-sm text-slate-600 dark:text-slate-300"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

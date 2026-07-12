'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Plane,
  Ship,
  Truck,
  Train,
  PackageSearch,
  Construction,
  ShieldCheck,
  LayoutGrid,
  ClipboardCheck,
  ChevronDown,
  DownloadCloud,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { locales, type Locale } from '@/i18n/config';

/** Services dropdown items — icon + translation key + anchor */
const SERVICE_ITEMS: { key: string; icon: LucideIcon; href: string }[] = [
  { key: 'air', icon: Plane, href: '#service-air' },
  { key: 'sea', icon: Ship, href: '#service-sea' },
  { key: 'road', icon: Truck, href: '#service-road' },
  { key: 'rail', icon: Train, href: '#service-rail' },
  { key: 'lcl', icon: PackageSearch, href: '#service-lcl' },
  { key: 'oversized', icon: Construction, href: '#service-oversized' },
  { key: 'importer', icon: ShieldCheck, href: '#service-importer' },
  { key: 'courier', icon: PackageSearch, href: '#service-courier' },
  { key: 'handling', icon: LayoutGrid, href: '#service-handling' },
  { key: 'customs', icon: ClipboardCheck, href: '#service-customs' },
];

/** Locale → flag image (flagcdn) */
const FLAGS: Record<Locale, { src: string; alt: string }> = {
  en: { src: 'https://flagcdn.com/w40/gb.png', alt: 'EN' },
  uk: { src: 'https://flagcdn.com/w40/ua.png', alt: 'UA' },
  es: { src: 'https://flagcdn.com/w40/es.png', alt: 'ES' },
  pl: { src: 'https://flagcdn.com/w40/pl.png', alt: 'PL' },
};

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a href="#hero" onClick={onClick} className="flex items-center space-x-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-lg">
        <span className="text-xl font-bold tracking-tighter text-white">M</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold uppercase leading-none tracking-tight text-white">
          Multicargo
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
          Logistics Group
        </span>
      </div>
    </a>
  );
}

export default function Nav() {
  const t = useTranslations('Nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function switchLocale(next: string) {
    const segments = pathname.split('/');
    segments[1] = next;
    router.push(segments.join('/') || `/${next}`);
    setMobileOpen(false);
  }

  const LanguageBar = ({ className = '' }: { className?: string }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          title={FLAGS[l].alt}
          className={`flag-box cursor-pointer ${l === locale ? 'active' : ''}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FLAGS[l].src}
            className="flag-icon"
            alt={FLAGS[l].alt}
            width={20}
            height={14}
            decoding="async"
          />
        </button>
      ))}
    </div>
  );

  return (
    <>
      <header className="glass-nav fixed z-50 w-full border-b border-white/5">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden h-full items-center space-x-8 text-[11px] font-bold uppercase tracking-widest text-slate-400 lg:flex">
            <a href="#about" className="transition hover:text-blue-400">
              {t('about')}
            </a>

            {/* Services dropdown (CSS hover) */}
            <div className="dropdown relative flex h-full cursor-pointer items-center">
              <span className="flex items-center text-slate-400 transition hover:text-blue-400">
                {t('services')}
                <ChevronDown className="ml-1 h-3 w-3" />
              </span>
              <div className="dropdown-menu absolute left-0 top-full hidden w-72 rounded-2xl border border-white/10 bg-slate-950/95 py-4 shadow-2xl backdrop-blur-xl">
                <div className="grid grid-cols-1">
                  {SERVICE_ITEMS.map(({ key, icon: Icon, href }, i) => (
                    <a
                      key={key}
                      href={href}
                      className={`group flex items-center space-x-3 px-6 py-3 transition hover:bg-white/5 ${
                        i > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-400" />
                      <span className="text-[10px] text-slate-300 group-hover:text-blue-400">
                        {t(`servicesMenu.${key}`)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a href="#careers" className="transition hover:text-blue-400">
              {t('careers')}
            </a>
            <a href="#partners" className="transition hover:text-blue-400">
              {t('partners')}
            </a>
            <a href="#download" className="flex items-center text-blue-400 transition hover:text-blue-300">
              <DownloadCloud className="mr-2 h-4 w-4" />
              {t('downloads')}
            </a>
          </nav>

          {/* Desktop language / login */}
          <div className="hidden items-center space-x-6 lg:flex">
            <div className="flex items-center">
              <LanguageBar className="mr-8" />
              <a
                href="#login"
                className="text-[11px] font-black uppercase tracking-widest text-slate-300 transition hover:text-blue-400"
              >
                {t('login')}
              </a>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center text-slate-300 transition hover:text-blue-400 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col border-l border-white/10 bg-slate-950/98 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-6">
          <Logo onClick={() => setMobileOpen(false)} />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-slate-300 transition hover:text-blue-400 focus:outline-none"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-8">
          <nav className="flex flex-col space-y-6 text-sm font-bold uppercase tracking-widest text-slate-300">
            <a href="#about" onClick={() => setMobileOpen(false)} className="transition hover:text-blue-400">
              {t('about')}
            </a>
            <div className="flex flex-col space-y-3">
              <a href="#services" onClick={() => setMobileOpen(false)} className="transition hover:text-blue-400">
                {t('services')}
              </a>
              <div className="grid grid-cols-1 gap-2 border-l border-white/5 pl-4">
                {SERVICE_ITEMS.map(({ key, href }) => (
                  <a
                    key={key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="text-xs text-slate-400 transition hover:text-blue-400"
                  >
                    {t(`servicesMenu.${key}`)}
                  </a>
                ))}
              </div>
            </div>
            <a href="#careers" onClick={() => setMobileOpen(false)} className="transition hover:text-blue-400">
              {t('careers')}
            </a>
            <a href="#partners" onClick={() => setMobileOpen(false)} className="transition hover:text-blue-400">
              {t('partners')}
            </a>
            <a href="#download" onClick={() => setMobileOpen(false)} className="transition hover:text-blue-400">
              {t('downloads')}
            </a>
          </nav>

          <div className="mt-8 flex flex-col gap-6 border-t border-white/5 pt-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t('language')}
              </span>
              <LanguageBar className="space-x-3" />
            </div>
            <a
              href="#login"
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-xl border border-white/10 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-300 transition hover:border-blue-500/30 hover:bg-white/5 hover:text-blue-400"
            >
              {t('login')}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { trackLead } from '@/lib/analytics';
import {
  Search,
  ArrowRight,
  Plane,
  Ship,
  Truck,
  Train,
  PackageSearch,
  FileCheck,
  type LucideIcon,
} from 'lucide-react';

/** Static rate data — language-neutral, mirrors the original offers.js */
const HOT_OFFERS = [
  { type: 'TRUCK', route: 'VALENCIA → KYIV', price: '2.10 EUR / KM' },
  { type: 'AIR', route: 'SZX → WAW', price: '6.50 USD / KG' },
  { type: 'RAIL', route: 'CHINA → POLAND', price: '190 USD / M3' },
  { type: 'SEA', route: 'NINGBO → GDANSK', price: '1450 USD / 40HC' },
  { type: 'TRUCK', route: 'WARSAW → KYIV', price: '2.10 EUR / KM' },
  { type: 'AIR', route: 'DXB → WAW', price: '3.80 USD / KG' },
];

/** Service cards in the left rail — icons + translation keys + anchor targets */
const SERVICES: { key: string; icon: LucideIcon; href: string }[] = [
  { key: 'air', icon: Plane, href: '#service-air' },
  { key: 'sea', icon: Ship, href: '#service-sea' },
  { key: 'road', icon: Truck, href: '#service-road' },
  { key: 'rail', icon: Train, href: '#service-rail' },
  { key: 'lcl', icon: PackageSearch, href: '#service-lcl' },
  { key: 'oversized', icon: Truck, href: '#service-oversized' },
  { key: 'customs', icon: FileCheck, href: '#service-customs' },
];

/** Typewriter effect that cycles the Smart Console placeholder */
function useTypewriter(phrases: string[]) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!phrases.length) return;
    let phrase = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[phrase];
      if (!deleting) {
        char++;
        setText(current.slice(0, char));
        if (char === current.length) {
          deleting = true;
          timer = setTimeout(tick, 2200); // hold full phrase
          return;
        }
      } else {
        char--;
        setText(current.slice(0, char));
        if (char === 0) {
          deleting = false;
          phrase = (phrase + 1) % phrases.length;
        }
      }
      timer = setTimeout(tick, deleting ? 35 : 70);
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [phrases]);

  return text;
}

function HotOffersGroup() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {HOT_OFFERS.map((offer, i) => (
        <div
          key={`${offer.route}-${i}`}
          className={`flex flex-col gap-1 border-l-2 pl-3 ${
            i % 2 === 0 ? 'border-blue-500' : 'border-white/10'
          }`}
        >
          <span className="text-left text-[10px] uppercase tracking-tighter text-slate-400">
            {offer.type} / {offer.route}
          </span>
          <span className="text-left text-[13px] font-bold text-slate-200">{offer.price}</span>
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  const t = useTranslations('Hero');
  const locale = useLocale();
  const phrases = (t.raw('typewriter') as string[]) ?? [];
  const typed = useTypewriter(phrases);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // The ChatAgent bubble listens for this event and opens with the query
  function handleCalculate() {
    const q = query.trim();
    trackLead('route_search');
    window.dispatchEvent(new CustomEvent('multicargo:openChat', { detail: q }));
  }

  return (
    <section id="hero" className="relative overflow-hidden px-6 pb-12 pt-24 text-center md:pb-24 md:pt-36">
      <div className="relative mx-auto flex max-w-5xl flex-col">
        {/* Headline (title only — subtitle/tagline moved below the search on mobile) */}
        <div className="order-1 mb-4 md:mb-12">
          <h1 className="mb-2 text-4xl font-extrabold leading-tight tracking-tight text-white md:mb-4 md:text-7xl">
            {t('titleLine1')}
          </h1>
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-500 md:mb-12 md:text-6xl">
            {t('titleLine2')}
          </h2>
        </div>

        {/* Subtitle / tagline / relocant line — right under the headline on
            desktop, but pushed below the search+services on mobile so the
            search is visible without scrolling. */}
        <div className="order-4 mb-8 mt-6 md:order-2 md:mb-0 md:mt-0">
          <p className="mx-auto mb-4 max-w-3xl text-base leading-relaxed text-slate-400 md:text-xl">
            {t('subtitle')}
          </p>
          <p
            className={`mx-auto max-w-3xl text-sm font-semibold ${locale === 'uk' ? 'mb-3' : 'mb-2 md:mb-14'}`}
            style={{ color: '#60a5fa', textShadow: '0 0 20px rgba(96,165,250,0.6)' }}
          >
            {t('tagline')}
          </p>
          {locale === 'uk' && (
            <p
              className="relocant-line mx-auto mb-2 max-w-3xl text-sm font-semibold md:mb-14"
              style={{ color: '#60a5fa', textShadow: '0 0 20px rgba(96,165,250,0.5)' }}
              // t.raw returns the untouched string (contains an <a> tag) for dangerouslySetInnerHTML
              dangerouslySetInnerHTML={{ __html: t.raw('relocantLine') as string }}
            />
          )}
        </div>

        {/* Floating rails (desktop only) */}
        <div className="relative order-5 mx-auto max-w-5xl md:order-3">
          {/* Left service rail */}
          <div className="absolute left-1/2 top-0 hidden w-64 -translate-x-[700px] -translate-y-80 flex-col gap-3 xl:flex">
            {SERVICES.map(({ key, icon: Icon, href }) => (
              <a
                key={key}
                href={href}
                className="group relative flex h-[64px] cursor-pointer flex-col justify-center overflow-hidden rounded-[16px] border border-white/5 bg-slate-950/50 px-6 py-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200 group-hover:text-white">
                    {t(`services.${key}.title`)}
                  </span>
                </div>
                <div className="max-h-0 opacity-0 transition-all duration-300 group-hover:max-h-10 group-hover:opacity-100">
                  <p className="mt-1 truncate text-[9px] font-medium uppercase text-slate-400">
                    {t(`services.${key}.desc`)}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Right Hot Offers rail */}
          <div className="absolute left-1/2 top-0 hidden w-64 -translate-y-80 translate-x-[440px] flex-col xl:flex">
            <div className="flex items-center justify-between rounded-t-[16px] border-x border-t border-white/5 bg-slate-950/90 px-4 py-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                {t('hotOffers')}
              </span>
              <div className="flex gap-1">
                <div className="h-1 w-1 animate-pulse rounded-full bg-red-500" />
                <div className="h-1 w-1 rounded-full bg-red-500 opacity-50" />
              </div>
            </div>

            <div className="relative h-[453px] overflow-hidden rounded-b-[16px] border-x border-b border-white/5 bg-slate-950/40 shadow-2xl backdrop-blur-md">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                  backgroundSize: '4px 4px',
                }}
              />
              <div className="flex h-full flex-col py-4 font-mono">
                <div className="scroll-container flex flex-col px-6">
                  <HotOffersGroup />
                  <HotOffersGroup />
                </div>
              </div>
              <div className="pointer-events-none absolute left-0 top-0 h-12 w-full bg-gradient-to-b from-[#030712] to-transparent" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-[#030712] to-transparent" />
            </div>
          </div>
        </div>

        {/* Smart Console — mobile: stacked, full-width Calculate button always
            fully visible; desktop (md:): original single-row layout, untouched. */}
        <div className="order-2 relative z-20 mx-auto mb-6 mt-6 max-w-3xl md:order-4">
          {/* Mobile console */}
          <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-3 shadow-2xl backdrop-blur-lg md:hidden">
            <div className="mb-2.5 flex items-center rounded-2xl border border-white/10 bg-slate-900/60 focus-within:ring-2 focus-within:ring-blue-500/50">
              <div className="pointer-events-none flex-shrink-0 pl-3.5">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                placeholder={typed || t('searchPlaceholder')}
                className="min-w-0 flex-1 truncate bg-transparent px-3 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleCalculate}
              className="btn-glow flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              {t('calculate')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop console (unchanged) */}
          <div className="group relative z-10 hidden items-center rounded-[32px] border border-white/10 bg-slate-950/60 shadow-2xl backdrop-blur-lg transition-all focus-within:ring-2 focus-within:ring-blue-500/50 md:flex">
            <div className="pointer-events-none flex-shrink-0 pl-7">
              <Search className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              placeholder={typed || t('searchPlaceholder')}
              className="min-w-0 flex-1 truncate bg-transparent px-5 py-7 text-lg text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex-shrink-0 pr-3">
              <button
                onClick={handleCalculate}
                className="btn-glow whitespace-nowrap rounded-[22px] bg-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-95"
              >
                {t('calculate')}
              </button>
            </div>
          </div>
        </div>

        {/* Service quick-links — horizontal scroll row (mobile only; desktop
            keeps the floating left rail above, xl:flex) */}
        <div className="order-3 -mx-6 mb-8 flex gap-2.5 overflow-x-auto px-6 pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SERVICES.map(({ key, icon: Icon, href }) => (
            <a
              key={key}
              href={href}
              className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-200 backdrop-blur-md active:scale-95"
            >
              <Icon className="h-3.5 w-3.5 text-blue-400" />
              {t(`services.${key}.title`)}
            </a>
          ))}
        </div>

        {/* Newton quote */}
        <div className="order-6 mx-auto max-w-4xl border-t border-white/5 pt-8 text-center">
          <blockquote className="mb-12">
            <p className="text-2xl font-light italic leading-relaxed text-slate-300 md:text-3xl">
              &ldquo;{t('quote')}&rdquo;
            </p>
            <cite className="mt-4 block text-[10px] font-bold not-italic uppercase tracking-[0.2em] text-blue-500">
              — {t('quoteAuthor')}
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

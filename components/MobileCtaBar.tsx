'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquareText, Phone, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL, CONTACT_PHONE_HREF } from '@/lib/links';
import { trackLead } from '@/lib/analytics';

const COOKIE_BANNER_ID = 'cookie-banner';
// Read by ChatAgent/ChatWindow so the chat bubble sits above this bar.
const BAR_HEIGHT_VAR = '--cta-bar-h';

/**
 * Fixed bottom action bar for phones (< md): quote / call / WhatsApp.
 * Hidden while the contact form is on screen. Sits above the cookie banner
 * and publishes its height as a CSS variable so the AI-chat bubble lifts too.
 */
export default function MobileCtaBar() {
  const t = useTranslations('CtaBar');
  const [formVisible, setFormVisible] = useState(false);
  const [bannerOffset, setBannerOffset] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  // Hide while #contact is in view
  useEffect(() => {
    const form = document.getElementById('contact');
    if (!form) return;
    const io = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(form);
    return () => io.disconnect();
  }, []);

  // Follow the cookie banner height (it can wrap on narrow screens)
  useEffect(() => {
    let ro: ResizeObserver | null = null;

    function attach(el: HTMLElement) {
      setBannerOffset(el.getBoundingClientRect().height);
      ro = new ResizeObserver(([entry]) => setBannerOffset(entry.target.getBoundingClientRect().height));
      ro.observe(el);
    }
    function detach() {
      ro?.disconnect();
      ro = null;
      setBannerOffset(0);
    }

    const existing = document.getElementById(COOKIE_BANNER_ID);
    if (existing) attach(existing);
    const mo = new MutationObserver(() => {
      const banner = document.getElementById(COOKIE_BANNER_ID);
      if (banner && !ro) attach(banner);
      else if (!banner && ro) detach();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      ro?.disconnect();
    };
  }, []);

  // Publish the bar's height (0 when hidden or on md+) for the chat widget
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(min-width: 768px)');
    function publish() {
      const el = barRef.current;
      const h = !formVisible && !mq.matches && el ? el.getBoundingClientRect().height : 0;
      root.style.setProperty(BAR_HEIGHT_VAR, `${h}px`);
    }
    publish();
    mq.addEventListener('change', publish);
    window.addEventListener('resize', publish);
    return () => {
      mq.removeEventListener('change', publish);
      window.removeEventListener('resize', publish);
      root.style.removeProperty(BAR_HEIGHT_VAR);
    };
  }, [formVisible, bannerOffset]);

  if (formVisible) return null;

  const base =
    'flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-1 text-[10px] font-black uppercase tracking-wide transition active:scale-95';

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 z-40 flex gap-2 border-t border-white/10 bg-[#030712]/95 px-3 pt-2 backdrop-blur-md md:hidden"
      style={{
        bottom: bannerOffset,
        paddingBottom: bannerOffset ? '0.5rem' : 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <a
        href="#contact"
        onClick={() => trackLead('quote_request')}
        className={`${base} bg-blue-600 text-white shadow-lg shadow-blue-500/25`}
      >
        <MessageSquareText className="h-4 w-4" />
        {t('quote')}
      </a>
      <a
        href={CONTACT_PHONE_HREF}
        onClick={() => trackLead('phone_click')}
        className={`${base} border border-white/15 text-slate-200`}
      >
        <Phone className="h-4 w-4" />
        {t('call')}
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackLead('whatsapp_click')}
        className={`${base} border border-white/15 text-slate-200`}
      >
        <MessageCircle className="h-4 w-4" />
        {t('whatsapp')}
      </a>
    </div>
  );
}

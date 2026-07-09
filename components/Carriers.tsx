'use client';

import { useTranslations } from 'next-intl';

/**
 * Carrier logos. Most are external SVGs rendered white; Maersk is an inline
 * star; COSCO is a text badge. If an external logo fails to load we fall back
 * to a bordered text badge (mirrors the original site's onError behaviour).
 */
type Carrier =
  | { name: string; href: string; kind: 'img'; src: string; w?: number }
  | { name: string; href: string; kind: 'star' }
  | { name: string; href: string; kind: 'text' };

const CARRIERS: Carrier[] = [
  { name: 'MSC', href: 'https://www.msc.com', kind: 'img', src: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Mediterranean_Shipping_Company_logo.svg' },
  { name: 'Maersk', href: 'https://www.maersk.com', kind: 'star' },
  { name: 'CMA CGM', href: 'https://www.cma-cgm.com', kind: 'img', src: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/CMA_CGM_logo.svg' },
  { name: 'COSCO', href: 'https://www.cosco-shipping.com', kind: 'text' },
  { name: 'ZIM', href: 'https://www.zim.com', kind: 'img', src: 'https://upload.wikimedia.org/wikipedia/commons/6/69/ZIM_Logo.svg' },
  { name: 'Turkish Cargo', href: 'https://www.turkishcargo.com.tr', kind: 'img', src: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/turkishairlines.svg' },
  { name: 'Lufthansa Cargo', href: 'https://lufthansa-cargo.com', kind: 'img', src: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/lufthansa.svg' },
  { name: 'Emirates', href: 'https://www.skycargo.com', kind: 'img', src: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/emirates.svg' },
  { name: 'Qatar Airways', href: 'https://www.qatarairways.com/cargo', kind: 'img', src: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/qatarairways.svg' },
  { name: 'FedEx', href: 'https://www.fedex.com', kind: 'img', src: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/fedex.svg', w: 85 },
  { name: 'DHL', href: 'https://www.dhl.com', kind: 'img', src: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/dhl.svg', w: 85 },
];

function TextBadge({ name }: { name: string }) {
  return (
    <span className="box-border flex h-[35px] w-[70px] items-center justify-center border border-white/20 px-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white">
      {name}
    </span>
  );
}

function Mark({ carrier }: { carrier: Carrier }) {
  if (carrier.kind === 'star') {
    return (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 shrink-0">
        <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="white" />
      </svg>
    );
  }
  if (carrier.kind === 'text') {
    return <TextBadge name={carrier.name} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={carrier.src}
      alt={carrier.name}
      style={{
        width: carrier.w ?? 70,
        height: (carrier.w ?? 70) / 2,
        objectFit: 'contain',
        filter: 'brightness(0) invert(1)',
      }}
      onError={(e) => {
        const badge = document.createElement('span');
        badge.style.cssText =
          'width:70px;height:35px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:0 6px;border:1px solid rgba(255,255,255,0.2);font-weight:900;letter-spacing:0.1em;font-size:10px;text-transform:uppercase;color:white';
        badge.textContent = carrier.name;
        e.currentTarget.replaceWith(badge);
      }}
    />
  );
}

export default function Carriers() {
  const t = useTranslations('Carriers');

  return (
    <div className="mb-10">
      <p className="mb-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {t('title')}
      </p>
      <div className="flex flex-nowrap items-start justify-center gap-6 overflow-x-auto pb-2">
        {CARRIERS.map((c) => (
          <a
            key={c.name}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-[70px] shrink-0 flex-col items-center justify-between opacity-60 transition-opacity duration-300 hover:opacity-100"
          >
            <Mark carrier={c} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 transition-colors duration-300 group-hover:text-slate-300">
              {c.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

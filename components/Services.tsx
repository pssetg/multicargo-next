'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

/** id → hero image (Pexels, same as original site) */
const SERVICE_IMAGES: Record<string, string> = {
  air: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=800',
  sea: 'https://images.pexels.com/photos/262353/pexels-photo-262353.jpeg?auto=compress&cs=tinysrgb&w=800',
  road: 'https://images.pexels.com/photos/18982322/pexels-photo-18982322.jpeg?auto=compress&cs=tinysrgb&w=800',
  rail: 'https://images.pexels.com/photos/34168857/pexels-photo-34168857.jpeg?auto=compress&cs=tinysrgb&w=800',
  lcl: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  oversized: 'https://images.pexels.com/photos/6890368/pexels-photo-6890368.jpeg?auto=compress&cs=tinysrgb&w=800',
  importer: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
  courier: 'https://images.pexels.com/photos/4506249/pexels-photo-4506249.jpeg?auto=compress&cs=tinysrgb&w=1200',
  handling: 'https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=1200',
  customs: 'https://images.pexels.com/photos/8296950/pexels-photo-8296950.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const SERVICE_KEYS = [
  'air', 'sea', 'road', 'rail', 'lcl',
  'oversized', 'importer', 'courier', 'handling', 'customs',
] as const;

function ServiceCard({ id, imageLeft }: { id: string; imageLeft: boolean }) {
  const t = useTranslations('Services');
  const [open, setOpen] = useState(false);

  const image = (
    <div className="w-full flex-shrink-0 md:w-1/4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SERVICE_IMAGES[id]}
        alt={t(`items.${id}.title`)}
        className="h-[200px] w-full rounded-[20px] object-cover md:h-[284px] md:rounded-[30px]"
      />
    </div>
  );

  const body = (
    <div
      className={`mt-6 flex w-full flex-col justify-between md:mt-0 md:w-3/4 ${
        imageLeft ? 'md:pl-16 text-left' : 'text-left md:pr-16 md:text-right'
      }`}
    >
      <div>
        <h3 className="mb-6 text-3xl font-black uppercase italic tracking-tighter text-white">
          {t(`items.${id}.title`)}
        </h3>
        <p className="text-lg italic leading-relaxed text-slate-300">{t(`items.${id}.short`)}</p>
        {open && (
          <div className="mt-8 border-t border-white/5 pt-8">
            <p className="whitespace-pre-line text-lg leading-relaxed text-slate-400">
              {t(`items.${id}.full`)}
            </p>
          </div>
        )}
      </div>
      <div className={`mt-6 flex ${imageLeft ? 'justify-end' : 'justify-start'}`}>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
          {!imageLeft && (
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} strokeWidth={3} />
          )}
          <span>{open ? t('collapse') : t('moreDetails')}</span>
          {imageLeft && (
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} strokeWidth={3} />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      id={`service-${id}`}
      onClick={() => setOpen((v) => !v)}
      className={`flex h-fit min-h-[380px] cursor-pointer flex-col overflow-hidden rounded-[40px] border p-6 backdrop-blur-sm transition-all duration-300 md:flex-row md:p-12 ${
        open
          ? 'border-blue-500/30 bg-slate-900/[0.85] shadow-2xl'
          : 'border-white/5 bg-slate-900/40 hover:-translate-y-1.5 hover:border-blue-500/30 hover:shadow-xl'
      }`}
    >
      {imageLeft ? (
        <>
          {image}
          {body}
        </>
      ) : (
        <>
          {body}
          {image}
        </>
      )}
    </div>
  );
}

export default function Services() {
  return (
    <section id="services-detailed" className="bg-transparent py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="flex flex-col space-y-12">
          {SERVICE_KEYS.map((key, i) => (
            <ServiceCard key={key} id={key} imageLeft={i % 2 === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

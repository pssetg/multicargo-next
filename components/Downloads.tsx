'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  FolderOpen,
  HelpCircle,
  FileText,
  Download,
  Users,
  Truck,
  Building2,
  BookOpen,
  Plus,
  Minus,
  type LucideIcon,
} from 'lucide-react';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4'] as const;

const GLOSSARY: { key: string; code: string }[] = [
  { key: 'fcl', code: 'FCL' },
  { key: 'lcl', code: 'LCL' },
  { key: 'cbm', code: 'CBM' },
  { key: 'awb', code: 'AWB' },
  { key: 'bl', code: 'B/L' },
  { key: 'cmr', code: 'CMR' },
  { key: 't1', code: 'T1' },
  { key: 'exw', code: 'EXW' },
  { key: 'fob', code: 'FOB' },
  { key: 'hs', code: 'HS Code' },
  { key: 'eta', code: 'ETA / ETD' },
  { key: 'demurrage', code: 'Demurrage' },
];

const DOC_GROUPS: { group: string; icon: LucideIcon; docs: string[] }[] = [
  { group: 'groupClients', icon: Users, docs: ['shippingRequest', 'forwardingAgreement', 'importerChecklist', 'chinaGuide', 'incoterms'] },
  { group: 'groupCarriers', icon: Truck, docs: ['tripOrder', 'carrierAgreement', 'vehicleRequirements', 'cmrInstructions'] },
  { group: 'groupPartners', icon: Building2, docs: ['agentAgreement', 'nda', 'companyPresentation', 'logisticsGlossary'] },
];

export default function Downloads() {
  const t = useTranslations('Downloads');
  const [tab, setTab] = useState<'faq' | 'docs'>('faq');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  function showToast() {
    setToast(true);
    window.clearTimeout((window as unknown as { _dlt?: number })._dlt);
    (window as unknown as { _dlt?: number })._dlt = window.setTimeout(() => setToast(false), 3500);
  }

  const tabBtn = (active: boolean) =>
    `flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-widest transition-all ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
        : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <section id="download" className="w-full bg-transparent py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <FolderOpen className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t('badge')}
            </span>
          </div>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-400">{t('subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button onClick={() => setTab('faq')} className={tabBtn(tab === 'faq')}>
            <HelpCircle className="h-4 w-4" />
            {t('tabFaq')}
          </button>
          <button onClick={() => setTab('docs')} className={tabBtn(tab === 'docs')}>
            <FileText className="h-4 w-4" />
            {t('tabDocs')}
          </button>
        </div>

        {/* FAQ tab */}
        {tab === 'faq' && (
          <>
            <div className="mb-10">
              <GroupLabel icon={HelpCircle} label={t('faqHeading')} />
              <div className="max-w-3xl space-y-2">
                {FAQ_KEYS.map((k) => {
                  const isOpen = openFaq === k;
                  return (
                    <div key={k} className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : k)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
                      >
                        <span className="text-sm font-bold text-white">{t(`faq.${k}.q`)}</span>
                        <span className="w-5 flex-shrink-0 text-center text-blue-400">
                          {isOpen ? <Minus className="mx-auto h-4 w-4" /> : <Plus className="mx-auto h-4 w-4" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-white/5 px-6 pb-5">
                          <p className="pt-4 text-sm leading-relaxed text-slate-400">{t(`faq.${k}.a`)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Glossary */}
            <div>
              <GroupLabel icon={BookOpen} label={t('glossaryHeading')} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {GLOSSARY.map(({ key, code }) => (
                  <div key={key} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 transition-all hover:border-blue-500/20">
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-base font-black text-blue-400">{code}</span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500">
                        {t(`glossary.${key}.full`)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">{t(`glossary.${key}.desc`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Documents tab */}
        {tab === 'docs' && (
          <div className="space-y-10">
            {DOC_GROUPS.map(({ group, icon, docs }) => (
              <div key={group}>
                <GroupLabel icon={icon} label={t(group)} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {docs.map((d) => (
                    <div key={d} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-5 transition-all hover:border-blue-500/30">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/10">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-snug text-white">{t(`docs.${d}.name`)}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">
                            {t(`docs.${d}.langs`)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={showToast}
                        className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-500 active:scale-95"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t('download')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[200] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-800 px-6 py-3.5 text-center text-sm text-white shadow-2xl transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        {t('toast')}
      </div>
    </section>
  );
}

function GroupLabel({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <div className="h-px flex-1 bg-slate-800" />
    </div>
  );
}

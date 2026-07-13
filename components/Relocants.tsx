import { ShieldCheck, ClipboardCheck, PackageSearch, MessageSquare, type LucideIcon } from 'lucide-react';
import Badge from './Badge';
import { WHATSAPP_URL } from '@/lib/links';

// Ukrainian-only block — content is intentionally hard-coded (rendered only for the `uk` locale).
const CARDS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    title: 'Немає юрособи в ЄС?',
    desc: 'Ми можемо виступити офіційним імпортером від твого імені в Польщі, Іспанії або іншій країні ЄС.',
  },
  {
    icon: ClipboardCheck,
    title: 'Не знаєш митницю ЄС?',
    desc: 'Наші брокери знають кожен нюанс — коди ТН ЗЕД, антидемпінгові мита, ПДВ при імпорті. Жодних сюрпризів.',
  },
  {
    icon: PackageSearch,
    title: 'Везеш малі партії?',
    desc: 'LCL — ідеальне рішення. Починай з однієї палети. Платиш лише за свій об’єм.',
  },
];

export default function Relocants() {
  return (
    <section id="relocants" className="w-full bg-transparent py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[50px] border border-white/5 bg-slate-950/40 p-8 backdrop-blur-md md:p-16 lg:px-20 lg:py-20">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10">
            <div className="max-w-3xl space-y-6 text-left">
              <Badge label="Для українського бізнесу в Європі" pulse />
              <h2 className="text-3xl font-black uppercase italic leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
                Везеш з Азії у Польщу, Іспанію чи Німеччину?{' '}
                <span className="text-blue-400">Ми знаємо як.</span>
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-slate-400 md:text-lg">
                Ти переніс або відкрив бізнес в Європі — але постачальники залишились в Азії або США.
                Тепер між тобою і товаром стоїть незнайома митниця, нові правила ЄС та мовний бар’єр.
                Ми — українська команда з офісами у Варшаві, Гданську та Валенсії. Говоримо твоєю
                мовою — буквально.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
              {CARDS.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-[30px] border border-white/5 bg-slate-900/40 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/50 text-blue-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold uppercase tracking-wider text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 max-w-xl">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500"
              >
                <span>Поговоримо про твій маршрут</span>
                <MessageSquare className="h-5 w-5" />
              </a>
              <p className="mt-4 text-center text-xs text-slate-500">
                Більше 200 українських підприємців в Європі вже довіряють нам свою логістику.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

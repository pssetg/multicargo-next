import type { LucideIcon } from 'lucide-react';

type BadgeProps = {
  label: string;
  variant?: 'slate' | 'blue';
  size?: 'sm' | 'md';
  pulse?: boolean;
  icon?: LucideIcon;
  className?: string;
};

/** Small eyebrow pill used above section headings. */
export default function Badge({
  label,
  variant = 'slate',
  size = 'md',
  pulse = false,
  icon: Icon,
  className = '',
}: BadgeProps) {
  const sizeCls =
    size === 'sm' ? 'px-3 py-1.5 shadow-sm' : 'px-4 py-2';
  const variantCls =
    variant === 'blue'
      ? 'border-blue-600/10 bg-blue-600/5'
      : 'border-white/10 bg-white/5';
  const textCls = variant === 'blue' ? 'text-blue-400' : 'text-slate-400';
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border ${sizeCls} ${variantCls} ${className}`}
    >
      {Icon ? (
        <Icon className="h-4 w-4 text-blue-400" />
      ) : (
        <span className={`${dotSize} rounded-full bg-blue-500 ${pulse ? 'animate-pulse' : ''}`} />
      )}
      <span className={`${textSize} font-bold uppercase tracking-widest ${textCls}`}>{label}</span>
    </div>
  );
}

import type { ReactNode } from 'react';

/**
 * Shared section wrapper for consistent spacing and headings across the site.
 */
export default function Section({
  id,
  title,
  subtitle,
  children,
  className = '',
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-16 sm:py-20 ${className}`}>
      {title && (
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{subtitle}</p>
      )}
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}

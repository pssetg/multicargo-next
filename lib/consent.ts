// Cookie-consent helpers shared by the cookie banner and the footer link.

/** Dispatched by the footer "Cookie settings" link; CookieBanner listens and shows itself again. */
export const OPEN_COOKIE_BANNER_EVENT = 'multicargo:openCookieBanner';

const ANALYTICS_COOKIE_RE = /^(_ga(_.+)?|_clck|_clsk)$/;

/**
 * Deletes analytics cookies (GA4 `_ga`, `_ga_*`; Clarity `_clck`, `_clsk`).
 * They can be set on the host or on a parent domain (GA uses the registrable
 * domain), so expire them on every candidate domain.
 */
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;

  const labels = window.location.hostname.split('.');
  const domains: (string | null)[] = [null, window.location.hostname];
  for (let i = 0; i < labels.length - 1; i++) {
    const suffix = labels.slice(i).join('.');
    domains.push(suffix, `.${suffix}`);
  }

  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((n) => ANALYTICS_COOKIE_RE.test(n));

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

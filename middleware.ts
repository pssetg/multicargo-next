import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for
  // - /api, /_next, /_vercel
  // - files with an extension (e.g. /favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

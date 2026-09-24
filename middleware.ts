import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/config';
import { verifySession } from './lib/session';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// /[locale]/cabinet is gated on a valid client session cookie. Checked here
// (Edge runtime, so lib/session.ts — no node:crypto) before handing off to
// next-intl's own routing.
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cabinetMatch = pathname.match(/^\/([a-z]{2})\/cabinet(?:\/|$)/);

  if (cabinetMatch) {
    const matchedLocale = cabinetMatch[1];
    const locale = (locales as readonly string[]).includes(matchedLocale) ? matchedLocale : defaultLocale;
    const secret = process.env.SESSION_SECRET;
    const token = request.cookies.get('mc_session')?.value;
    const session = secret ? await verifySession<{ type: string }>(token, secret) : null;

    if (!session || session.type !== 'client') {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - /api, /_next, /_vercel
  // - files with an extension (e.g. /favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

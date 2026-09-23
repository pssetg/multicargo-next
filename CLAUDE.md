# multicargo-next

Next.js 14 (App Router) site for multicargoltd.com, deployed on Vercel.

## Stack

- **Framework**: Next.js 14.2 (App Router), TypeScript (strict)
- **i18n**: next-intl
- **Styling**: Tailwind CSS
- **Chat assistant**: Anthropic SDK (`@anthropic-ai/sdk`), server-side only
- **Contact form**: EmailJS (client-side)

## Structure

- `app/[locale]/...` — localized pages (layout, home page)
- `app/api/chat/route.ts` — chat assistant API route (Anthropic calls, origin/rate/length checks)
- `components/` — React components, including `ChatAgent.tsx` (chat widget UI)
- `lib/agent-config.ts` — chat assistant's company facts and system prompt builder; edit this to change what the assistant knows or says
- `lib/links.ts`, `lib/analytics.ts` — shared constants and GA4 helpers
- `messages/{en,uk,pl,es}.json` — UI translations, one file per locale
- `i18n/config.ts`, `i18n/request.ts` — locale list and message loading
- `middleware.ts` — next-intl locale routing middleware

## Languages

Four locales: `en` (default), `uk`, `pl`, `es`, driven by `messages/*.json`. URLs always carry a locale prefix (`localePrefix: 'always'`).

## Rules

- Write a plan before non-trivial changes and get it reviewed before implementing.
- Work in feature branches; never push directly to `main`.
- Secrets (e.g. `ANTHROPIC_API_KEY`) live only in server-side env vars — never prefix a secret with `NEXT_PUBLIC_`. Only genuinely public values (e.g. the EmailJS public key/IDs) may use that prefix.
- Company facts and prompt text used by the chat assistant belong in `lib/agent-config.ts`, not inline in `app/api/chat/route.ts`.

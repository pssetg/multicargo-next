# Multicargo — Next.js site

Multilingual (EN/UK/PL/ES) marketing site for Multicargo Logistics Group.
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · next-intl.

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000  (redirects to /en)
```

Copy `.env.example` to `.env.local` and fill in the values (see **Environment** below).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (+ `postbuild` generates sitemap.xml / robots.txt) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `ANALYZE=true npm run build` | Build with the bundle analyzer |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpssetg%2Fmulticargo-next&env=ANTHROPIC_API_KEY&envDescription=Server-side%20Claude%20API%20key%20for%20the%20chat%20agent)

Or import manually: **Vercel → Add New → Project → Import `pssetg/multicargo-next`**.
Vercel auto-detects Next.js. Then add the environment variables below and deploy.

## Environment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full table. Required on Vercel:

- `ANTHROPIC_API_KEY` — **server-side only**; without it the AI chat returns a
  config error in production.
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID` / `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` /
  `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` — public EmailJS config (also hard-coded as
  fallbacks, so the contact form works without them).
- `SITE_URL` — used by next-sitemap (defaults to `https://multicargoltd.com`).

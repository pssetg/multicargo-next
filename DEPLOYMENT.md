# Deployment (Vercel)

## Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**
(Production, Preview, and Development):

| Variable | Value | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(your real Claude API key)* | **Server-side only.** Without it the AI chat returns a config error on production. Do NOT prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | `service_mlc` | Public — safe to expose. Falls back to this value in code. |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | `template_j8v1gpg` | Public. |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | `r6yEzcDu-bcJvsCx5` | Public. |
| `SITE_URL` | `https://multicargoltd.com` | Used by next-sitemap for absolute URLs (optional; defaults to this). |

> ⚠️ **The chat will not work in production until `ANTHROPIC_API_KEY` is set in the
> Vercel Dashboard.** It is intentionally not committed to the repo (server secret).

## Add the key via Vercel CLI (alternative to the Dashboard)

```bash
npm i -g vercel
vercel login
vercel link                       # link this folder to the Vercel project
vercel env add ANTHROPIC_API_KEY  # paste the real key when prompted; choose Production (+ Preview/Development)
vercel --prod                     # redeploy so the new env var takes effect
```

## Notes
- The API key must be for the model used in `app/api/chat/route.ts` (`claude-haiku-4-5-20251001`).
- `sitemap.xml` and `robots.txt` are generated on `postbuild` (next-sitemap) and are gitignored.

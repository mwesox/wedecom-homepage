# wedecom-consulting.de

Company site of **Wedecom Consulting GmbH** (Olching, near Munich), founder-led
by Matthias Wesolowski.

Built with **Astro 7 + Tailwind v4**, fully static, no client-side JavaScript.
Served from **Cloudflare Workers static assets**; a small Worker handles the
contact form.

---

## Stack

| Concern   | Choice                                                         |
| --------- | -------------------------------------------------------------- |
| Framework | Astro 7 (`output: 'static'`, `trailingSlash: 'never'`)          |
| Styling   | Tailwind v4 (config-in-CSS via `@theme` in `src/styles/global.css`) |
| Font      | Bricolage Grotesque, self-hosted via `@fontsource-variable`     |
| Hosting   | Cloudflare Worker `wedecom-homepage` (`wrangler.jsonc`): static assets, `worker/index.ts` for `/api/*` |
| Contact   | Form posts to `/api/contact`; the Worker sends it through Resend, rate-limited per IP |
| SEO       | `@astrojs/sitemap`, `public/robots.txt`                         |

---

## Local development

```bash
# Node 22.22+ (CI uses Node 24)
npm install
npm run dev        # http://localhost:4321
```

Routes: `/`, `/contact`, `/contact/sent`, `/contact/failed`, `/impressum`,
`/datenschutz`, plus `404.html` for unknown paths. `POST /api/contact` exists
only in the Worker, so `npm run dev` cannot send the form.

To test the production setup (headers, 404 handling, redirects of trailing
slashes) locally:

```bash
npm run build
npx wrangler dev   # serves dist/ like Cloudflare does
```

To test the contact form, put `RESEND_API_KEY=...` in `.dev.vars`
(gitignored). A fake value exercises the failure path without sending mail.

---

## Deployment

Pushes to `main` deploy via GitHub Actions (`.github/workflows/deploy.yml`):
`npm run build`, then `wrangler deploy`. Work happens directly on `main`; see
`AGENTS.md`.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN` — API token with the "Edit Cloudflare Workers"
  template, limited to this account and the `wedecom-consulting.de` zone.
- `CLOUDFLARE_ACCOUNT_ID`

Manual deploy: `npm run deploy` (needs `wrangler login` or the env vars above).

Worker secret, set once: `npx wrangler secret put RESEND_API_KEY`.

Cloudflare-side configuration that is **not** in this repo (managed with the
`cf` CLI or the dashboard):

- Zone `wedecom-consulting.de` (Free plan), custom domains for apex and `www`
  are created by `wrangler deploy` from `wrangler.jsonc`.
- Redirect rule `www.wedecom-consulting.de/*` → `https://wedecom-consulting.de/*` (301).
- Zone settings: Always Use HTTPS on, minimum TLS 1.2.

Response headers (CSP, HSTS, caching for `/_astro/*`) live in
`public/_headers`. The CSP only allows same-origin resources, so anything
external (fonts, scripts, embeds) must be self-hosted or the CSP extended.
`vite.build.assetsInlineLimit: 0` keeps Vite from inlining assets as `data:`
URIs, which the CSP would block.

---

## Project layout

```
src/
  layouts/Base.astro       # head, meta, JSON-LD, Nav + Footer
  pages/
    index.astro            # home; `stance[]` array at the top holds the point-of-view lines
    contact.astro          # contact form, posts to /api/contact
    contact/sent.astro     # redirect target after a sent message
    contact/failed.astro   # redirect target after a rejected message
    impressum.astro        # German legal notice (§ 5 DDG)
    datenschutz.astro      # German privacy policy
    404.astro
  components/
    Nav.astro
    Footer.astro
    Section.astro          # "## LABEL" section heading + slot
  styles/global.css        # @theme tokens, layout grid, hero graph animation
worker/index.ts            # Worker: /api/contact → Resend, everything else → assets
public/                    # logo, favicons, webmanifest, robots.txt, _headers
legacy/                    # previous *.html files, kept for reference
```

The legal pages must be updated when hosting, tracking or contact channels
change.

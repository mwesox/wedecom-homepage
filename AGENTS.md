# AGENTS.md

Company site of Wedecom Consulting GmbH: static Astro site on Cloudflare Workers.
`README.md` covers stack, layout and local commands.

## Workflow

- Commit straight to `main`. No feature branches, no pull requests.
- Every push to `main` deploys to production via `.github/workflows/deploy.yml`.
  Before pushing: `npm run build` is clean, and for header or routing changes
  `npx wrangler dev` serves the pages without console or CSP errors.
- The repo is public: keep account IDs, tokens and other infra values out of
  files and commit messages; they live in GitHub secrets.

## Cloudflare setup

- Worker `wedecom-homepage` serves `dist/` as static assets (`wrangler.jsonc`),
  with custom domains for the apex and `www`. For `/api/*` it runs
  `worker/index.ts`: the contact form posts there and the Worker sends the
  message through Resend, rate-limited per IP.
- `RESEND_API_KEY` is a Worker secret (`npx wrangler secret put
  RESEND_API_KEY`). Local `wrangler dev` reads it from `.dev.vars`
  (gitignored).
- Deploy with Wrangler. The `cf` CLI beta cannot build Astro projects, so
  `cf deploy` / `cf build` / `cf init` stay unused here; `cf` (via
  `npx cf@latest`) handles zone work: DNS, rules, zone settings.
- Zone config that lives outside the repo: the 301 redirect rule
  `www` → apex, Always Use HTTPS, minimum TLS 1.2. Change it with `cf`.
- CI auth: GitHub secrets `CLOUDFLARE_API_TOKEN` (user token "wedecom-homepage
  GitHub Actions deploy": Workers Scripts, Workers Routes, Zone Read, DNS,
  Account Settings) and `CLOUDFLARE_ACCOUNT_ID`.
- Local deploy without `wrangler login`: export `CLOUDFLARE_API_TOKEN` from
  `oauth_token` in `~/Library/Preferences/cloudflare/config/default.json`
  (the `cf` login) plus `CLOUDFLARE_ACCOUNT_ID`, then `npm run deploy`.

## Site rules

- `public/_headers` sets a same-origin-only CSP. Self-host every font, script
  and image; an external resource needs a CSP change and a Datenschutz update.
  `vite.build.assetsInlineLimit: 0` keeps assets as files, since the CSP
  blocks `data:` URIs. `form-action 'self'` allows the contact form.
- Contact channels are the contact form and LinkedIn. Plain email addresses
  appear only where the law requires them (Impressum, Datenschutz).
- Pages ship no client-side JavaScript. The one animation is the CSS signal
  pulses running down the slice lanes of the hero graph; keep it the only
  moving part.
- `impressum.astro` and `datenschutz.astro` are German legal pages. Update
  Datenschutz whenever hosting, tracking, embeds or contact channels change.
- Content stays editorial: plain sections and prose, no status or
  "front-matter" metadata panels.

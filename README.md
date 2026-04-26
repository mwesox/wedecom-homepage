# wedecom-consulting.de

Personal site for **Matthias Wesolowski — Product Engineer**. Operating as
Wedecom Consulting GmbH (Munich).

Built with **Astro 5 + Tailwind v4 + a tiny React island layer for Magic UI
flourishes**. Static output → uploaded to **IONOS webspace**.

---

## Stack

| Concern         | Choice                                                   |
| --------------- | -------------------------------------------------------- |
| Framework       | Astro 5 (`output: 'static'`)                             |
| Styling         | Tailwind v4 (config-in-CSS via `@theme`)                 |
| Islands         | React 19, mounted with `client:load`                     |
| Animation       | `motion` (formerly Framer Motion) — only in islands      |
| Fonts           | Instrument Serif + JetBrains Mono (Google) · Switzer (Fontshare) |
| Hosting         | IONOS webspace (static, SFTP)                            |

Aesthetic: **editorial-technical** — Instrument Serif italic display, JetBrains
Mono accents, Switzer body. Cream paper (`#f5f1e8`), slate ink (`#2d3d51`,
matching the existing logo wordmark), electric orange (`#f26922`, the existing
brand underline) reserved as a true accent.

---

## Local development

```bash
# Node 20+ recommended. The repo was built with Node 24.
npm install --cache /tmp/npm-cache-wedecom   # local cache avoids /opt/shared perms
npm run dev                                  # http://localhost:4321
```

Routes:

- `/` — home (long-scroll: hero, tools strip, three pillars, four principles, CTA, footer)
- `/contact` — contact + LinkedIn
- `/impressum` — German Impressum (legal, verbatim from previous site)
- `/datenschutz` — German Datenschutzerklärung

---

## Building for production

```bash
npm run build      # → dist/
npm run preview    # serves dist/ locally for sanity checks
```

`dist/` contains:

```
dist/
  index.html
  contact/index.html
  impressum/index.html
  datenschutz/index.html
  _astro/<hashed JS + CSS>
  favicon.ico, *.png, site.webmanifest, logo.png
```

All pages are real `index.html` files inside folders — **no rewrite rules
needed** on IONOS.

---

## Deploying to IONOS webspace

1. `npm run build`
2. Open IONOS Webspace Explorer (or any SFTP client pointed at the IONOS
   webspace).
3. Upload the **contents** of `dist/` (not the `dist/` folder itself) into the
   webspace document root, replacing the previous static site files.
4. Visit `https://wedecom-consulting.de/`, `/contact`, `/impressum`,
   `/datenschutz` — all should load with the Instrument Serif headline visible.

### First-time tip — staging upload

Before overwriting the live root, upload `dist/` into a `/staging/` subfolder
on the webspace and verify `https://wedecom-consulting.de/staging/` works,
then move the files up.

### `.htaccess`

The site runs on plain `index.html` files inside folders, so **no rewrites
needed**. If IONOS adds an auto-generated `.htaccess`, leave it alone.

---

## Project layout

```
src/
  layouts/Base.astro          # head, fonts preconnect, JSON-LD, slot
  pages/
    index.astro               # home — long scroll
    contact.astro
    impressum.astro
    datenschutz.astro
  components/
    Nav.astro                 # sticky paper-blur navbar
    Footer.astro              # GmbH legal block + nav
    Hero.astro                # editorial hero with mono caret
    Pillar.astro              # one of three "what I do" cards
    Principle.astro           # one of four manifesto lines
    CodeLine.astro            # mono accent label
    HeroGrid.tsx              # AnimatedGridPattern island (Magic UI)
    ToolsMarquee.tsx          # Marquee island (Magic UI)
    CtaButton.tsx             # CTA + BorderBeam (Magic UI)
    magicui/
      animated-grid-pattern.tsx
      border-beam.tsx
      marquee.tsx
  styles/global.css           # @theme tokens + base + animations
  lib/utils.ts                # cn()
public/                       # logo.png, favicons, site.webmanifest
legacy/                       # previous *.html files, kept for reference
```

---

## Editing content

Most copy lives in two places:

- `src/components/Hero.astro` — hero headline, lede, CTAs.
- `src/pages/index.astro` — `pillars[]` and `principles[]` arrays at the top of
  the frontmatter. Add/remove/reorder freely. `Pillar.astro` accepts an
  `align: "left" | "right"` to alternate the asymmetric grid.

The German legal pages (`impressum.astro`, `datenschutz.astro`) hold the
verbatim TMG/§5 text from the previous site — do not paraphrase.

---

## Notes / follow-ups

- Fonts are loaded via the Google Fonts and Fontshare CSS APIs. For maximum
  performance, self-host the woff2 files under `public/fonts/` and replace the
  two `@import url(...)` lines at the top of `src/styles/global.css` with
  `@font-face` declarations.
- Auto-deploy from `main` to IONOS webspace via GitHub Actions
  (`SamKirkland/FTP-Deploy-Action`) is a 15-minute follow-up — wire it when
  manual upload becomes annoying.

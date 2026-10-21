import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://wedecom-consulting.de",
  output: "static",
  trailingSlash: "never",
  build: { format: "directory" },
  integrations: [sitemap({ filter: (page) => !/\/(404|contact\/sent|contact\/failed)$/.test(page) })],
  vite: {
    plugins: [tailwindcss()],
    // Keep every asset a file so the CSP can stay at 'self' (no data: URIs).
    build: { assetsInlineLimit: 0 },
  },
});

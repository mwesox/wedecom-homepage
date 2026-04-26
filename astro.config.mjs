import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://wedecom-consulting.de",
  output: "static",
  trailingSlash: "never",
  build: { format: "directory" },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});

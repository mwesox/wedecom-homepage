import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://wedecom-consulting.de",
  output: "static",
  trailingSlash: "never",
  build: { format: "directory" },
  vite: {
    plugins: [tailwindcss()],
  },
});

import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // The app is published to GitHub Pages as a project site, so every asset URL
  // has to carry the repo name.
  base: "/pi-dash/",

  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // main.js does the registering, so it can also ask for an update check
      // on a timer. The script this plugin injects by default offers no hook
      // for that, and having both would register the worker twice.
      injectRegister: null,
      // The kiosk never reloads by hand, so a stale service worker would pin
      // it to an old build until someone drives out to the Pi.
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        // Fonts too, so the kiosk keeps its typeface when the network drops
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        name: "Pi Dash",
        short_name: "Pi Dash",
        display: "fullscreen",
        background_color: "#0d0d10",
        theme_color: "#0d0d10",
      },
    }),
  ],

  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },

  server: { port: 8080 },

  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.js"],
    setupFiles: ["tests/setup.js"],
    // Resolve a default import from a CommonJS package the way the browser
    // build does - to the whole module - rather than quietly unwrapping its
    // `.default`. With Vitest's default here, `import Timer from
    // "easytimer.js"` yields a constructor in tests and a plain object in the
    // browser, and the smoke test passes over exactly the bug it exists for.
    deps: { interopDefault: false },
  },
});

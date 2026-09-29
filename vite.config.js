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
      // The kiosk never reloads by hand, so a stale service worker would pin
      // it to an old build until someone drives out to the Pi.
      workbox: { clientsClaim: true, skipWaiting: true },
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
});

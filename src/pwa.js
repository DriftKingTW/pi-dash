import { registerSW } from "virtual:pwa-register";

// The kiosk holds one page open for weeks. A browser only re-checks the
// service worker script on a navigation or about once a day, and this page
// never navigates, so a deploy could sit unseen on the wall until someone
// restarted Chromium by hand - which is exactly what happened on 2026-10-05.
export const UPDATE_CHECK_MS = 30 * 60 * 1000;

/**
 * Registers the service worker and keeps asking it to look for a new build.
 *
 * The worker is registered with autoUpdate, so the page reloads itself once a
 * new build is precached; all this adds is the asking.
 */
export function registerWithUpdateChecks({
  interval = UPDATE_CHECK_MS,
  register = registerSW,
} = {}) {
  register({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      // No registration when the browser has no service worker support, or
      // when the page is served over plain HTTP in development
      if (!registration) return;

      setInterval(() => {
        // Offline the check can only fail, and the dashboard spends real time
        // offline whenever the Wi-Fi drops
        if (navigator.onLine) registration.update().catch(() => {});
      }, interval);
    },
  });
}

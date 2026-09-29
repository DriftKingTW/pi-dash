// Browser APIs the kiosk's Chromium has and jsdom does not. Stubbed only so
// components that use them can mount; nothing here is under test.

// v-calendar watches its own size.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

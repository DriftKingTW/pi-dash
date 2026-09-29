// Mounts every component once and fails on anything Vue reports.
//
// Written after two components passed a visual check and were still broken:
// easytimer.js and simple-keyboard were imported by default, which under Vite
// yields a wrapper object, so `new` threw in the mounted hook. The timer and
// the on-screen keyboard both rendered normally and did nothing, and the only
// trace was in the browser console. This catches that class of failure.
//
// It listens to Vue's own errorHandler and warnHandler rather than to
// console.error, because components log expected failures (an unreachable
// server, say) to the console as a matter of course. An exception thrown in a
// lifecycle hook always passes through errorHandler; a network error that a
// component catches never does.
import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";

// No test should reach the network. A request that never settles leaves each
// component where it would be while waiting on a slow server, which is also
// the state it spends most of its life in on the kiosk.
vi.mock("axios", () => {
  const pending = () => new Promise(() => {});
  const axios = { get: vi.fn(pending), post: vi.fn(pending), defaults: {} };
  return { default: axios };
});

// Picked up automatically, so a new component is covered without touching
// this file.
const components = import.meta.glob(["../src/**/*.vue"]);

function mountCapturingProblems(component) {
  const problems = [];
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/test", component: { template: "<div />" } },
    ],
  });

  const wrapper = mount(component, {
    attachTo: document.body,
    global: {
      plugins: [createPinia(), router],
      config: {
        errorHandler: (err, _instance, info) =>
          problems.push(`error in ${info}: ${err?.stack?.split("\n")[0] ?? err}`),
        warnHandler: (msg) => problems.push(`warning: ${msg}`),
      },
    },
  });

  return { wrapper, problems };
}

let mounted = null;
afterEach(() => {
  mounted?.unmount();
  mounted = null;
  document.body.innerHTML = "";
});

describe("every component mounts cleanly", () => {
  it("finds the components it is meant to cover", () => {
    // Guards the glob itself: a path change that matched nothing would make
    // every test below vanish and the suite pass while checking nothing.
    expect(Object.keys(components).length).toBeGreaterThanOrEqual(16);
  });

  for (const [path, load] of Object.entries(components)) {
    const name = path.replace("../src/", "");

    it(name, async () => {
      const { default: component } = await load();
      const { wrapper, problems } = mountCapturingProblems(component);
      mounted = wrapper;

      // Let async mounted hooks run up to their first await.
      await flushPromises();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(problems).toEqual([]);
    });
  }
});

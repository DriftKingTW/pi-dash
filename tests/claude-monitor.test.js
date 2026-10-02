// The account line is the one part of this card that identifies whose quota is
// on screen, and it comes from a field the bridge only started sending
// recently. A payload that loses it has to fail here rather than quietly go
// back to a card that says "Claude Code" and nothing about which account.
import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

const get = vi.fn();
vi.mock("axios", () => ({ default: { get, defaults: {} } }));

const { default: ClaudeMonitor } = await import(
  "../src/components/blocks/ClaudeMonitor.vue"
);

function payload(overrides = {}) {
  return {
    v: 1,
    ts: Math.floor(Date.now() / 1000),
    age: 0,
    limits: {
      h5: { pct: 25, reset: Math.floor(Date.now() / 1000) + 3600 },
      d7: { pct: 77, reset: Math.floor(Date.now() / 1000) + 86400 },
    },
    account: { email: "someone@example.com", plan: "Pro" },
    session: { model: "Opus 5", ctx: 12, effort: "high", cwd: "pi-dash" },
    today: { cost: 4.21, tok: 1200000, msgs: 83, sessions: 2 },
    week: [{ d: "10-02", cost: 4.21 }],
    bridge: { live: true, cachedSeconds: 0 },
    ...overrides,
  };
}

async function mountWith(data) {
  get.mockResolvedValue({ data });
  const wrapper = mount(ClaudeMonitor);
  await flushPromises();
  return wrapper;
}

let mounted = null;
afterEach(() => {
  mounted?.unmount();
  mounted = null;
  get.mockReset();
});

describe("ClaudeMonitor", () => {
  it("names the signed-in account and its plan", async () => {
    mounted = await mountWith(payload());
    expect(mounted.text()).toContain("someone@example.com · Pro");
  });

  it("shows the account alone when the config names no plan", async () => {
    mounted = await mountWith(
      payload({ account: { email: "someone@example.com", plan: null } })
    );
    const text = mounted.text();
    expect(text).toContain("someone@example.com");
    // No separator left dangling after the dropped half.
    expect(text).not.toContain("someone@example.com ·");
  });

  // Signed out on the Mac, or an older bridge that does not send the field.
  it("leaves the line out entirely when there is no account", async () => {
    mounted = await mountWith(payload({ account: null }));
    expect(mounted.text()).not.toContain("@");
    // The rest of the card still reports, rather than failing with it.
    expect(mounted.text()).toContain("25%");
  });
});

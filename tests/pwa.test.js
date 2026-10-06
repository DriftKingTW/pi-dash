// Nothing on screen says whether the update check is running, so a silent
// failure here looks exactly like the kiosk being up to date. The timer is
// worth asserting on.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("virtual:pwa-register", () => ({ registerSW: vi.fn() }));

const { registerWithUpdateChecks, UPDATE_CHECK_MS } = await import(
  "../src/pwa.js"
);

// Stands in for vite-plugin-pwa's registerSW: hands the caller a registration
// the way the real one does once the browser has registered the worker.
function fakeRegister(registration) {
  return vi.fn((options) => options.onRegisteredSW?.("/sw.js", registration));
}

let onLine;
beforeEach(() => {
  vi.useFakeTimers();
  onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
});

afterEach(() => {
  vi.useRealTimers();
  onLine.mockRestore();
});

describe("registerWithUpdateChecks", () => {
  it("asks the worker to look for a new build, over and over", () => {
    const registration = { update: vi.fn().mockResolvedValue(undefined) };
    registerWithUpdateChecks({ register: fakeRegister(registration) });

    expect(registration.update).not.toHaveBeenCalled();
    vi.advanceTimersByTime(UPDATE_CHECK_MS * 3);
    expect(registration.update).toHaveBeenCalledTimes(3);
  });

  it("registers immediately, so the worker is live before the first check", () => {
    const register = fakeRegister({ update: vi.fn() });
    registerWithUpdateChecks({ register });

    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({ immediate: true })
    );
  });

  it("skips the check while the browser says it is offline", () => {
    const registration = { update: vi.fn().mockResolvedValue(undefined) };
    registerWithUpdateChecks({ register: fakeRegister(registration) });

    onLine.mockReturnValue(false);
    vi.advanceTimersByTime(UPDATE_CHECK_MS * 2);
    expect(registration.update).not.toHaveBeenCalled();

    onLine.mockReturnValue(true);
    vi.advanceTimersByTime(UPDATE_CHECK_MS);
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  // A rejected update must not take the page down with it: an unhandled
  // rejection every 30 minutes would be its own problem.
  it("swallows a failed check", () => {
    const registration = {
      update: vi.fn().mockRejectedValue(new Error("network")),
    };
    registerWithUpdateChecks({ register: fakeRegister(registration) });

    expect(() => vi.advanceTimersByTime(UPDATE_CHECK_MS)).not.toThrow();
  });

  // No service worker support, or plain HTTP in development.
  it("does nothing when there is no registration", () => {
    const register = fakeRegister(undefined);
    expect(() =>
      registerWithUpdateChecks({ register })
    ).not.toThrow();
    expect(register).toHaveBeenCalled();
  });
});

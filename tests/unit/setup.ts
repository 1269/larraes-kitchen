// Source: Plan 03-03 Task 1 — jsdom env setup + RTL cleanup between tests.
// Deliberately avoids @testing-library/jest-dom (not installed) — assertions use
// plain toBeTruthy / toHaveAttribute via Element instance checks.
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia — motion-reduce code paths in the wizard
// touch it. Polyfill a noop MediaQueryList so `useEffect` chains don't throw.
if (typeof window !== "undefined" && !window.matchMedia) {
  // biome-ignore lint/suspicious/noExplicitAny: test polyfill
  window.matchMedia = ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList) as any;
}

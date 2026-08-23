import "@testing-library/jest-dom";

// Worker tests run under the node environment (no `window`) via the
// "worker" project in vitest.config.ts, but this setup file still runs for
// every test file across both projects.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

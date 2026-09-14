import "@testing-library/jest-dom";

// Mock layout dimensions for jsdom to support @tanstack/react-virtual virtualization
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  value: 600,
});
Object.defineProperty(HTMLElement.prototype, "clientHeight", {
  configurable: true,
  value: 600,
});
Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
  configurable: true,
  value: 2000,
});

if (!HTMLElement.prototype.scrollTo) {
  HTMLElement.prototype.scrollTo = () => {};
}

// Mock ResizeObserver for components using it
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

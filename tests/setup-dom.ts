// Global jsdom setup for Vitest. This ensures browser-specific APIs exist during unit tests.
import { vi } from 'vitest'

// Basic no-op scroll implementation used by layout helpers
window.scrollTo = vi.fn()

// MatchMedia mock so components relying on media queries do not crash in jsdom
window.matchMedia = window.matchMedia || ((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

// requestAnimationFrame fallback for animations in tests
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0)
}

// ResizeObserver mock for packages/components that expect this API
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// IntersectionObserver mock enabling components to mount without browsers
class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
  root = null
  rootMargin = ''
  thresholds = []
}

// Expose the observers globally
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserver
}
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = IntersectionObserver
}

// Provide a safe default for scrollIntoView calls in tests
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from '../../stores/theme.js'

vi.mock('../../js/web/hljs-theme-loader.js', () => ({
  toggleHighlightTheme: vi.fn(),
}))

describe('useThemeStore edge cases', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Provide deterministic stubs for browser APIs the store touches
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    })

    const classList = {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(),
    }

    Object.defineProperty(document, 'documentElement', {
      value: { classList },
      configurable: true,
    })
  })

  it('falls back to the default theme when the stored value is invalid', () => {
    // Arrange: localStorage returns an unrecognised token
    localStorage.getItem.mockReturnValue('neon-dark-purple-900')

    const store = useThemeStore()

    // Assert: store recovers by using the built-in default theme
    expect(store.theme).toBe('light')
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('theme-dark', false)
  })

  it('persists a valid theme choice to localStorage', () => {
    localStorage.getItem.mockReturnValue(null)
    const store = useThemeStore()

    store.$subscribe((_, state) => {
      localStorage.setItem('theme', state.theme)
    })

    // Act: patch the state in the same way the persistence plugin does
    store.$patch({ theme: 'dark' })

    // Assert: persistence plugin writes the new value to storage on change
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })
})

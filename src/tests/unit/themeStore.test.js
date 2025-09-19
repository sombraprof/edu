import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('../../js/web/hljs-theme-loader.js', () => ({
  toggleHighlightTheme: vi.fn(),
}))

import { toggleHighlightTheme } from '../../js/web/hljs-theme-loader.js'
import { useThemeStore } from '../../stores/theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.className = ''
    document.head.innerHTML = '<meta name="theme-color" content="#1976d2" />'
    localStorage.getItem.mockReset()
    localStorage.getItem.mockReturnValue('light')
    vi.clearAllMocks()
    window.matchMedia = vi.fn().mockImplementation((media) => ({
      matches: false,
      media,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it('initialises with the light theme applied', () => {
    const store = useThemeStore()

    expect(store.theme).toBe('light')
    expect(store.isDark).toBe(false)
    expect(toggleHighlightTheme).toHaveBeenCalledWith(false)
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false)
    const meta = document.querySelector('meta[name="theme-color"]')
    expect(meta?.getAttribute('content')).toBe('#1976d2')
  })

  it('toggles to dark mode and updates highlight theme', () => {
    const store = useThemeStore()
    toggleHighlightTheme.mockClear()

    store.toggleTheme()

    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
    expect(toggleHighlightTheme).toHaveBeenCalledWith(true)

    const meta = document.querySelector('meta[name="theme-color"]')
    expect(meta?.getAttribute('content')).toBe('#121212')
  })

  it('allows explicit theme application', () => {
    const store = useThemeStore()
    toggleHighlightTheme.mockClear()

    store.applyTheme('dark')
    expect(store.theme).toBe('dark')
    expect(toggleHighlightTheme).toHaveBeenCalledWith(true)

    store.applyTheme('light')
    expect(store.theme).toBe('light')
    expect(toggleHighlightTheme).toHaveBeenLastCalledWith(false)
  })

  it('defaults to dark when system preference is dark and nothing is saved', () => {
    localStorage.getItem.mockReturnValue(null)
    window.matchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const store = useThemeStore()

    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
    expect(toggleHighlightTheme).toHaveBeenCalledWith(true)
    const meta = document.querySelector('meta[name="theme-color"]')
    expect(meta?.getAttribute('content')).toBe('#121212')
  })
})

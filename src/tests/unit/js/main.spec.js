import { describe, expect, it, vi, afterEach } from 'vitest'
import { initTheme, initRouter, isSpaRoute } from '../../../js/main.js'

afterEach(() => {
  // Ensure mocks do not leak between tests
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.className = ''
})

describe('initTheme', () => {
  it('applies the dark theme when storage contains a persisted dark value', () => {
    const fakeStorage = {
      getItem: vi.fn().mockReturnValue('{"theme":"dark"}'),
      setItem: vi.fn(),
    }
    vi.stubGlobal('localStorage', fakeStorage)

    const addSpy = vi.spyOn(document.documentElement.classList, 'add')
    const removeSpy = vi.spyOn(document.documentElement.classList, 'remove')

    const result = initTheme()

    expect(fakeStorage.getItem).toHaveBeenCalledWith('theme')
    expect(addSpy).toHaveBeenCalledWith('theme-dark')
    expect(removeSpy).not.toHaveBeenCalled()
    expect(result).toBe('dark')
  })

  it('falls back to the light theme when storage is invalid', () => {
    const fakeStorage = {
      getItem: vi.fn().mockReturnValue('not-json-or-theme'),
      setItem: vi.fn(),
    }
    vi.stubGlobal('localStorage', fakeStorage)

    const addSpy = vi.spyOn(document.documentElement.classList, 'add')
    const removeSpy = vi.spyOn(document.documentElement.classList, 'remove')

    const result = initTheme()

    expect(fakeStorage.getItem).toHaveBeenCalledWith('theme')
    expect(addSpy).not.toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalledWith('theme-dark')
    expect(result).toBe('light')
  })
})

describe('initRouter', () => {
  it('delegates to the provided factory and returns its router instance', () => {
    const routerInstance = { install: vi.fn() }
    const factory = vi.fn().mockReturnValue(routerInstance)

    const result = initRouter(factory)

    expect(factory).toHaveBeenCalledTimes(1)
    expect(result).toBe(routerInstance)
  })
})

describe('isSpaRoute', () => {
  const cases = [
    { path: '/', expected: true },
    { path: '/lesson/1', expected: true },
    { path: '/policy.pdf', expected: false },
    { path: '/assets/app.js', expected: false },
    { path: '', expected: true },
  ]

  it('identifies SPA-managed paths using a table-driven approach', () => {
    cases.forEach(({ path, expected }) => {
      expect(isSpaRoute(path)).toBe(expected)
    })
  })
})

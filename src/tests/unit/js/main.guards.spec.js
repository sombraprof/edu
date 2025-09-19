import { describe, expect, it, vi, afterEach } from 'vitest'
import { initTheme, initRouter, isSpaRoute } from '../../../js/main.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('initRouter guard clauses', () => {
  it('throws when the factory does not return a router instance', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const cases = [
      { name: 'null return', factory: () => null },
      { name: 'undefined return', factory: () => undefined },
    ]

    cases.forEach(({ name, factory }) => {
      expect(() => initRouter(factory)).toThrowError('initRouter: routerFactory must return a router instance')
    })

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('initTheme defensive branches', () => {
  const makeDoc = (withClassList = true) => {
    const classList = withClassList
      ? { toggle: vi.fn() }
      : undefined
    return {
      documentElement: classList ? { classList } : undefined,
    }
  }

  const storageStub = (value, shouldThrow = false) => ({
    getItem: shouldThrow
      ? () => {
          throw new Error('storage error')
        }
      : () => value,
  })

  it('normalises themes using table-driven scenarios', () => {
    const cases = [
      { name: 'dark string', storageValue: '"dark"', expected: 'dark', withClassList: true },
      { name: 'invalid json', storageValue: 'oops', expected: 'light', withClassList: true },
      { name: 'object payload', storageValue: '{"theme":"dark"}', expected: 'dark', withClassList: true },
      { name: 'no classList', storageValue: null, expected: 'light', withClassList: false },
      { name: 'storage throws', storageValue: null, expected: 'light', withClassList: true, throws: true },
    ]

    cases.forEach(({ name, storageValue, expected, withClassList, throws }) => {
      const doc = makeDoc(withClassList)
      const storage = storageStub(storageValue, throws)
      const result = initTheme(doc, storage)
      expect(result, name).toBe(expected)
      const toggler = doc.documentElement?.classList?.toggle
      if (toggler) {
        expect(toggler).toHaveBeenCalledWith('theme-dark', result === 'dark')
      }
    })
  })
})

describe('isSpaRoute fallback behaviour', () => {
  it('defaults to treating non-string paths as SPA routes', () => {
    const cases = [
      { input: undefined, expected: true },
      { input: null, expected: true },
      { input: 42, expected: true },
      { input: {}, expected: true },
      { input: '/index.html', expected: false },
    ]

    cases.forEach(({ input, expected }) => {
      expect(isSpaRoute(input)).toBe(expected)
    })
  })
})

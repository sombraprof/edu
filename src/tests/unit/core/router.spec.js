import { beforeEach, describe, expect, it, vi } from 'vitest'
import router, { routes, createRouter, computeLastRouteSnapshot } from '../../../js/core/router.js'

describe('core router configuration', () => {
  it('exposes the expected named routes', () => {
    // Ensure the routes array contains the primary entry points we rely on
    const routeNames = routes.map((route) => route.name)
    expect(routeNames).toEqual(expect.arrayContaining(['home', 'lesson', 'exercise', 'policy']))
  })

  const resolutionCases = [
    {
      name: 'resolves a known route by name',
      input: { name: 'lesson', params: { id: '42' } },
      expectation: (location) => {
        expect(location.fullPath).toBe('/lesson/42')
      },
    },
    {
      name: 'preserves query and hash fragments in string based resolution',
      input: '/lesson/5?tab=notes#summary',
      expectation: (location) => {
        expect(location.fullPath).toBe('/lesson/5?tab=notes#summary')
        expect(location.hash).toBe('#summary')
      },
    },
  ]

  resolutionCases.forEach(({ name, input, expectation }) => {
    it(name, () => {
      const location = router.resolve(input)
      expectation(location)
    })
  })

  it('returns no matches for unknown paths (404 fallback)', () => {
    const result = router.resolve('/definitely-not-configured')
    expect(result.matched).toHaveLength(0)
  })
})

describe('router persistence guard', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('persists lesson ids when navigating to lessons', async () => {
    const testRouter = createRouter()
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem')

    try {
      await testRouter.push('/')
      await testRouter.isReady()

      await testRouter.push({ name: 'lesson', params: { id: '99' } })
      expect(setItemSpy).toHaveBeenCalledWith('lastRoute', 'lesson=99')
    } finally {
      setItemSpy.mockRestore()
    }
  })
})

describe('computeLastRouteSnapshot', () => {
  const cases = [
    {
      name: 'returns encoded snapshot for valid lesson route',
      input: { name: 'lesson', params: { id: '101' } },
      expected: 'lesson=101',
    },
    {
      name: 'encodes special characters in params',
      input: { name: 'lesson', params: { id: 'áé í' } },
      expected: `lesson=${encodeURIComponent('áé í')}`,
    },
    {
      name: 'returns null when id is falsy',
      input: { name: 'lesson', params: { id: '' } },
      expected: null,
    },
    {
      name: 'returns null when name is missing',
      input: { name: '', params: { id: '55' } },
      expected: null,
    },
    {
      name: 'returns null for null input',
      input: null,
      expected: null,
    },
    {
      name: 'returns null when params object is missing',
      input: { name: 'lesson' },
      expected: null,
    },
  ]

  cases.forEach(({ name, input, expected }) => {
    it(name, () => {
      expect(computeLastRouteSnapshot(input)).toBe(expected)
    })
  })
})

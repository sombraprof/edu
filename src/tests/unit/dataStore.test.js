import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDataStore } from '../../stores/data'

const lessonsFixture = [
  {
    titulo: 'Sorting Basics',
    descricao: 'Introduction to sorting algorithms.',
    arquivo: 'lesson1.html',
    unidade: 'Introdução',
    ativo: true,
  },
  {
    titulo: 'Recursion 101',
    descricao: 'Understanding recursion.',
    arquivo: 'lesson2.html',
    unidade: 'Avançado',
    ativo: false,
  },
]

const exercisesFixture = [
  {
    titulo: 'Sorting Drill',
    descricao: 'Practice sorting arrays.',
    arquivo: 'exercise1.json',
  },
  {
    titulo: 'Recursion Drill',
    descricao: 'Practice recursion problems.',
    arquivo: 'exercise2.json',
  },
]

const createJsonResponse = (payload) =>
  Promise.resolve({
    ok: true,
    json: async () => payload,
  })

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useDataStore', () => {
  it('loads lessons and exercises from the API', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('lessons')) {
        return createJsonResponse(lessonsFixture)
      }
      if (url.includes('exercises')) {
        return createJsonResponse(exercisesFixture)
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`))
    })

    const store = useDataStore()
    await store.loadData()

    expect(global.fetch).toHaveBeenCalledWith('lessons/lessons.json')
    expect(global.fetch).toHaveBeenCalledWith('exercises/exercises.json')

    expect(store.lessons).toHaveLength(2)
    expect(store.exercises).toHaveLength(2)
    expect(store.filteredLessons).toHaveLength(2)
    expect(store.filteredExercises).toHaveLength(2)
    expect(store.lessons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'lesson1', status: 'available' }),
        expect.objectContaining({ id: 'lesson2', status: 'soon' }),
      ]),
    )
    expect(window.__LESSONS_META).toEqual(lessonsFixture)
    expect(window.__EXERCISES_META).toEqual(exercisesFixture)
  })

  it('groups filtered lessons by unit', () => {
    const store = useDataStore()

    store.filteredLessons = [
      {
        id: 'lesson1',
        title: 'Sorting Basics',
        description: 'Introduction to sorting algorithms.',
        status: 'available',
        unit: 'Introdução',
        ativo: true,
      },
      {
        id: 'lesson2',
        title: 'Recursion 101',
        description: 'Understanding recursion.',
        status: 'soon',
        unit: 'Avançado',
        ativo: false,
      },
    ]

    const groups = store.groupedFilteredLessons

    expect(Object.keys(groups)).toEqual(
      expect.arrayContaining(['Introdução', 'Avançado']),
    )
    expect(groups['Introdução']).toHaveLength(1)
    expect(groups['Avançado']).toHaveLength(1)
  })

  it('applies filters to toggle lesson and exercise lists', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('lessons')) {
        return createJsonResponse(lessonsFixture)
      }
      if (url.includes('exercises')) {
        return createJsonResponse(exercisesFixture)
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`))
    })

    const store = useDataStore()
    await store.loadData()

    store.applyFilters('lessons')
    expect(store.filteredLessons).toHaveLength(2)
    expect(store.filteredExercises).toHaveLength(0)

    store.applyFilters('exercises')
    expect(store.filteredLessons).toHaveLength(0)
    expect(store.filteredExercises).toHaveLength(2)

    store.applyFilters('all')
    expect(store.filteredLessons).toHaveLength(2)
    expect(store.filteredExercises).toHaveLength(2)
  })

  it('captures errors when fetching data fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      }),
    )

    // Silence noisy logs during the negative path so the suite output stays clean
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useDataStore()
    await store.loadData()

    expect(store.error).toBe('Failed to load lessons.')
    expect(store.loading).toBe(false)
    expect(store.lessons).toHaveLength(0)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('captures malformed lesson payloads and surfaces a friendly error', async () => {
    // Arrange: simulate a network success with an unexpected JSON shape to trigger the catch path
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = vi.fn((url) => {
      if (url.includes('lessons')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ malformed: true }),
        })
      }
      if (url.includes('exercises')) {
        return Promise.resolve({
          ok: true,
          json: async () => exercisesFixture,
        })
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`))
    })

    const store = useDataStore()
    await store.loadData()

    // Assert: the store reports the failure without retaining partial data
    expect(store.lessons).toHaveLength(0)
    expect(store.filteredLessons).toHaveLength(0)
    expect(store.error).toBeDefined()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('skips reloading data when cache is populated', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('lessons')) {
        return createJsonResponse(lessonsFixture)
      }
      if (url.includes('exercises')) {
        return createJsonResponse(exercisesFixture)
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`))
    })

    const store = useDataStore()
    await store.loadData()
    expect(global.fetch).toHaveBeenCalledTimes(2)

    global.fetch.mockClear()
    await store.loadData()
    expect(global.fetch).not.toHaveBeenCalled()
    expect(store.loading).toBe(false)
  })
})

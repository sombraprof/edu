import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFiltersStore } from '../../stores/filters'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useFiltersStore', () => {
  it('exposes default state', () => {
    const store = useFiltersStore()

    expect(store.currentFilter).toBe('all')
    expect(store.currentViewMode).toBe('grid')
  })

  it('updates the current filter', () => {
    const store = useFiltersStore()

    store.setFilter('lessons')
    expect(store.currentFilter).toBe('lessons')

    store.setFilter('exercises')
    expect(store.currentFilter).toBe('exercises')
  })

  it('updates the view mode', () => {
    const store = useFiltersStore()

    store.setViewMode('list')
    expect(store.currentViewMode).toBe('list')
  })
})

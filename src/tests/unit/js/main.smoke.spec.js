import { describe, expect, it, vi } from 'vitest'

vi.mock('virtual:pwa-register', () => ({
  registerSW: vi.fn(() => () => {}),
}))

describe('main entry smoke test', () => {
  it('loads without throwing', async () => {
    // Dynamically import the entry module to ensure the virtual dependencies are mocked
    const main = await import('../../../js/main.js')
    // This expectation simply asserts that the module resolved successfully
    expect(Boolean(main)).toBe(true)
  })
})

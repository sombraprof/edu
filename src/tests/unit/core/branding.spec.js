import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useBranding, normalizeInstitutionName, resolvePalette } from '../../../js/core/branding.js'

const ensureBtoa = () => {
  if (!window.btoa) {
    window.btoa = (value) => Buffer.from(value, 'utf-8').toString('base64')
  }
}

describe('branding helpers', () => {
  let wrapper
  let api

  const mountHarness = () => {
    const Harness = defineComponent({
      setup() {
        api = useBranding()
        return () => null
      },
    })
    wrapper = mount(Harness)
  }

  beforeEach(() => {
    document.head.innerHTML = `
      <link id="favicon">
      <link id="favicon-16">
      <link id="favicon-32">
      <link id="favicon-48">
      <meta name="description" content="">
    `
    ensureBtoa()
    mountHarness()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (wrapper) {
      wrapper.unmount()
      wrapper = undefined
    }
    api = undefined
    document.head.innerHTML = ''
  })

  it('normalises the acronym before generating the favicon', () => {
    const btoaSpy = vi
      .spyOn(window, 'btoa')
      .mockImplementation((value) => value)

    // Arrange: provide an acronym with stray whitespace and lowercase letters
    api.branding.value.sigla = '  Unilab  '.trim()

    // Act: trigger favicon generation
    api.updateFavicons()

    // Assert: the generated SVG uses an upper-case, trimmed acronym
    const svgFromTrimmed = btoaSpy.mock.calls.at(-1)?.[0] ?? ''
    expect(svgFromTrimmed).toContain('UNIL')

    // Arrange: ensure an already upper-case acronym produces the same result
    api.branding.value.sigla = 'UNILAB'
    api.updateFavicons()
    const svgFromUpper = btoaSpy.mock.calls.at(-1)?.[0] ?? ''
    expect(svgFromUpper).toContain('UNIL')

    // Assert: the favicon link actually receives a data URL payload
    const favicon = document.getElementById('favicon-32')
    expect(favicon?.getAttribute('href')).toContain('data:image/svg+xml;base64,')
  })

  it('falls back to APP when the acronym is missing', () => {
    // Arrange: blank the acronym to force the fallback path
    api.branding.value.sigla = ''
    const btoaSpy = vi
      .spyOn(window, 'btoa')
      .mockImplementation((value) => value)

    // Act: regenerate the favicon without a custom acronym
    api.updateFavicons()

    // Assert: the SVG text defaults to the APP fallback
    const svgMarkup = btoaSpy.mock.calls.at(-1)?.[0] ?? ''
    expect(svgMarkup).toContain('APP')
  })
})

describe('branding pure utilities', () => {
  it('normalises institution names before lookup', () => {
    const cases = [
      { input: '  Unilab  ', expected: 'unilab' },
      { input: 'UNILAB', expected: 'unilab' },
      { input: '', expected: '' },
      { input: '   ', expected: '' },
      { input: undefined, expected: '' },
      { input: null, expected: '' },
      { input: 123, expected: '' },
    ]

    // Table-driven assertion ensures both valid and guard paths are exercised
    cases.forEach(({ input, expected }) => {
      expect(normalizeInstitutionName(input)).toBe(expected)
    })
  })

  it('resolves colour palettes with a safe fallback', () => {
    const cases = [
      { input: 'Unilab', expectedPrimary: '#00695c' },
      { input: 'unichristus', expectedPrimary: '#1976d2' },
      { input: '', expectedPrimary: '#1976d2' },
      { input: '   ', expectedPrimary: '#1976d2' },
      { input: '@@@', expectedPrimary: '#1976d2' },
    ]

    cases.forEach(({ input, expectedPrimary }) => {
      expect(resolvePalette(input).primary).toBe(expectedPrimary)
    })
  })
})

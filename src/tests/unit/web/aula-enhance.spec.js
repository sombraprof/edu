import { beforeEach, describe, expect, it } from 'vitest'
import {
  enhanceAulaPage,
  shouldEnhance,
  markEnhanced,
} from '../../../js/web/aula-enhance.js'

const selector = '#content'

describe('aula enhance integration', () => {
  beforeEach(() => {
    // Provide a fresh DOM snippet before each test.
    document.body.innerHTML = `
      <main id="content">
        <section id="s1" data-enhance="true"><h2>Aula</h2></section>
        <section id="s2"><h2>Sem enhance</h2></section>
        <section id="s3" data-enhance="true" data-enhanced="true"><h2>Já</h2></section>
      </main>`
  })

  it('marks eligible sections when enhancing the page', () => {
    enhanceAulaPage(document)

    const enhanced = document.querySelector('#s1')
    expect(enhanced?.dataset.enhanced).toBe('true')
    expect(enhanced?.classList.contains('aula-enhanced')).toBe(true)
  })

  it('leaves sections without the enhance flag untouched', () => {
    enhanceAulaPage(document)

    const untouched = document.querySelector('#s2')
    expect(untouched?.dataset.enhanced).toBeUndefined()
    expect(untouched?.classList.contains('aula-enhanced')).toBe(false)
  })

  it('does not reprocess already enhanced sections on repeated runs', () => {
    const preEnhanced = document.querySelector('#s3')
    expect(preEnhanced?.hasAttribute('data-enhanced-id')).toBe(false)

    enhanceAulaPage(document)
    enhanceAulaPage(document)

    expect(preEnhanced?.dataset.enhanced).toBe('true')
    expect(preEnhanced?.hasAttribute('data-enhanced-id')).toBe(false)
  })

  it('guards when the root container is missing', () => {
    document.getElementById('content')?.remove()
    expect(() => enhanceAulaPage(document)).not.toThrow()
  })
})

describe('aula enhance helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main id="content">
        <section id="s1" data-enhance="true"></section>
        <section id="s2"></section>
        <section id="s3" data-enhance="true" data-enhanced="1"></section>
      </main>`
  })

  it('shouldEnhance returns true only for eligible nodes', () => {
    const cases = [
      { node: document.querySelector('#s1'), expected: true },
      { node: document.querySelector('#s2'), expected: false },
      { node: document.querySelector('#s3'), expected: false },
      { node: null, expected: false },
      { node: { dataset: { enhance: 'true' } }, expected: false },
    ]

    cases.forEach(({ node, expected }) => {
      expect(shouldEnhance(node)).toBe(expected)
    })
  })

  it('markEnhanced safely annotates nodes', () => {
    const target = document.querySelector('#s1')
    const result = markEnhanced(target, 'section-id')

    expect(result).toBe(true)
    expect(target?.dataset.enhanced).toBe('true')
    expect(target?.getAttribute('data-enhanced-id')).toBe('section-id')
    expect(target?.classList.contains('aula-enhanced')).toBe(true)
  })
})

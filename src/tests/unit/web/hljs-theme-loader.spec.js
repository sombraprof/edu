import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyHighlightTheme,
  computeHljsHref,
} from '../../../js/web/hljs-theme-loader.js'

describe('highlight theme loader', () => {
  const selector = 'link[data-hljs="true"]'
  let appendSpy
  let querySpy

  beforeEach(() => {
    document.head.innerHTML = ''
    appendSpy = vi.spyOn(document.head, 'appendChild')
    querySpy = vi.spyOn(document, 'querySelector')
  })

  afterEach(() => {
    appendSpy.mockRestore()
    querySpy.mockRestore()
  })

  it('applies the dark theme via a single reusable link element', () => {
    applyHighlightTheme('dark')

    const link = document.querySelector(selector)
    expect(link).not.toBeNull()
    expect(link?.getAttribute('data-theme')).toBe('dark')
    expect(link?.getAttribute('href')).toBe(computeHljsHref('dark'))
    expect(appendSpy).toHaveBeenCalledTimes(1)
    expect(querySpy).toHaveBeenCalledWith(selector)
  })

  it('falls back to the default theme when an unknown key is provided', () => {
    applyHighlightTheme('retro-wave')

    const link = document.querySelector(selector)
    expect(link?.getAttribute('data-theme')).toBe('default')
    expect(link?.getAttribute('href')).toBe(computeHljsHref('retro-wave'))
  })

  it('reuses the same node when reapplying an unchanged theme', () => {
    applyHighlightTheme('dark')
    appendSpy.mockClear()
    querySpy.mockClear()

    applyHighlightTheme('dark')

    const links = document.querySelectorAll(selector)
    expect(links).toHaveLength(1)
    expect(appendSpy).not.toHaveBeenCalled()
    expect(querySpy).toHaveBeenCalledWith(selector)
  })

  it('fails gracefully when document.head is not available', () => {
    const originalHead = Object.getOwnPropertyDescriptor(document, 'head')

    appendSpy.mockRestore()

    Object.defineProperty(document, 'head', {
      value: null,
      configurable: true,
    })

    expect(() => applyHighlightTheme('dark')).not.toThrow()

    const link = document.querySelector(selector)
    expect(link).toBeNull()

    if (originalHead) {
      Object.defineProperty(document, 'head', originalHead)
    }
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyRipple,
  setupSegmented,
  initMd3Elements,
} from '../../../js/web/md3-elements.js'

describe('MD3 element surface helpers', () => {
  let rippleButton
  let segmentedContainer

  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <button id="b1" data-md3-ripple></button>
        <div id="seg" data-md3-segmented="a,b,c"></div>
      </main>
    `
    rippleButton = document.getElementById('b1')
    segmentedContainer = document.getElementById('seg')
  })

  it('applyRipple adds MD3 classes and pointer listeners safely', () => {
    const addListenerSpy = vi.spyOn(rippleButton, 'addEventListener')
    const classAddSpy = vi.spyOn(rippleButton.classList, 'add')

    applyRipple(rippleButton)

    expect(rippleButton.classList.contains('md3-ripple')).toBe(true)
    expect(addListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), { passive: true })
    expect(classAddSpy).toHaveBeenCalledWith('md3-ripple')

    addListenerSpy.mockClear()
    applyRipple(rippleButton)
    expect(addListenerSpy).not.toHaveBeenCalled()
  })

  it('setupSegmented creates interactive segments and dispatches change events', () => {
    const dispatchSpy = vi.spyOn(segmentedContainer, 'dispatchEvent')

    const values = setupSegmented(segmentedContainer)
    expect(values).toEqual(['a', 'b', 'c'])

    const buttons = segmentedContainer.querySelectorAll('button.md3-segment')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].classList.contains('is-active')).toBe(true)

    buttons[1].click()
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'md3:segment-change',
        detail: { value: 'b' },
      }),
    )
    expect(buttons[1].classList.contains('is-active')).toBe(true)
    expect(buttons[0].classList.contains('is-active')).toBe(false)
  })

  it('initMd3Elements wires all supported enhancements once and tolerates missing roots', () => {
    const rippleSpy = vi.spyOn(rippleButton, 'addEventListener')
    const dispatchSpy = vi.spyOn(segmentedContainer, 'dispatchEvent')

    initMd3Elements(document)

    expect(rippleButton.classList.contains('md3-ripple')).toBe(true)
    const segments = segmentedContainer.querySelectorAll('button.md3-segment')
    expect(segments).toHaveLength(3)
    expect(rippleSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), { passive: true })

    segments[2].click()
    expect(dispatchSpy).toHaveBeenCalled()

    expect(() => initMd3Elements(null)).not.toThrow()
  })

  it('gracefully ignores unsupported targets', () => {
    expect(() => applyRipple(null)).not.toThrow()
    expect(() => setupSegmented(null)).not.toThrow()
  })
})

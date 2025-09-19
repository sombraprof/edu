import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useShortcuts } from '../../../js/core/shortcuts.js'

describe('useShortcuts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers and cleans up the keydown handler', () => {
    // Spy on the DOM listener APIs to validate side-effects
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const Harness = defineComponent({
      setup() {
        useShortcuts()
        return () => null
      },
    })

    const wrapper = mount(Harness)

    // Assert: the composable wires a keydown listener on mount
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    const keydownHandler = addSpy.mock.calls.find(([event]) => event === 'keydown')?.[1]
    // Assert: we captured a concrete handler reference to use during teardown checks
    expect(typeof keydownHandler).toBe('function')

    wrapper.unmount()

    // Assert: the same handler is removed when the component unmounts
    expect(removeSpy).toHaveBeenCalledWith('keydown', keydownHandler)
  })

  it('toggles the theme when the "t" shortcut is pressed', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')

    const Harness = defineComponent({
      setup() {
        useShortcuts()
        return () => null
      },
    })

    const wrapper = mount(Harness)

    const handler = addSpy.mock.calls.find(([event]) => event === 'keydown')?.[1]
    expect(typeof handler).toBe('function')

    const themeToggle = document.createElement('button')
    themeToggle.id = 'theme-toggle'
    const clickSpy = vi.spyOn(themeToggle, 'click')
    document.body.appendChild(themeToggle)

    const preventDefault = vi.fn()
    handler?.({ key: 't', target: document.body, preventDefault })

    expect(preventDefault).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

    document.body.removeChild(themeToggle)
    wrapper.unmount()
  })
})

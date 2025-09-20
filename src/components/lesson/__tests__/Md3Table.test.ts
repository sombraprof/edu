import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Md3Table from '../Md3Table.vue'

describe('Md3Table', () => {
  it('renders table with headers and rows', () => {
    const headers = ['Name', 'Age', 'City']
    const rows = [
      [{ value: 'John' }, { value: '25' }, { value: 'NYC' }],
      [{ value: 'Jane' }, { value: '30' }, { value: 'LA' }]
    ]

    const wrapper = mount(Md3Table, {
      props: { headers, rows }
    })

    expect(wrapper.findAll('th')).toHaveLength(3)
    expect(wrapper.findAll('tr')).toHaveLength(3) // header + 2 rows
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Jane')
  })

  it('renders mono text for cells with mono flag', () => {
    const headers = ['Code']
    const rows = [
      [{ value: 'int main()', mono: true }]
    ]

    const wrapper = mount(Md3Table, {
      props: { headers, rows }
    })

    const monoSpan = wrapper.find('.font-mono')
    expect(monoSpan.exists()).toBe(true)
    expect(monoSpan.text()).toBe('int main()')
  })

  it('renders code text for cells with code flag', () => {
    const headers = ['Example']
    const rows = [
      [{ value: 'printf()', code: true }]
    ]

    const wrapper = mount(Md3Table, {
      props: { headers, rows }
    })

    const codeSpan = wrapper.find('.inline-code')
    expect(codeSpan.exists()).toBe(true)
    expect(codeSpan.text()).toBe('printf()')
  })

  it('applies MD3 styling classes', () => {
    const headers = ['Test']
    const rows = [
      [{ value: 'Value' }]
    ]

    const wrapper = mount(Md3Table, {
      props: { headers, rows }
    })

    expect(wrapper.classes()).toContain('card')
    expect(wrapper.find('thead').classes()).toContain('bg-surface-variant')
    expect(wrapper.find('tbody tr').classes()).toContain('border-b')
  })
})
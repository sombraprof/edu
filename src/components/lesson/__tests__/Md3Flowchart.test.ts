import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Md3Flowchart from '../Md3Flowchart.vue'

describe('Md3Flowchart', () => {
  it('renders flowchart with terminal elements', () => {
    const elements = [
      {
        type: 'terminal' as const,
        class: 'flowchart-shape flowchart-terminal',
        text: 'Início'
      },
      {
        type: 'arrow' as const,
        class: 'flowchart-arrow',
        text: ''
      },
      {
        type: 'io' as const,
        class: 'flowchart-shape flowchart-io',
        text: 'Leia valor'
      }
    ]

    const wrapper = mount(Md3Flowchart, {
      props: { elements }
    })

    expect(wrapper.findAll('.flowchart-shape')).toHaveLength(2)
    expect(wrapper.find('.flowchart-terminal').text()).toBe('Início')
    expect(wrapper.find('.flowchart-io').text()).toBe('Leia valor')
  })

  it('renders decision elements with bifurcation', () => {
    const elements = [
      {
        type: 'decision' as const,
        class: 'flowchart-shape flowchart-decision',
        text: 'x > 0?'
      },
      {
        type: 'bifurcation' as const,
        class: 'flowchart-bifurcation',
        text: '',
        branches: [
          {
            label: 'Sim',
            class: 'flowchart-shape flowchart-io',
            type: 'io',
            text: 'Positivo'
          },
          {
            label: 'Não',
            class: 'flowchart-shape flowchart-io',
            type: 'io',
            text: 'Negativo'
          }
        ]
      }
    ]

    const wrapper = mount(Md3Flowchart, {
      props: { elements }
    })

    expect(wrapper.find('.flowchart-decision').text()).toBe('x > 0?')
    expect(wrapper.findAll('.flowchart-branch')).toHaveLength(2)
    expect(wrapper.findAll('.flowchart-branch-label')).toHaveLength(2)
  })

  it('renders process elements', () => {
    const elements = [
      {
        type: 'process' as const,
        class: 'flowchart-shape flowchart-process',
        text: 'soma = a + b'
      }
    ]

    const wrapper = mount(Md3Flowchart, {
      props: { elements }
    })

    expect(wrapper.find('.flowchart-process').text()).toBe('soma = a + b')
  })

  it('applies MD3 styling classes', () => {
    const elements = [
      {
        type: 'terminal' as const,
        class: 'flowchart-shape flowchart-terminal',
        text: 'Fim'
      }
    ]

    const wrapper = mount(Md3Flowchart, {
      props: { elements }
    })

    expect(wrapper.classes()).toContain('card')
    expect(wrapper.find('.flowchart-shape').classes()).toContain('flowchart-terminal')
  })
})
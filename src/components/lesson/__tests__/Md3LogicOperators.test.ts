import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Md3LogicOperators from '../Md3LogicOperators.vue'

describe('Md3LogicOperators', () => {
  it('renders all three logical operators', () => {
    const wrapper = mount(Md3LogicOperators)

    expect(wrapper.find('h3').text()).toBe('Os Blocos de Construção da Decisão: Operadores Lógicos')
    expect(wrapper.text()).toContain('Operador E (AND)')
    expect(wrapper.text()).toContain('Operador OU (OR)')
    expect(wrapper.text()).toContain('Operador NÃO (NOT)')
  })

  it('renders truth tables for each operator', () => {
    const wrapper = mount(Md3LogicOperators)

    // Should have 3 TruthTable components
    const truthTables = wrapper.findAllComponents({ name: 'TruthTable' })
    expect(truthTables).toHaveLength(3)
  })

  it('renders operator descriptions and examples', () => {
    const wrapper = mount(Md3LogicOperators)

    expect(wrapper.text()).toContain('é exigente')
    expect(wrapper.text()).toContain('é flexível')
    expect(wrapper.text()).toContain('inverte')
    expect(wrapper.text()).toContain('previsão do tempo seja boa E eu tenha dinheiro')
    expect(wrapper.text()).toContain('posso comer no restaurante OU levar comida de casa')
    expect(wrapper.text()).toContain('Eu vou sair se NÃO estiver a chover')
  })

  it('applies MD3 styling classes', () => {
    const wrapper = mount(Md3LogicOperators)

    const headings = wrapper.findAll('h4')
    expect(headings.length).toBeGreaterThan(0)

    headings.forEach(heading => {
      expect(heading.classes()).toContain('text-headline-small')
      expect(heading.classes()).toContain('font-bold')
      expect(heading.classes()).toContain('text-on-surface')
    })

    const cards = wrapper.findAll('.card')
    expect(cards.length).toBeGreaterThan(0)

    cards.forEach(card => {
      expect(card.classes()).toContain('card')
    })
  })

  it('renders inline code elements correctly', () => {
    const wrapper = mount(Md3LogicOperators)

    const inlineCodes = wrapper.findAll('.inline-code')
    expect(inlineCodes.length).toBeGreaterThan(0)

    inlineCodes.forEach(code => {
      expect(code.classes()).toContain('inline-code')
    })

    expect(wrapper.text()).toContain('AND')
    expect(wrapper.text()).toContain('OR')
    expect(wrapper.text()).toContain('NOT')
  })
})
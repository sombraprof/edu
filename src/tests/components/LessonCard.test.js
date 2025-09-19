import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import LessonCard from '../../components/LessonCard.vue'

const baseLesson = {
  id: 'lesson-1',
  title: 'Lesson Title',
  description: 'Short lesson summary.',
  status: 'available',
  unit: 'Unit 1',
  ativo: true,
}

const mountLessonCard = (override = {}) =>
  mount(LessonCard, {
    props: {
      lesson: { ...baseLesson, ...override },
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })

describe('LessonCard', () => {
  it('renders lesson information for available items', () => {
    const wrapper = mountLessonCard()

    expect(wrapper.find('h3').text()).toBe(baseLesson.title)
    expect(wrapper.find('p').text()).toBe(baseLesson.description)
    expect(wrapper.classes()).toContain('card--interactive')
    expect(wrapper.attributes('aria-disabled')).toBe('false')
    expect(wrapper.attributes('tabindex')).toBe('0')

    const linkStub = wrapper.getComponent(RouterLinkStub)
    expect(linkStub.props('to')).toBe(`/lesson/${baseLesson.id}`)

    const badge = wrapper.find('.badge')
    expect(badge.text()).toContain('Disponível')
    expect(badge.find('i').classes()).toContain('fa-solid')
  })

  it('applies disabled state for unavailable lessons', () => {
    const wrapper = mountLessonCard({ status: 'soon', ativo: false })

    expect(wrapper.classes()).toContain('card--disabled')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('tabindex')).toBe('-1')

    const badge = wrapper.find('.badge')
    expect(badge.text()).toContain('Em breve')
    expect(badge.find('i').classes()).toContain('fa-regular')
  })
})

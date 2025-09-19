import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LessonCard from '../../../components/LessonCard.vue'

describe('LessonCard (minimal mount)', () => {
  it('renders the title and exposes the router target', async () => {
    // Arrange: minimal lesson payload required by the template slots
    const lesson = {
      id: 'lesson-01',
      title: 'Lesson One',
      description: 'Summary',
      status: 'available',
      ativo: true,
    }

    const wrapper = mount(LessonCard, {
      props: { lesson },
      global: {
        // Stub router-link so we can introspect the "to" prop without a router instance
        stubs: {
          RouterLink: {
            name: 'RouterLink',
            template: '<a><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    // Act: simulate a user clicking the card root
    await wrapper.trigger('click')

    // Assert: heading text matches the provided lesson and navigation target is exposed via the stub
    expect(wrapper.find('h3').text()).toBe(lesson.title)
    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toBe(`/lesson/${lesson.id}`)
  })
})

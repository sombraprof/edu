import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import LessonOverview from '../LessonOverview.vue';

describe('LessonOverview', () => {
  it('renders summary and metadata when provided', () => {
    const wrapper = mount(LessonOverview, {
      props: {
        summary: 'Panorama da aula e próximos passos.',
        duration: 95,
        modality: 'in-person',
        tags: ['android', 'fundamentos'],
      },
    });

    expect(wrapper.find('.lesson-overview__summary').text()).toBe(
      'Panorama da aula e próximos passos.'
    );
    expect(wrapper.find('[data-testid="lesson-overview-duration"]').text()).toBe('1 h 35 min');
    expect(wrapper.find('[data-testid="lesson-overview-modality"]').text()).toBe('Presencial');
    expect(wrapper.findAll('[data-testid="lesson-overview-tag"]').length).toBe(2);

    const sanitized = wrapper.html().replace(/ data-v-[^=]+=""/g, '');
    expect(sanitized).toMatchInlineSnapshot(`
      "<section class=\"lesson-overview md-stack md-stack-3\" aria-label=\"Resumo da aula\">\n  <p class=\"lesson-overview__summary text-body-large\">Panorama da aula e próximos passos.</p>\n  <div class=\"lesson-overview__meta\" role=\"list\"><span class=\"lesson-overview__chip\" data-testid=\"lesson-overview-duration\" role=\"listitem\">1 h 35 min</span><span class=\"lesson-overview__chip\" data-testid=\"lesson-overview-modality\" role=\"listitem\">Presencial</span><span class=\"lesson-overview__chip lesson-overview__chip--tag\" data-testid=\"lesson-overview-tag\" role=\"listitem\">android</span><span class=\"lesson-overview__chip lesson-overview__chip--tag\" data-testid=\"lesson-overview-tag\" role=\"listitem\">fundamentos</span></div>\n</section>"
    `);
  });

  it('gracefully skips rendering when no metadata is available', () => {
    const wrapper = mount(LessonOverview);

    expect(wrapper.find('section').exists()).toBe(false);
  });
});

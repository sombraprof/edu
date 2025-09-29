import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import LessonReadiness from '../LessonReadiness.vue';

describe('LessonReadiness', () => {
  it('renders all readiness lists when data is provided', () => {
    const wrapper = mount(LessonReadiness, {
      props: {
        skills: ['Comunicar requisitos', 'Mapear fluxos de usuários'],
        outcomes: ['Entregar protótipo navegável'],
        prerequisites: ['Familiaridade com Figma'],
      },
    });

    const sections = wrapper.findAll('.lesson-readiness__section');
    expect(sections).toHaveLength(3);
    expect(wrapper.text()).toContain('Habilidades');
    expect(wrapper.text()).toContain('Resultados esperados');
    expect(wrapper.text()).toContain('Pré-requisitos');
    expect(wrapper.findAll('.lesson-readiness__item').length).toBeGreaterThanOrEqual(3);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LessonRenderer from '../LessonRenderer.vue';
import ddmLesson01 from '@/content/courses/ddm/lessons/lesson-01.json';
import { computed, ref } from 'vue';

vi.mock('@/pages/course/LessonRenderer.logic', async () => {
  const actual = await vi.importActual<typeof import('@/pages/course/LessonRenderer.logic')>(
    '@/pages/course/LessonRenderer.logic'
  );

  return {
    ...actual,
    useLessonRenderer: vi.fn(actual.useLessonRenderer),
  };
});

import { useLessonRenderer } from '@/pages/course/LessonRenderer.logic';

const useLessonRendererMock = vi.mocked(useLessonRenderer);
const actualLogicModulePromise = vi.importActual<
  typeof import('@/pages/course/LessonRenderer.logic')
>('@/pages/course/LessonRenderer.logic');

beforeEach(async () => {
  const actual = await actualLogicModulePromise;
  useLessonRendererMock.mockReset();
  useLessonRendererMock.mockImplementation(actual.useLessonRenderer);
});

describe('LessonRenderer', () => {
  it('renders metadata summary with resources and assessment', () => {
    const wrapper = mount(LessonRenderer, {
      props: {
        data: {
          id: 'demo',
          title: 'Demo Lesson',
          objectives: ['Conhecer a estrutura do curso', 'Explorar o ecossistema Android'],
          competencies: ['Planejamento de jornadas'],
          resources: [
            {
              label: 'Android Developers',
              url: 'https://developer.android.com',
              type: 'artigo',
            },
            {
              label: 'Recurso interno',
            },
          ],
          assessment: {
            type: 'diagnóstico',
            description: 'Checklist inicial com participação e expectativas.',
          },
          bibliography: ['Autor. Título. 2024.'],
          content: [],
        },
      },
    });

    expect(wrapper.text()).toContain('Resumo da aula');
    expect(wrapper.text()).toContain('Objetivos');
    expect(wrapper.text()).toContain('Competências');
    expect(wrapper.findAll('.lesson-metadata-summary__list-item').length).toBeGreaterThan(1);
    expect(wrapper.findAll('.lesson-metadata-summary__resource').length).toBe(2);
    expect(wrapper.find('.lesson-bibliography').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('Nenhum conteúdo disponível para esta aula.');
  });

  it('smoke-tests ddm lesson 01 metadata', () => {
    const lesson = ddmLesson01 as any;
    const wrapper = mount(LessonRenderer, {
      props: {
        data: {
          id: lesson.id,
          title: lesson.title,
          objective: lesson.objective,
          objectives: lesson.objectives,
          competencies: lesson.competencies,
          resources: lesson.resources,
          assessment: lesson.assessment,
          bibliography: lesson.bibliography,
          content: [],
        },
      },
    });

    expect(wrapper.text()).toContain('Objetivos');
    expect(wrapper.text()).toContain('Bibliografia');
    expect(wrapper.findAll('.lesson-bibliography__item').length).toBeGreaterThan(0);
    expect(wrapper.text()).not.toContain('Nenhum conteúdo disponível para esta aula.');
  });

  it('omits fallback bibliography when explicit block is provided', () => {
    const wrapper = mount(LessonRenderer, {
      props: {
        data: {
          id: 'with-block',
          title: 'With block',
          content: [
            {
              type: 'bibliography',
              title: 'Leituras obrigatórias',
              items: ['Item existente'],
            },
          ],
          bibliography: ['Item duplicado'],
        },
      },
    });

    const bibliographySections = wrapper.findAll('.lesson-bibliography');
    expect(bibliographySections.length).toBe(1);
    expect(wrapper.text()).toContain('Leituras obrigatórias');
    expect(wrapper.text()).not.toContain('Bibliografia');
  });

  it('shows empty state when controller reports no renderable content', () => {
    useLessonRendererMock.mockReturnValue({
      metadataSummary: ref(null),
      resolvedBlocks: ref([]),
      bibliographyFallback: ref(null),
      hasRenderableContent: computed(() => false),
    });

    const wrapper = mount(LessonRenderer, {
      props: {
        data: {
          id: 'empty',
          title: 'Empty',
          content: [],
        },
      },
    });

    expect(useLessonRendererMock).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Nenhum conteúdo disponível para esta aula.');
  });
});

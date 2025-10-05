import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CourseLayout from '../CourseLayout.vue';
import type { CourseLayoutController } from '../CourseLayout.logic';

type Controller = CourseLayoutController;

const controllerMock: Controller = {
  meta: {
    value: { id: 'demo', title: 'Curso Demo', institution: 'Unichristus' },
  } as any,
  lessons: {
    value: [
      { id: 'lesson-01', title: 'Aula 1', available: true },
      { id: 'lesson-02', title: 'Aula 2', available: false },
    ],
  } as any,
  exercises: {
    value: [
      { id: 'exercise-01', title: 'Atividade', available: true, file: 'atividade.pdf' },
      { id: 'exercise-02', title: 'Quiz remoto', link: 'https://example.com/quiz' },
      { id: 'exercise-03', title: 'Rascunho', available: false, file: 'rascunho.pdf' },
    ],
  } as any,
  metaLoaded: { value: true } as any,
  lessonsCount: { value: 1 } as any,
  exercisesCount: { value: 2 } as any,
  refreshCourse: vi.fn(),
  courseId: { value: 'demo' } as any,
  route: { params: {}, query: {}, fullPath: '/demo' } as any,
};

vi.mock('../CourseLayout.logic', () => ({
  useCourseLayoutController: () => controllerMock,
}));

const RouterLinkStub = {
  props: ['to'],
  template: '<a><slot /></a>',
};

const ButtonStub = {
  template: '<button><slot /></button>',
};

describe('CourseLayout component', () => {
  it('renderiza meta e contadores quando metaLoaded é verdadeiro', () => {
    const wrapper = mount(CourseLayout, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          Md3Button: ButtonStub,
          RouterView: { template: '<div />' },
        },
        mocks: { $route: { fullPath: '/demo' } },
      },
    });

    expect(wrapper.attributes('aria-busy')).toBe('false');
    expect(wrapper.text()).toContain('Curso Demo');
    const stats = wrapper.findAll('.course-page__stats dd');
    expect(stats[1].text()).toBe('1');
    expect(stats[2].text()).toBe('2');
  });

  it('exibe skeleton quando meta ainda não carregou', () => {
    controllerMock.metaLoaded.value = false;
    const wrapper = mount(CourseLayout, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          Md3Button: ButtonStub,
          RouterView: { template: '<div />' },
        },
        mocks: { $route: { fullPath: '/demo' } },
      },
    });

    expect(wrapper.text()).toContain('Carregando informações da disciplina');
    controllerMock.metaLoaded.value = true;
  });
});

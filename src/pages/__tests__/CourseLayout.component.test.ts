import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CourseLayout from '../CourseLayout.vue';
import type { CourseLayoutController } from '../CourseLayout.logic';

type Controller = CourseLayoutController;

const controllerMock: Controller = {
  meta: { value: { id: 'demo', title: 'Curso Demo', institution: 'Unichristus' } } as any,
  lessons: { value: [] } as any,
  exercises: { value: [] } as any,
  metaLoaded: { value: true } as any,
  lessonsCount: { value: 2 } as any,
  exercisesCount: { value: 1 } as any,
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
    expect(wrapper.text()).toContain('2');
    expect(wrapper.text()).toContain('1');
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

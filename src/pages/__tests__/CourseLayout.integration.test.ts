import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { computed, ref } from 'vue';
import CourseLayout from '../CourseLayout.vue';
import type { CourseLayoutController } from '../CourseLayout.logic';

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/course/:courseId', name: 'course-home', component: CourseLayout },
];

let controller: CourseLayoutController;
let router: ReturnType<typeof createRouter>;

vi.mock('../CourseLayout.logic', () => ({
  useCourseLayoutController: () => controller,
}));

const ButtonStub = { template: '<button><slot /></button>' };

function createController(): CourseLayoutController {
  const metaLoaded = ref(true);
  const meta = ref({
    id: 'demo',
    title: 'Curso Demo',
    institution: 'Unichristus',
    description: 'Descrição',
  });
  const lessons = ref([{ id: 'lesson-01', title: 'Aula 1' }]);
  const exercises = ref([{ id: 'exercise-01', title: 'Atividade' }]);

  return {
    meta,
    lessons,
    exercises,
    metaLoaded,
    lessonsCount: computed(() => lessons.value.length),
    exercisesCount: computed(() => exercises.value.length),
    refreshCourse: vi.fn(),
    courseId: computed(() => 'demo'),
    route: router.currentRoute.value,
  };
}

describe('CourseLayout integration', () => {
  beforeEach(async () => {
    router = createRouter({ history: createMemoryHistory(), routes });
    controller = createController();
    await router.push('/course/demo');
    await router.isReady();
  });

  it('renderiza meta quando carregado', () => {
    const wrapper = mount(CourseLayout, {
      global: {
        plugins: [router],
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          ArrowLeft: { template: '<span />' },
          ChevronRight: { template: '<span />' },
          RouterView: { template: '<div />' },
        },
        mocks: { $route: { fullPath: '/course/demo' } },
      },
    });

    expect(wrapper.attributes('aria-busy')).toBe('false');
    expect(wrapper.text()).toContain('Curso Demo');
    expect(wrapper.text()).toContain('1');
  });

  it('exibe loading quando meta não carregou', () => {
    controller.metaLoaded.value = false;
    const wrapper = mount(CourseLayout, {
      global: {
        plugins: [router],
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          ArrowLeft: { template: '<span />' },
          ChevronRight: { template: '<span />' },
          RouterView: { template: '<div />' },
        },
        mocks: { $route: { fullPath: '/course/demo' } },
      },
    });

    expect(wrapper.text()).toContain('Carregando informações da disciplina');
    controller.metaLoaded.value = true;
  });
});

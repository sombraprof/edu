import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, shallowRef, ref } from 'vue';
import ExerciseView from '../ExerciseView.vue';
import type { ExerciseViewController } from '../ExerciseView.logic';

type Controller = ExerciseViewController;

const createController = () => {
  const exerciseTitle = ref('Título');
  const exerciseSummary = ref('Resumo');
  const exerciseComponent = shallowRef<any | null>({ render: () => null });

  return {
    courseId: computed(() => 'demo'),
    exerciseId: computed(() => 'exercise-01'),
    exerciseTitle,
    exerciseSummary,
    exerciseComponent,
    loadExercise: vi.fn(),
    route: { params: { courseId: 'demo', exerciseId: 'exercise-01' }, query: {} } as any,
  } satisfies Controller;
};

let controllerMock: Controller;

vi.mock('../ExerciseView.logic', () => ({
  useExerciseViewController: () => controllerMock,
}));

const ButtonStub = {
  template: '<button><slot /></button>',
};

describe('ExerciseView component', () => {
  beforeEach(() => {
    controllerMock = createController();
  });

  it('renderiza componente de exercício quando disponível', () => {
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.text()).toContain('Título');
  });

  it('mostra fallback quando exercício não possui componente', () => {
    controllerMock.exerciseComponent.value = null;
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.text()).toContain('Conteúdo deste exercício ainda não está disponível');
  });
});

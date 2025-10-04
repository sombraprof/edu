import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { useExerciseViewController } from '../ExerciseView.logic';

const mockRoute = {
  params: { courseId: 'demo', exerciseId: 'exercise-01' },
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}));

const indexModules = Object.create(null) as Record<string, () => Promise<unknown>>;
indexModules['../content/courses/demo/exercises.json'] = async () => ({
  default: {
    entries: [
      {
        id: 'exercise-01',
        title: 'Exercício interno',
        file: 'exercise-01.vue',
        summary: 'Resumo do exercício',
      },
      {
        id: 'exercise-02',
        title: 'Exercício externo',
        link: 'https://example.com',
      },
    ],
  },
});

const componentModules = Object.create(null) as Record<string, () => Promise<unknown>>;
componentModules['../content/courses/demo/exercises/exercise-01.vue'] = async () => ({
  default: { render: () => null },
  meta: { title: 'Exercício atualizado', summary: 'Resumo atualizado' },
});

describe('ExerciseView logic', () => {
  it('carrega componente para exercício interno', async () => {
    const controller = useExerciseViewController({
      exerciseIndexModules: indexModules,
      exerciseModules: componentModules,
    });

    await controller.loadExercise();
    await nextTick();

    expect(controller.exerciseTitle.value).toBe('Exercício interno');
    expect(controller.exerciseSummary.value).toBe('Resumo do exercício');
    expect(controller.exerciseComponent.value).toBeTruthy();
  });

  it('redireciona quando há link externo', async () => {
    const redirect = vi.fn();
    mockRoute.params.exerciseId = 'exercise-02';
    const controller = useExerciseViewController({
      exerciseIndexModules: indexModules,
      exerciseModules: {},
      redirect,
    });

    await controller.loadExercise();

    expect(redirect).toHaveBeenCalledWith('https://example.com');
  });
});

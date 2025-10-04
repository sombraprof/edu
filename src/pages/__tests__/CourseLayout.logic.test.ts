import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { useCourseLayoutController } from '../CourseLayout.logic';

const mockRoute = {
  params: { courseId: 'demo' },
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}));

const metaEntry = vi.hoisted(() => ({
  id: 'demo',
  title: 'Curso Demo',
  institution: 'Unichristus',
  description: 'Descrição do curso',
}));

const lessonsManifest = vi.hoisted(() => ({
  entries: [
    { id: 'lesson-01', title: 'Introdução' },
    { id: 'lesson-02', title: 'Capítulo 2' },
  ],
}));

const exercisesManifest = vi.hoisted(() => ({
  entries: [{ id: 'exercise-01', title: 'Projeto inicial' }],
}));

function createController() {
  const metaModules = Object.create(null) as Record<string, () => Promise<unknown>>;
  metaModules['../content/courses/demo/meta.json'] = async () => ({ default: metaEntry });

  const lessonModules = Object.create(null) as Record<string, () => Promise<unknown>>;
  lessonModules['../content/courses/demo/lessons.json'] = async () => ({
    default: lessonsManifest,
  });

  const exerciseModules = Object.create(null) as Record<string, () => Promise<unknown>>;
  exerciseModules['../content/courses/demo/exercises.json'] = async () => ({
    default: exercisesManifest,
  });

  return useCourseLayoutController({ metaModules, lessonModules, exerciseModules });
}

describe('CourseLayout logic', () => {
  it('carrega meta, lições e exercícios e atualiza contadores', async () => {
    const controller = createController();

    await controller.refreshCourse('demo');
    await nextTick();

    expect(controller.metaLoaded.value).toBe(true);
    expect(controller.meta.value?.title).toBe('Curso Demo');
    expect(controller.lessonsCount.value).toBe(2);
    expect(controller.exercisesCount.value).toBe(1);
  });

  it('reseta estado ao receber id vazio', async () => {
    const controller = createController();
    await controller.refreshCourse('demo');
    await nextTick();

    await controller.refreshCourse('');
    expect(controller.meta.value).toBeNull();
    expect(controller.lessons.value).toHaveLength(0);
    expect(controller.exercises.value).toHaveLength(0);
    expect(controller.metaLoaded.value).toBe(false);
  });
});

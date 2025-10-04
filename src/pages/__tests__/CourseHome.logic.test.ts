import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { useCourseHomeController } from '../CourseHome.logic';

const mockRouterPush = vi.fn(() => Promise.resolve());
const mockRoute = {
  params: { courseId: 'demo' },
  query: {},
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockRouterPush }),
}));

const lessonsEntries = vi.hoisted(() => [
  {
    id: 'lesson-01',
    title: 'Introdução',
    description: 'Aula introdutória',
    file: 'lesson-01.json',
    available: true,
  },
]);

const exercisesEntries = vi.hoisted(() => [
  {
    id: 'exercise-01',
    title: 'Exercício interno',
    description: 'Material no portal',
    file: 'exercise-01.json',
    available: true,
  },
  {
    id: 'exercise-02',
    title: 'Exercício externo',
    description: 'Material externo',
    link: 'https://example.com/material',
    available: true,
  },
]);

vi.mock('@/content/loaders', () => ({
  normalizeManifest: (_mod: unknown, opts?: { context?: string }) => {
    if (opts?.context?.includes('lessons')) {
      return { entries: lessonsEntries.map((entry) => ({ ...entry })) };
    }
    if (opts?.context?.includes('exercises')) {
      return { entries: exercisesEntries.map((entry) => ({ ...entry })) };
    }
    return { entries: [] };
  },
}));

function createController() {
  mockRoute.params.courseId = 'demo';
  mockRoute.query = {};
  const lessonModules = Object.create(null) as Record<string, () => Promise<unknown>>;
  lessonModules['../content/courses/demo/lessons.json'] = async () => ({
    default: { entries: lessonsEntries.map((entry) => ({ ...entry })) },
  });
  const exerciseModules = Object.create(null) as Record<string, () => Promise<unknown>>;
  exerciseModules['../content/courses/demo/exercises.json'] = async () => ({
    default: { entries: exercisesEntries.map((entry) => ({ ...entry })) },
  });
  const controller = useCourseHomeController({ lessonModules, exerciseModules });
  return controller;
}

describe('CourseHome logic', () => {
  it('carrega lições e exercícios e monta itens combinados', async () => {
    const controller = createController();
    expect(controller.isLoading.value).toBe(true);

    await controller.refreshCourseContent('demo');
    await nextTick();
    expect(controller.isLoading.value).toBe(false);
    expect(controller.combinedItems.value).toHaveLength(3);

    const lessonItem = controller.combinedItems.value.find((item) => item.type === 'lesson');
    expect(lessonItem?.cta).toBe('Abrir aula');

    const externalExercise = controller.combinedItems.value.find((item) =>
      item.key.includes('exercise-02')
    );
    expect(externalExercise?.attrs).toMatchObject({
      href: 'https://example.com/material',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('filtra itens por tipo e termo de busca', async () => {
    const controller = createController();
    await controller.refreshCourseContent('demo');
    await nextTick();

    controller.contentFilter.value = 'exercise';
    expect(controller.displayItems.value.every((item) => item.type === 'exercise')).toBe(true);

    controller.contentFilter.value = 'all';
    mockRoute.query = { q: 'externo' };
    await nextTick();
    expect(
      controller.displayItems.value.filter((item) => item.title.includes('Exercício externo'))
    ).toHaveLength(1);
  });

  it('restaura filtros e executa push ao resetar', async () => {
    const controller = createController();
    await nextTick();

    controller.contentFilter.value = 'lesson';
    controller.viewMode.value = 'list';
    controller.resetFilters();

    expect(controller.contentFilter.value).toBe('all');
    expect(controller.viewMode.value).toBe('grid');
    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'course-home',
      params: { courseId: 'demo' },
    });
  });

  it('atualiza seção na rota mantendo query de busca', async () => {
    const controller = createController();
    await nextTick();

    mockRoute.query = { q: 'teste' };
    controller.updateSection('lesson');
    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'course-home',
      params: { courseId: 'demo' },
      query: { section: 'lessons', q: 'teste' },
    });
  });
});

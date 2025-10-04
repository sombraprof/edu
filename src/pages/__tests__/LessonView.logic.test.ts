import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { useLessonViewController } from '../LessonView.logic';
import type { LessonBlock } from '@/components/lesson/blockRegistry';

const fallbackHighlightSpy = vi.fn();

vi.mock('prismjs', () => ({
  default: { highlightAll: fallbackHighlightSpy },
}));

vi.mock('prismjs/components/prism-markup', () => ({}));
vi.mock('prismjs/components/prism-javascript', () => ({}));
vi.mock('prismjs/components/prism-typescript', () => ({}));
vi.mock('prismjs/components/prism-python', () => ({}));
vi.mock('prismjs/components/prism-json', () => ({}));
vi.mock('prismjs/components/prism-java', () => ({}));
vi.mock('prismjs/components/prism-c', () => ({}));
vi.mock('prismjs/components/prism-cpp', () => ({}));
vi.mock('prismjs/components/prism-csharp', () => ({}));
vi.mock('prismjs/components/prism-kotlin', () => ({}));

const mockRoute = {
  params: { courseId: 'demo', lessonId: 'lesson-01' },
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}));

type LessonContent = {
  title: string;
  content: LessonBlock[];
  objective?: string;
  summary?: string;
  duration?: number;
  modality?: string;
  tags?: string[];
  skills?: string[];
  outcomes?: string[];
  prerequisites?: string[];
};

function createController(
  customData?: Partial<LessonContent>,
  highlight: ((lesson: unknown) => Promise<void> | void) | undefined = vi
    .fn()
    .mockResolvedValue(undefined)
) {
  const indexModules = Object.create(null) as Record<string, () => Promise<unknown>>;
  indexModules['../content/courses/demo/lessons.json'] = async () => ({
    default: {
      entries: [
        {
          id: 'lesson-01',
          title: 'Introdução',
          file: 'lesson-01.json',
          description: 'Contexto',
          summary: 'Resumo breve',
        },
      ],
    },
  });

  const lessonModules = Object.create(null) as Record<string, () => Promise<unknown>>;
  lessonModules['../content/courses/demo/lessons/lesson-01.json'] = async () => ({
    default: {
      title: 'Introdução Aula',
      content: [{ type: 'html', html: '<p>Olá</p>' }],
      objective: 'Objetivo',
      summary: 'Resumo detalhado',
      duration: 45,
      modality: 'remote',
      tags: ['tag1'],
      skills: ['skill'],
      outcomes: ['outcome'],
      prerequisites: ['pre'],
      ...customData,
    } satisfies LessonContent,
  });

  return useLessonViewController({
    lessonIndexModules: indexModules,
    lessonContentModules: lessonModules,
    highlight,
  });
}

async function flushLessonUpdates() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('LessonView logic', () => {
  beforeEach(() => {
    fallbackHighlightSpy.mockClear();
  });

  beforeAll(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: any) => {
      cb(0);
      return 0;
    });
  });

  it('carrega lição e aplica highlight após próxima tick', async () => {
    const highlightSpy = vi.fn().mockResolvedValue(undefined);
    const controller = createController(undefined, highlightSpy);

    expect(highlightSpy).not.toHaveBeenCalled();

    await flushLessonUpdates();

    expect(controller.lessonTitle.value).toBe('Introdução Aula');
    expect(controller.lessonSummary.value).toBe('Resumo detalhado');
    expect(controller.lessonDuration.value).toBe(45);
    expect(controller.lessonData.value?.content).toHaveLength(1);
    expect(highlightSpy).toHaveBeenCalledTimes(1);
    expect(highlightSpy).toHaveBeenCalledWith(controller.lessonData.value);
    expect(fallbackHighlightSpy).not.toHaveBeenCalled();
  });

  it('define fallback quando manifest não é encontrado', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const controller = useLessonViewController({
      lessonIndexModules: {},
      lessonContentModules: {},
    });

    await controller.loadLesson();
    await nextTick();

    expect(controller.lessonTitle.value).toBe('Erro ao carregar aula');
    expect(controller.lessonData.value).toBeNull();

    consoleError.mockRestore();
  });

  it('registra erro e aplica fallback quando highlight falha', async () => {
    const highlightSpy = vi.fn().mockRejectedValue(new Error('boom'));
    const controller = createController(undefined, highlightSpy);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await flushLessonUpdates();

    expect(highlightSpy).toHaveBeenCalledTimes(1);
    await flushLessonUpdates();
    expect(controller.lessonTitle.value).toBe('Introdução Aula');
    expect(controller.lessonData.value?.content).toHaveLength(1);
    expect(consoleError).toHaveBeenCalledWith(
      '[LessonView] Failed to highlight lesson content:',
      expect.any(Error)
    );
    expect(fallbackHighlightSpy).toHaveBeenCalledTimes(1);

    consoleError.mockRestore();
  });
});

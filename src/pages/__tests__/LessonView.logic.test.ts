import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { useLessonViewController } from '../LessonView.logic';
import type { LessonBlock } from '@/components/lesson/blockRegistry';

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

const highlightSpy = vi.fn();

function createController(customData?: Partial<LessonContent>) {
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
    highlight: highlightSpy,
  });
}

describe('LessonView logic', () => {
  it('carrega lição e aplica highlight', async () => {
    const controller = createController();

    await controller.loadLesson();
    await nextTick();

    expect(controller.lessonTitle.value).toBe('Introdução Aula');
    expect(controller.lessonSummary.value).toBe('Resumo detalhado');
    expect(controller.lessonDuration.value).toBe(45);
    expect(controller.lessonData.value?.content).toHaveLength(1);
    expect(highlightSpy).toHaveBeenCalled();
  });

  it('define fallback quando manifest não é encontrado', async () => {
    const controller = useLessonViewController({
      lessonIndexModules: {},
      lessonContentModules: {},
      highlight: highlightSpy,
    });

    await controller.loadLesson();
    await nextTick();

    expect(controller.lessonTitle.value).toBe('Erro ao carregar aula');
    expect(controller.lessonData.value).toBeNull();
  });
});

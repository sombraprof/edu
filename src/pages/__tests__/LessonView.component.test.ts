import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, shallowRef, computed } from 'vue';
import LessonView from '../LessonView.vue';
import type { LessonViewController } from '../LessonView.logic';

type Controller = LessonViewController;

const createController = () => {
  const lessonTitle = ref('Introdução');
  const lessonObjective = ref('Objetivo');
  const lessonSummary = ref('Resumo');
  const lessonDuration = ref<number | undefined>(45);
  const lessonModality = ref('remote');
  const lessonTags = ref(['tag']);
  const lessonSkills = ref(['skill']);
  const lessonOutcomes = ref(['outcome']);
  const lessonPrerequisites = ref(['pre']);
  const lessonData = shallowRef({ content: [] } as any);

  return {
    courseId: computed(() => 'demo'),
    lessonId: computed(() => 'lesson-01'),
    lessonTitle,
    lessonObjective,
    lessonSummary,
    lessonDuration,
    lessonModality,
    lessonTags,
    lessonSkills,
    lessonOutcomes,
    lessonPrerequisites,
    lessonData,
    loadLesson: vi.fn(),
    route: { params: { courseId: 'demo', lessonId: 'lesson-01' }, query: {} } as any,
  } satisfies Controller;
};

let controllerMock: Controller;

vi.mock('../LessonView.logic', () => ({
  useLessonViewController: () => controllerMock,
}));

const contentSyncMock = {
  loading: ref(false),
  saving: ref(false),
  loadError: ref<string | null>(null),
  saveError: ref<string | null>(null),
  successMessage: ref<string | null>(null),
  hasPendingChanges: ref(false),
  revertChanges: vi.fn(),
  refresh: vi.fn(),
  serviceAvailable: true,
};

vi.mock('@/services/useTeacherContentEditor', () => ({
  useTeacherContentEditor: () => contentSyncMock,
}));

const ButtonStub = {
  props: ['to'],
  template: '<button><slot /></button>',
};

const StubComponent = {
  template: '<div><slot /></div>',
};

describe('LessonView component', () => {
  beforeEach(() => {
    controllerMock = createController();
    contentSyncMock.loadError.value = null;
    contentSyncMock.saveError.value = null;
    contentSyncMock.successMessage.value = null;
    contentSyncMock.hasPendingChanges.value = false;
    contentSyncMock.revertChanges.mockReset();
  });

  it('renderiza dados da lição quando disponíveis', () => {
    const wrapper = mount(LessonView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          LessonReadiness: StubComponent,
          LessonOverview: StubComponent,
          LessonRenderer: StubComponent,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.text()).toContain('Introdução');
    expect(wrapper.text()).toContain('Objetivo');
  });

  it('mostra fallback quando lição não foi carregada', () => {
    controllerMock.lessonData.value = null;
    const wrapper = mount(LessonView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          LessonReadiness: StubComponent,
          LessonOverview: StubComponent,
          LessonRenderer: StubComponent,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.text()).toContain('Não foi possível carregar esta aula');
  });
});

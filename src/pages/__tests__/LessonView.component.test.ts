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

const teacherModeMock = ref(true);

vi.mock('@/composables/useTeacherMode', () => ({
  useTeacherMode: () => ({
    teacherMode: teacherModeMock,
  }),
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

const highlightMock = vi.fn();

vi.mock('@/utils/prismHighlight', () => ({
  createPrismHighlightHandler: () => highlightMock,
}));

const ButtonStub = {
  props: ['to'],
  template: '<button><slot /></button>',
};

const StubComponent = {
  template: '<div><slot /></div>',
};

const LessonAuthoringPanelStub = {
  name: 'LessonAuthoringPanel',
  props: [
    'lessonModel',
    'tagsField',
    'createArrayField',
    'saving',
    'hasPendingChanges',
    'saveError',
    'errorMessage',
    'successMessage',
    'canRevert',
    'onRevert',
  ],
  template: '<div class="lesson-authoring-panel"></div>',
};

describe('LessonView component', () => {
  beforeEach(() => {
    controllerMock = createController();
    contentSyncMock.loadError.value = null;
    contentSyncMock.saveError.value = null;
    contentSyncMock.successMessage.value = null;
    contentSyncMock.hasPendingChanges.value = false;
    contentSyncMock.revertChanges.mockReset();
    contentSyncMock.serviceAvailable = true;
    teacherModeMock.value = true;
    highlightMock.mockReset();
  });

  it('exibe painel de autoria como visão padrão', () => {
    const wrapper = mount(LessonView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          LessonReadiness: StubComponent,
          LessonOverview: StubComponent,
          LessonRenderer: StubComponent,
          LessonAuthoringPanel: LessonAuthoringPanelStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.find('.lesson-authoring-panel').exists()).toBe(true);
    expect(wrapper.find('.lesson-content').exists()).toBe(false);
    expect(highlightMock).not.toHaveBeenCalled();
  });

  it('permite alternar para visualizar a prévia da lição', async () => {
    const wrapper = mount(LessonView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          LessonReadiness: StubComponent,
          LessonOverview: StubComponent,
          LessonRenderer: StubComponent,
          LessonAuthoringPanel: LessonAuthoringPanelStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    await wrapper.get('[data-testid="teacher-workspace-tab-preview"]').trigger('click');

    expect(wrapper.find('.lesson-authoring-panel').exists()).toBe(false);
    expect(wrapper.find('.lesson-content').exists()).toBe(true);
    expect(highlightMock).toHaveBeenCalled();
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
          LessonAuthoringPanel: LessonAuthoringPanelStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.text()).toContain('Não foi possível carregar esta aula');
    expect(wrapper.find('.lesson-authoring-panel').exists()).toBe(false);
  });

  it('oculta painel de autoria quando serviço não está disponível', () => {
    contentSyncMock.serviceAvailable = false;

    const wrapper = mount(LessonView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          LessonReadiness: StubComponent,
          LessonOverview: StubComponent,
          LessonRenderer: StubComponent,
          LessonAuthoringPanel: LessonAuthoringPanelStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.find('.lesson-authoring-panel').exists()).toBe(false);
    expect(wrapper.find('.lesson-content').exists()).toBe(true);
  });
});

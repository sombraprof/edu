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

const teacherModeMock = ref(true);
const toggleTeacherModeMock = vi.fn();

vi.mock('@/composables/useTeacherMode', () => ({
  useTeacherMode: () => ({
    teacherMode: teacherModeMock,
    toggleTeacherMode: toggleTeacherModeMock,
    isAuthoringForced: computed(() => false),
  }),
}));

const exerciseEditorModel = ref<Record<string, unknown> | null>({});

vi.mock('@/composables/useLessonEditorModel', () => ({
  useLessonEditorModel: () => ({
    lessonModel: exerciseEditorModel,
    setLessonModel: (value: Record<string, unknown> | null) => {
      exerciseEditorModel.value = value;
    },
    tagsField: computed({
      get: () => '',
      set: () => undefined,
    }),
    useArrayField: () =>
      computed({
        get: () => '',
        set: () => undefined,
      }),
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

const ButtonStub = {
  template: '<button><slot /></button>',
};

const ExerciseAuthoringPanelStub = {
  name: 'ExerciseAuthoringPanel',
  props: [
    'exerciseModel',
    'tagsField',
    'saving',
    'hasPendingChanges',
    'saveError',
    'errorMessage',
    'successMessage',
    'canRevert',
    'onRevert',
  ],
  template: '<div class="exercise-authoring-panel"></div>',
};

function stubMatchMedia() {
  if (typeof window === 'undefined') {
    return;
  }

  const matchMediaMock = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });
}

const mountAppWithExerciseView = async () => {
  stubMatchMedia();
  const { default: App } = await import('@/App.vue');

  return mount(App, {
    global: {
      stubs: {
        Md3Button: ButtonStub,
        RouterLink: { template: '<a><slot /></a>' },
        ExerciseAuthoringPanel: ExerciseAuthoringPanelStub,
        ChevronRight: { template: '<span />' },
        ArrowLeft: { template: '<span />' },
        SiteHeader: { template: '<header />' },
        SiteFooter: { template: '<footer />' },
        ArrowUp: { template: '<span />' },
        RouterView: {
          template: '<ExerciseView />',
          components: { ExerciseView },
        },
      },
    },
  });
};

describe('ExerciseView component', () => {
  beforeEach(() => {
    controllerMock = createController();
    contentSyncMock.loadError.value = null;
    contentSyncMock.saveError.value = null;
    contentSyncMock.successMessage.value = null;
    contentSyncMock.hasPendingChanges.value = false;
    contentSyncMock.revertChanges.mockReset();
    contentSyncMock.serviceAvailable = true;
    teacherModeMock.value = true;
    toggleTeacherModeMock.mockReset();
    exerciseEditorModel.value = {};
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exibe painel de autoria como visão padrão', () => {
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          ExerciseAuthoringPanel: ExerciseAuthoringPanelStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.find('.exercise-authoring-panel').exists()).toBe(true);
    expect(wrapper.find('.lesson-content').exists()).toBe(false);
  });

  it('permite alternar para visualizar a prévia do exercício', async () => {
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          ExerciseAuthoringPanel: ExerciseAuthoringPanelStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    await wrapper.get('[data-testid="teacher-workspace-tab-preview"]').trigger('click');

    expect(wrapper.find('.exercise-authoring-panel').exists()).toBe(false);
    expect(wrapper.find('.teacher-preview-shell').exists()).toBe(true);
    expect(wrapper.text()).toContain('Título');
  });

  it('mostra fallback quando exercício não possui componente', async () => {
    controllerMock.exerciseComponent.value = null;
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          ExerciseAuthoringPanel: ExerciseAuthoringPanelStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    await wrapper.get('[data-testid="teacher-workspace-tab-preview"]').trigger('click');

    expect(wrapper.text()).toContain('Conteúdo deste exercício ainda não está disponível');
  });

  it('oculta painel de autoria quando serviço não está disponível', () => {
    contentSyncMock.serviceAvailable = false;

    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          ExerciseAuthoringPanel: ExerciseAuthoringPanelStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
        },
      },
    });

    expect(wrapper.find('.exercise-authoring-panel').exists()).toBe(false);
    expect(wrapper.text()).toContain('Título');
  });

  it('aplica layout expandido de professor quando automação está disponível', async () => {
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');

    const wrapper = await mountAppWithExerciseView();

    expect(wrapper.get('main').classes()).toContain('md-page--teacher');

    wrapper.unmount();
  });

  it('mantém layout padrão quando automação está indisponível', async () => {
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_API_URL', '');

    const wrapper = await mountAppWithExerciseView();

    expect(wrapper.get('main').classes()).not.toContain('md-page--teacher');

    wrapper.unmount();
  });
});

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, shallowRef, ref } from 'vue';
import type { ExerciseViewController } from '../ExerciseView.logic';

const BlockEditorStub = {
  props: ['block'],
  emits: ['update:block'],
  template: '<div class="block-editor-stub">{{ block?.title ?? block?.__uiKey }}</div>',
};

const MetadataListEditorStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<div class="metadata-list-editor-stub"></div>',
};

vi.mock('@/composables/useLessonEditorModel', async () => {
  const actual = (await vi.importActual(
    '@/composables/useLessonEditorModel'
  )) as typeof import('@/composables/useLessonEditorModel');

  return {
    ...actual,
    resolveLessonBlockEditor: () => BlockEditorStub,
  };
});

import ExerciseView from '../ExerciseView.vue';

type Controller = ExerciseViewController;

const createController = () => {
  const exerciseTitle = ref('Título');
  const exerciseSummary = ref('Resumo');
  const exerciseComponent = shallowRef<any | null>({ render: () => null });
  const exerciseFile = ref('exercise.vue');
  const exerciseAvailable = ref(true);
  const exerciseLink = ref('');
  const exerciseType = ref('worksheet');
  const exerciseMetadata = shallowRef<Record<string, unknown> | null>(null);

  return {
    courseId: computed(() => 'demo'),
    exerciseId: computed(() => 'exercise-01'),
    exerciseTitle,
    exerciseSummary,
    exerciseComponent,
    exerciseFile,
    loadExercise: vi.fn(),
    exerciseAvailable,
    exerciseLink,
    exerciseType,
    exerciseMetadata,
    setManifestEntry: vi.fn((entry?: Record<string, unknown> | null) => {
      exerciseAvailable.value = Boolean(entry?.available ?? true);
    }),
    route: { params: { courseId: 'demo', exerciseId: 'exercise-01' }, query: {} } as any,
  } satisfies Controller;
};

let controllerMock: Controller;

vi.mock('../ExerciseView.logic', () => ({
  useExerciseViewController: () => controllerMock,
}));

const teacherModeMock = ref(true);
const toggleTeacherModeMock = vi.fn();

function resolveFlag(value: unknown): boolean {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === 'false' || normalized === '0' || normalized === 'off') {
      return false;
    }
    if (normalized === 'true') {
      return true;
    }
  }
  return Boolean(value ?? true);
}

vi.mock('@/composables/useTeacherMode', () => ({
  useTeacherMode: () => {
    const teacherModeEnabled = resolveFlag(import.meta.env.VITE_TEACHER_MODE_ENABLED);
    const teacherMode = computed(() => (teacherModeEnabled ? teacherModeMock.value : false));

    return {
      teacherMode,
      toggleTeacherMode: toggleTeacherModeMock,
      isAuthoringForced: computed(() => false),
      isAuthoringEnabled: computed(() => teacherModeEnabled && teacherModeMock.value),
    };
  },
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

const manifestSyncMock = {
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

let lastManifestEditorOptions: { setModel: (model: unknown) => void } | null = null;
let lastContentEditorOptions: { setModel: (model: unknown) => void } | null = null;

vi.mock('@/services/useTeacherContentEditor', () => ({
  useTeacherContentEditor: (options: { setModel: (model: unknown) => void }) => {
    if (!lastManifestEditorOptions) {
      lastManifestEditorOptions = options;
      return manifestSyncMock;
    }
    lastContentEditorOptions = options;
    return contentSyncMock;
  },
}));

const ButtonStub = {
  template: '<button><slot /></button>',
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
  vi.resetModules();
  const { default: App } = await import('@/App.vue');

  return mount(App, {
    global: {
      stubs: {
        Md3Button: ButtonStub,
        RouterLink: { template: '<a><slot /></a>' },
        MetadataListEditor: MetadataListEditorStub,
        ChevronRight: { template: '<span />' },
        ArrowLeft: { template: '<span />' },
        ArrowDown: { template: '<span />' },
        ArrowUp: { template: '<span />' },
        GripVertical: { template: '<span />' },
        Plus: { template: '<span />' },
        PenSquare: { template: '<span />' },
        Trash2: { template: '<span />' },
        SiteHeader: { template: '<header />' },
        SiteFooter: { template: '<footer />' },
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
    manifestSyncMock.loadError.value = null;
    manifestSyncMock.saveError.value = null;
    manifestSyncMock.successMessage.value = null;
    manifestSyncMock.hasPendingChanges.value = false;
    manifestSyncMock.revertChanges.mockReset();
    manifestSyncMock.serviceAvailable = true;
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');
    toggleTeacherModeMock.mockReset();
    lastManifestEditorOptions = null;
    lastContentEditorOptions = null;
    if (typeof HTMLElement !== 'undefined') {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exibe painel de autoria como visão padrão', async () => {
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          MetadataListEditor: MetadataListEditorStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
          ArrowDown: { template: '<span />' },
          ArrowUp: { template: '<span />' },
          GripVertical: { template: '<span />' },
          Plus: { template: '<span />' },
          PenSquare: { template: '<span />' },
          Trash2: { template: '<span />' },
        },
      },
    });

    lastContentEditorOptions?.setModel?.({
      title: 'Título',
      blocks: [{ type: 'contentBlock', __uiKey: 'exercise-block-1', title: 'Passo 1' }],
    });
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find('.teacher-authoring-workspace__sidebar .exercise-authoring-sidebar').exists()
    ).toBe(true);
    expect(wrapper.find('.exercise-block-editor').exists()).toBe(true);
    expect(wrapper.find('.lesson-content').exists()).toBe(false);
  });

  it('permite alternar para visualizar a prévia do exercício', async () => {
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          MetadataListEditor: MetadataListEditorStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
          ArrowDown: { template: '<span />' },
          ArrowUp: { template: '<span />' },
          GripVertical: { template: '<span />' },
          Plus: { template: '<span />' },
          PenSquare: { template: '<span />' },
          Trash2: { template: '<span />' },
        },
      },
    });

    lastContentEditorOptions?.setModel?.({
      title: 'Título',
      blocks: [{ type: 'contentBlock', __uiKey: 'exercise-block-1', title: 'Passo 1' }],
    });
    await wrapper.vm.$nextTick();

    await wrapper.get('[data-testid="teacher-workspace-tab-preview"]').trigger('click');

    expect(wrapper.find('.exercise-block-editor').exists()).toBe(false);
    expect(wrapper.find('.teacher-preview-shell').exists()).toBe(true);
    expect(wrapper.text()).toContain('Título');
  });

  it('mantém a navegação por blocos entre a barra lateral e o editor', async () => {
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          MetadataListEditor: MetadataListEditorStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
          ArrowDown: { template: '<span />' },
          ArrowUp: { template: '<span />' },
          GripVertical: { template: '<span />' },
          Plus: { template: '<span />' },
          PenSquare: { template: '<span />' },
          Trash2: { template: '<span />' },
        },
      },
    });

    lastContentEditorOptions?.setModel?.({
      blocks: [
        { type: 'contentBlock', __uiKey: 'exercise-block-1', title: 'Passo 1' },
        { type: 'contentBlock', __uiKey: 'exercise-block-2', title: 'Passo 2' },
      ],
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.get('.block-editor-stub').text()).toContain('Passo 1');

    const sidebar = wrapper.findComponent({ name: 'ExerciseAuthoringSidebar' });
    const selectBlock = sidebar.props().onSelectBlock as (index: number) => void;
    expect(typeof selectBlock).toBe('function');
    selectBlock(1);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.get('.block-editor-stub').text()).toContain('Passo 2');
  });

  it('atualiza disponibilidade do exercício após salvar o manifesto', async () => {
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          MetadataListEditor: MetadataListEditorStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
          ArrowDown: { template: '<span />' },
          ArrowUp: { template: '<span />' },
          GripVertical: { template: '<span />' },
          Plus: { template: '<span />' },
          PenSquare: { template: '<span />' },
          Trash2: { template: '<span />' },
        },
      },
    });

    await wrapper.vm.$nextTick();
    lastContentEditorOptions?.setModel?.({ title: 'Título', blocks: [] });
    await wrapper.vm.$nextTick();

    expect(lastManifestEditorOptions).toBeTruthy();
    lastManifestEditorOptions?.setModel?.({ id: 'exercise-01', available: true });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    manifestSyncMock.hasPendingChanges.value = true;
    await wrapper.vm.$nextTick();
    manifestSyncMock.saving.value = true;
    await wrapper.vm.$nextTick();
    manifestSyncMock.saving.value = false;
    manifestSyncMock.hasPendingChanges.value = false;
    await wrapper.vm.$nextTick();
    lastManifestEditorOptions?.setModel?.({ id: 'exercise-01', available: false });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(controllerMock.setManifestEntry).toHaveBeenCalled();
    expect(controllerMock.exerciseAvailable.value).toBe(false);
  });

  it('exibe aviso no painel quando exercício não possui componente', async () => {
    controllerMock.exerciseComponent.value = null;
    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          MetadataListEditor: MetadataListEditorStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
          ArrowDown: { template: '<span />' },
          ArrowUp: { template: '<span />' },
          GripVertical: { template: '<span />' },
          Plus: { template: '<span />' },
          PenSquare: { template: '<span />' },
          Trash2: { template: '<span />' },
        },
      },
    });

    expect(wrapper.text()).toContain(
      'Carregue o JSON correspondente para habilitar o painel de edição.'
    );
    expect(wrapper.find('.exercise-block-editor').exists()).toBe(true);
  });

  it('oculta painel de autoria quando serviço não está disponível', () => {
    contentSyncMock.serviceAvailable = false;

    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          MetadataListEditor: MetadataListEditorStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
          ArrowDown: { template: '<span />' },
          ArrowUp: { template: '<span />' },
          GripVertical: { template: '<span />' },
          Plus: { template: '<span />' },
          PenSquare: { template: '<span />' },
          Trash2: { template: '<span />' },
        },
      },
    });

    expect(wrapper.find('.exercise-block-editor').exists()).toBe(false);
    expect(wrapper.text()).toContain('Título');
  });

  it('oculta painel de autoria quando flag de modo professor está desativado', () => {
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'false');
    teacherModeMock.value = true;

    const wrapper = mount(ExerciseView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          MetadataListEditor: MetadataListEditorStub,
          ChevronRight: { template: '<span />' },
          ArrowLeft: { template: '<span />' },
          ArrowDown: { template: '<span />' },
          ArrowUp: { template: '<span />' },
          GripVertical: { template: '<span />' },
          Plus: { template: '<span />' },
          PenSquare: { template: '<span />' },
          Trash2: { template: '<span />' },
        },
      },
    });

    expect(wrapper.find('.exercise-block-editor').exists()).toBe(false);
    expect(wrapper.find('.lesson-content').exists()).toBe(false);
  });

  it('aplica layout expandido de professor quando automação está disponível', async () => {
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');

    const wrapper = await mountAppWithExerciseView();

    expect(wrapper.get('main').classes()).toContain('md-page--teacher');

    wrapper.unmount();
  });

  it('mantém layout padrão quando automação está indisponível', async () => {
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_API_URL', '');
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');

    const wrapper = await mountAppWithExerciseView();

    expect(wrapper.get('main').classes()).not.toContain('md-page--teacher');

    wrapper.unmount();
  });

  it('mantém layout padrão quando flag de modo professor está desativado', async () => {
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'false');

    const wrapper = await mountAppWithExerciseView();

    expect(wrapper.get('main').classes()).not.toContain('md-page--teacher');

    wrapper.unmount();
  });
});

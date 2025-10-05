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

  return {
    courseId: computed(() => 'demo'),
    exerciseId: computed(() => 'exercise-01'),
    exerciseTitle,
    exerciseSummary,
    exerciseComponent,
    exerciseFile,
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

let lastContentEditorOptions: {
  setModel: (model: unknown) => void;
} | null = null;

vi.mock('@/services/useTeacherContentEditor', () => ({
  useTeacherContentEditor: (options: { setModel: (model: unknown) => void }) => {
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
    teacherModeMock.value = true;
    toggleTeacherModeMock.mockReset();
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

  it('mostra fallback quando exercício não possui componente', async () => {
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

    expect(wrapper.text()).toContain('Conteúdo deste exercício ainda não está disponível');
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

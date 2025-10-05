import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, shallowRef, computed, watch } from 'vue';
import type { Ref } from 'vue';
import type { LessonViewController } from '../LessonView.logic';

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

import LessonView from '../LessonView.vue';

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
  const lessonContentFile = ref('lesson.json');
  const lessonAvailable = ref(true);
  const lessonLink = ref('');
  const lessonManifestType = ref('lesson');
  const lessonManifestMetadata = shallowRef<Record<string, unknown> | null>(null);

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
    lessonContentFile,
    loadLesson: vi.fn(),
    lessonAvailable,
    lessonLink,
    lessonManifestType,
    lessonManifestMetadata,
    setManifestEntry: vi.fn((entry?: Record<string, unknown> | null) => {
      lessonAvailable.value = Boolean(entry?.available ?? true);
    }),
    route: { params: { courseId: 'demo', lessonId: 'lesson-01' }, query: {} } as any,
  } satisfies Controller;
};

let controllerMock: Controller;

vi.mock('../LessonView.logic', () => ({
  useLessonViewController: () => controllerMock,
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

let lastManifestEditorOptions: { setModel: ReturnType<typeof vi.fn>; model: Ref<unknown> } | null =
  null;
let lastContentEditorOptions: { setModel: (model: unknown) => void } | null = null;
let manifestSetModelSpy: ReturnType<typeof vi.fn> | null = null;

vi.mock('@/services/useTeacherContentEditor', () => ({
  useTeacherContentEditor: (options: {
    setModel: (model: unknown) => void;
    model: Ref<unknown>;
  }) => {
    const originalSetModel = options.setModel;
    const setModelSpy = vi.fn(originalSetModel);
    (options as typeof options & { setModel: ReturnType<typeof vi.fn> }).setModel = setModelSpy;

    if (!lastManifestEditorOptions) {
      lastManifestEditorOptions = options as typeof options & {
        setModel: ReturnType<typeof vi.fn>;
      };
      manifestSetModelSpy = setModelSpy;

      let initialized = false;
      let skipNextUpdate = false;
      watch(
        () => options.model.value,
        (value) => {
          if (!initialized) {
            initialized = true;
            return;
          }

          if (skipNextUpdate) {
            skipNextUpdate = false;
            return;
          }

          manifestSyncMock.hasPendingChanges.value = true;
          skipNextUpdate = true;
          setModelSpy(value);
        },
        { deep: true }
      );

      return manifestSyncMock;
    }

    lastContentEditorOptions = options;
    return contentSyncMock;
  },
}));

vi.mock('vuedraggable', () => ({
  default: { name: 'Draggable', template: '<div><slot /></div>' },
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

const LessonRendererStub = {
  props: ['data'],
  template: `
    <section>
      <div
        v-for="(block, index) in (data?.content ?? [])"
        :key="block?.__uiKey ?? block?.title ?? block?.type ?? String(index)"
        :data-authoring-block="block?.__uiKey"
      >
        <pre><code class="language-js">{{ block?.body ?? '' }}</code></pre>
      </div>
    </section>
  `,
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

const mountAppWithLessonView = async () => {
  stubMatchMedia();
  vi.resetModules();
  const { default: App } = await import('@/App.vue');

  return mount(App, {
    global: {
      stubs: {
        Md3Button: ButtonStub,
        RouterLink: { template: '<a><slot /></a>' },
        LessonReadiness: StubComponent,
        LessonOverview: StubComponent,
        LessonRenderer: LessonRendererStub,
        MetadataListEditor: MetadataListEditorStub,
        ChevronRight: { template: '<span />' },
        ArrowLeft: { template: '<span />' },
        ArrowDown: { template: '<span />' },
        SiteHeader: { template: '<header />' },
        SiteFooter: { template: '<footer />' },
        ArrowUp: { template: '<span />' },
        GripVertical: { template: '<span />' },
        Plus: { template: '<span />' },
        PenSquare: { template: '<span />' },
        Trash2: { template: '<span />' },
        RouterView: {
          template: '<LessonView />',
          components: { LessonView },
        },
      },
    },
  });
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
    manifestSyncMock.loadError.value = null;
    manifestSyncMock.saveError.value = null;
    manifestSyncMock.successMessage.value = null;
    manifestSyncMock.hasPendingChanges.value = false;
    manifestSyncMock.revertChanges.mockReset();
    manifestSyncMock.serviceAvailable = true;
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');
    toggleTeacherModeMock.mockReset();
    highlightMock.mockReset();
    lastManifestEditorOptions = null;
    lastContentEditorOptions = null;
    manifestSetModelSpy = null;
    if (typeof HTMLElement !== 'undefined') {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });
    }
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  const mountComponent = (options?: { lessonModel?: Record<string, unknown> }) => {
    const wrapper = mount(LessonView, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          LessonReadiness: StubComponent,
          LessonOverview: StubComponent,
          LessonRenderer: LessonRendererStub,
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

    if (options?.lessonModel && lastContentEditorOptions) {
      lastContentEditorOptions.setModel(options.lessonModel);
    }

    return wrapper;
  };

  it('exibe painel de autoria como visão padrão', async () => {
    controllerMock.lessonData.value = {
      content: [{ type: 'contentBlock', __uiKey: 'block-1', title: 'Primeiro bloco' }],
    } as any;

    const wrapper = mountComponent({
      lessonModel: {
        title: 'Introdução',
        blocks: [{ type: 'contentBlock', __uiKey: 'block-1', title: 'Primeiro bloco' }],
      },
    });

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find('.teacher-authoring-workspace__sidebar .lesson-authoring-sidebar').exists()
    ).toBe(true);
    expect(wrapper.find('.lesson-block-editor').exists()).toBe(true);
    expect(wrapper.find('.lesson-content').exists()).toBe(false);
    expect(highlightMock).not.toHaveBeenCalled();
  });

  it('permite alternar para visualizar a prévia da lição', async () => {
    controllerMock.lessonData.value = {
      content: [{ type: 'contentBlock', __uiKey: 'block-1', title: 'Primeiro bloco' }],
    } as any;

    const wrapper = mountComponent({
      lessonModel: {
        title: 'Introdução',
        blocks: [{ type: 'contentBlock', __uiKey: 'block-1', title: 'Primeiro bloco' }],
      },
    });

    await wrapper.vm.$nextTick();

    await wrapper.get('[data-testid="teacher-workspace-tab-preview"]').trigger('click');
    await Promise.resolve();
    await Promise.resolve();

    expect(wrapper.find('.lesson-block-editor').exists()).toBe(false);
    expect(wrapper.find('.teacher-preview-shell').exists()).toBe(true);
    expect(wrapper.find('.lesson-content').exists()).toBe(true);
    expect(highlightMock).toHaveBeenCalled();
  });

  it('exibe aviso no painel quando lição não foi carregada', () => {
    controllerMock.lessonData.value = null;
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('Carregando os dados da aula.');
    expect(wrapper.text()).toContain('Abra uma aula válida para habilitar o painel de edição.');
    expect(wrapper.find('.lesson-block-editor').exists()).toBe(true);
  });

  it('oculta painel de autoria quando serviço não está disponível', () => {
    contentSyncMock.serviceAvailable = false;

    const wrapper = mountComponent();

    expect(wrapper.find('.lesson-block-editor').exists()).toBe(false);
    expect(wrapper.find('.lesson-content').exists()).toBe(true);
  });

  it('oculta painel de autoria quando flag de modo professor está desativado', () => {
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'false');
    teacherModeMock.value = true;

    const wrapper = mountComponent();

    expect(wrapper.find('.lesson-block-editor').exists()).toBe(false);
    expect(wrapper.find('.lesson-content').exists()).toBe(true);
  });

  it('mantém a navegação por blocos entre a barra lateral e o editor', async () => {
    controllerMock.lessonData.value = {
      content: [
        { type: 'contentBlock', __uiKey: 'block-1', title: 'Primeiro bloco' },
        { type: 'contentBlock', __uiKey: 'block-2', title: 'Segundo bloco' },
      ],
    } as any;

    const wrapper = mountComponent({
      lessonModel: {
        title: 'Introdução',
        blocks: [
          { type: 'contentBlock', __uiKey: 'block-1', title: 'Primeiro bloco' },
          { type: 'contentBlock', __uiKey: 'block-2', title: 'Segundo bloco' },
        ],
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.get('.block-editor-stub').text()).toContain('Primeiro bloco');

    const sidebar = wrapper.findComponent({ name: 'LessonAuthoringSidebar' });
    const selectBlock = sidebar.props().onSelectBlock as (index: number) => void;
    expect(typeof selectBlock).toBe('function');
    selectBlock(1);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.get('.block-editor-stub').text()).toContain('Segundo bloco');
  });

  it('não executa highlight enquanto a aba de prévia está inativa', async () => {
    vi.useFakeTimers();
    const wrapper = mountComponent();

    controllerMock.lessonData.value = {
      content: [{ type: 'contentBlock', body: 'console.log(1);', __uiKey: 'block-1' }],
    } as any;

    await Promise.resolve();
    vi.advanceTimersByTime(500);

    expect(highlightMock).not.toHaveBeenCalled();

    await wrapper.get('[data-testid="teacher-workspace-tab-preview"]').trigger('click');
    await Promise.resolve();
    await Promise.resolve();

    expect(highlightMock).toHaveBeenCalledTimes(1);
  });

  it('aplica highlight debounced apenas após mudanças estabilizarem na prévia', async () => {
    vi.useFakeTimers();
    controllerMock.lessonData.value = {
      content: [{ type: 'contentBlock', body: 'console.log(1);', __uiKey: 'block-1' }],
    } as any;

    const wrapper = mountComponent();

    await wrapper.get('[data-testid="teacher-workspace-tab-preview"]').trigger('click');
    await Promise.resolve();
    await Promise.resolve();
    highlightMock.mockClear();

    controllerMock.lessonData.value = {
      content: [{ type: 'contentBlock', body: 'console.log(2);', __uiKey: 'block-1' }],
    } as any;

    await Promise.resolve();
    vi.advanceTimersByTime(200);
    expect(highlightMock).not.toHaveBeenCalled();

    controllerMock.lessonData.value = {
      content: [{ type: 'contentBlock', body: 'console.log(3);', __uiKey: 'block-1' }],
    } as any;

    await Promise.resolve();
    vi.advanceTimersByTime(299);
    expect(highlightMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    await Promise.resolve();
    await Promise.resolve();

    expect(highlightMock).toHaveBeenCalledTimes(1);
    const context = highlightMock.mock.calls[0][0] as { targets?: Element[]; root?: Element };
    expect(context?.root).toBeInstanceOf(HTMLElement);
    expect(Array.isArray(context?.targets)).toBe(true);
    expect(context?.targets?.length ?? 0).toBeGreaterThanOrEqual(1);
  });

  it('aplica layout expandido de professor quando automação está disponível', async () => {
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');

    const wrapper = await mountAppWithLessonView();

    expect(wrapper.get('main').classes()).toContain('md-page--teacher');

    wrapper.unmount();
  });

  it('mantém layout padrão quando automação está indisponível', async () => {
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_API_URL', '');
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');

    const wrapper = await mountAppWithLessonView();

    expect(wrapper.get('main').classes()).not.toContain('md-page--teacher');

    wrapper.unmount();
  });

  it('mantém layout padrão quando flag de modo professor está desativado', async () => {
    teacherModeMock.value = true;
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'false');

    const wrapper = await mountAppWithLessonView();

    expect(wrapper.get('main').classes()).not.toContain('md-page--teacher');

    wrapper.unmount();
  });

  it('marca alterações pendentes ao editar manifesto da lição', async () => {
    controllerMock.lessonData.value = { content: [] } as any;

    const wrapper = mountComponent({
      lessonModel: { title: 'Introdução', blocks: [] },
    });

    await wrapper.vm.$nextTick();
    expect(lastManifestEditorOptions).toBeTruthy();
    expect(manifestSetModelSpy).toBeTruthy();

    lastManifestEditorOptions?.setModel?.({ id: 'lesson-01', available: true, link: '' });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();
    manifestSyncMock.hasPendingChanges.value = false;
    manifestSetModelSpy?.mockClear();

    await expect
      .poll(() => wrapper.find('[data-testid="lesson-availability-toggle"]').exists())
      .toBe(true);

    await wrapper.get('[data-testid="lesson-availability-toggle"]').setValue(false);
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(manifestSyncMock.hasPendingChanges.value).toBe(true);
    expect(manifestSetModelSpy).toHaveBeenCalled();
    expect(manifestSetModelSpy?.mock.calls.at(-1)?.[0]).toMatchObject({
      id: 'lesson-01',
      available: false,
    });

    manifestSyncMock.hasPendingChanges.value = false;
    manifestSetModelSpy?.mockClear();

    const linkInput = wrapper.get('input[placeholder="https://exemplo.com/material"]');
    await linkInput.setValue(' https://conteudo.com/aula ');
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(manifestSyncMock.hasPendingChanges.value).toBe(true);
    expect(manifestSetModelSpy).toHaveBeenCalled();
    expect(manifestSetModelSpy?.mock.calls.at(-1)?.[0]).toMatchObject({
      id: 'lesson-01',
      link: 'https://conteudo.com/aula',
    });

    wrapper.unmount();
  });

  it('atualiza disponibilidade da lição após salvar o manifesto', async () => {
    controllerMock.lessonData.value = { content: [] } as any;

    const wrapper = mountComponent({
      lessonModel: { title: 'Introdução', blocks: [] },
    });

    await wrapper.vm.$nextTick();
    lastContentEditorOptions?.setModel?.({ title: 'Introdução', blocks: [] });
    await wrapper.vm.$nextTick();

    expect(lastManifestEditorOptions).toBeTruthy();
    lastManifestEditorOptions?.setModel?.({ id: 'lesson-01', available: true });
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
    lastManifestEditorOptions?.setModel?.({ id: 'lesson-01', available: false });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();
    expect(controllerMock.setManifestEntry).toHaveBeenCalled();
    expect(controllerMock.lessonAvailable.value).toBe(false);
  });
});

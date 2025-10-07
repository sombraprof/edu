/* eslint-disable vue/one-component-per-file */
import { flushPromises, mount } from '@vue/test-utils';
import { computed, defineComponent, h, nextTick, ref, type PropType } from 'vue';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LessonEditorModel } from '@/composables/useLessonEditorModel';
import type { LessonAuthoringBlock } from '@/composables/useAuthoringBlockKeys';
import { defaultBlockTemplates } from '@/components/authoring/defaultBlockTemplates';
import { resolveBlock, type LessonBlock } from '@/components/lesson/blockRegistry';

const MetadataListEditorStub = defineComponent({
  name: 'MetadataListEditor',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(_props, { emit }) {
    function handleInput(event: Event) {
      emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
    }

    return { handleInput };
  },
  template:
    '<textarea class="metadata-editor" :value="modelValue" @input="handleInput"></textarea>',
});

vi.mock('@/components/authoring/MetadataListEditor.vue', () => ({
  __esModule: true,
  default: MetadataListEditorStub,
}));

const AuthoringDraggableListStub = defineComponent({
  name: 'AuthoringDraggableList',
  props: {
    modelValue: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'end'],
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {},
        (props.modelValue as unknown[]).map((element, index) =>
          slots.item ? slots.item({ element, index }) : null
        )
      );
  },
});

vi.mock('@/components/authoring/blocks/UnsupportedBlockEditor.vue', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  const Stub = defineComponent({
    name: 'UnsupportedBlockEditorStub',
    props: {
      block: {
        type: Object,
        required: true,
      },
    },
    emits: ['update:block'],
    setup(_, { emit }) {
      function handleInput(event: Event) {
        try {
          const value = JSON.parse((event.target as HTMLTextAreaElement).value);
          emit('update:block', value);
        } catch {
          // Ignora entradas inválidas no stub.
        }
      }

      return { handleInput };
    },
    template: '<textarea data-test="raw-json" autofocus @input="handleInput"></textarea>',
  });

  return {
    __esModule: true,
    ...actual,
    default: Stub,
  };
});

vi.mock('@/composables/useLessonEditorModel', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@/composables/useLessonEditorModel');
  const { default: Stub } = await import(
    '@/components/authoring/blocks/UnsupportedBlockEditor.vue'
  );

  return {
    __esModule: true,
    ...actual,
    resolveLessonBlockEditor(block: LessonBlock | null) {
      if (
        block &&
        typeof block === 'object' &&
        (block as { type?: string }).type === 'customBlock'
      ) {
        return Stub;
      }
      return actual.resolveLessonBlockEditor(block);
    },
  };
});

const iconStubs = {
  AlertCircle: true,
  ArrowDown: true,
  ArrowUp: true,
  CheckCircle2: true,
  CircleDashed: true,
  Clock3: true,
  GripVertical: true,
  LoaderCircle: true,
  PenSquare: true,
  Plus: true,
  Trash2: true,
};

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
const scrollIntoViewSpy = vi.fn();

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView =
    scrollIntoViewSpy as typeof HTMLElement.prototype.scrollIntoView;
});

afterAll(() => {
  HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
});

function createTextField(initialValue = '') {
  const state = ref(initialValue);
  return computed({
    get: () => state.value,
    set: (value: string) => {
      state.value = value;
    },
  });
}

function findField(wrapper: ReturnType<typeof mount>, label: string, selector: string) {
  const targetLabel = wrapper.findAll('label').find((node) => node.text().includes(label));

  if (!targetLabel) {
    throw new Error(`Could not find label containing: ${label}`);
  }

  const field = targetLabel.find(selector);
  if (!field.exists()) {
    throw new Error(`Could not find ${selector} inside label ${label}`);
  }

  return field;
}

describe('ExerciseAuthoringPanel - edição de metadados', () => {
  it('mantém estado seguro quando o modelo começa nulo e é definido depois', async () => {
    const exerciseModel = ref<LessonEditorModel | null>(null);

    const tagsField = computed({
      get: () => (exerciseModel.value?.tags ?? []).join('\n'),
      set: (value: string) => {
        if (!exerciseModel.value) return;
        exerciseModel.value.tags = value
          .split('\n')
          .map((entry) => entry.trim())
          .filter(Boolean);
      },
    });

    const { default: ExerciseAuthoringPanel } = await import('../ExerciseAuthoringPanel.vue');

    const wrapper = mount(ExerciseAuthoringPanel, {
      props: {
        exerciseModel,
        tagsField,
        saving: ref(false),
        hasPendingChanges: ref(false),
        saveError: ref<string | null>(null),
      },
      global: {
        stubs: {
          Md3Button: { template: '<button><slot /></button>' },
          MetadataListEditor: MetadataListEditorStub,
          AuthoringDraggableList: AuthoringDraggableListStub,
          ...iconStubs,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain(
      'Carregue o JSON correspondente para habilitar o painel de edição.'
    );
    expect(wrapper.findAll('label')).toHaveLength(0);

    exerciseModel.value = { blocks: [] };

    await nextTick();
    await flushPromises();

    const titleInput = findField(wrapper, 'Título', 'input');
    await titleInput.setValue('Título carregado');

    const summaryField = findField(wrapper, 'Resumo', 'textarea');
    await summaryField.setValue('Resumo carregado');

    const tagsEditor = wrapper.findComponent({ name: 'MetadataListEditor' });
    expect(tagsEditor.exists()).toBe(true);
    await tagsEditor.vm.$emit('update:modelValue', 'tag-1\ntag-2');

    expect(exerciseModel.value?.title).toBe('Título carregado');
    expect(exerciseModel.value?.summary).toBe('Resumo carregado');
    expect(exerciseModel.value?.tags).toEqual(['tag-1', 'tag-2']);
  });

  it('sincroniza título, resumo e tags com o modelo reativo', async () => {
    const exerciseModel = ref<LessonEditorModel>({
      title: 'Exercício 1',
      summary: 'Resumo original',
      tags: ['algebra'],
      blocks: [],
    });

    const tagsField = computed({
      get: () => (exerciseModel.value?.tags ?? []).join('\n'),
      set: (value: string) => {
        if (!exerciseModel.value) return;
        exerciseModel.value.tags = value
          .split('\n')
          .map((entry) => entry.trim())
          .filter(Boolean);
      },
    });

    const { default: ExerciseAuthoringPanel } = await import('../ExerciseAuthoringPanel.vue');

    const wrapper = mount(ExerciseAuthoringPanel, {
      props: {
        exerciseModel,
        tagsField,
        saving: ref(false),
        hasPendingChanges: ref(false),
        saveError: ref<string | null>(null),
      },
      global: {
        stubs: {
          Md3Button: { template: '<button><slot /></button>' },
          MetadataListEditor: MetadataListEditorStub,
          AuthoringDraggableList: AuthoringDraggableListStub,
          ...iconStubs,
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const titleInput = findField(wrapper, 'Título', 'input');
    await titleInput.setValue('Exercício atualizado');

    const summaryField = findField(wrapper, 'Resumo', 'textarea');
    await summaryField.setValue('Resumo revisado');

    const tagsEditor = wrapper.findComponent({ name: 'MetadataListEditor' });
    expect(tagsEditor.exists()).toBe(true);
    await tagsEditor.vm.$emit('update:modelValue', 'tag-a\ntag-b');

    expect(exerciseModel.value?.title).toBe('Exercício atualizado');
    expect(exerciseModel.value?.summary).toBe('Resumo revisado');
    expect(exerciseModel.value?.tags).toEqual(['tag-a', 'tag-b']);
  });

  it('expõe as transições de status do salvamento na interface', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T09:00:00Z'));

    const exerciseModel = ref<LessonEditorModel>({
      title: 'Exercício 1',
      summary: 'Resumo',
      blocks: [],
    });

    const tagsField = createTextField();
    const saving = ref(false);
    const hasPendingChanges = ref(false);
    const saveError = ref<string | null>(null);

    const { default: ExerciseAuthoringPanel } = await import('../ExerciseAuthoringPanel.vue');

    const wrapper = mount(ExerciseAuthoringPanel, {
      props: {
        exerciseModel,
        tagsField,
        saving,
        hasPendingChanges,
        saveError,
      },
      global: {
        stubs: {
          Md3Button: { template: '<button><slot /></button>' },
          MetadataListEditor: MetadataListEditorStub,
          AuthoringDraggableList: AuthoringDraggableListStub,
          ...iconStubs,
        },
      },
    });

    try {
      await nextTick();

      const status = wrapper.get('[data-test="authoring-status"]');

      expect(status.attributes('data-status')).toBe('idle');
      expect(status.text()).toBe('Sem alterações pendentes');

      hasPendingChanges.value = true;
      await nextTick();

      expect(status.attributes('data-status')).toBe('pending');
      expect(status.text()).toBe('Alterações pendentes');

      saving.value = true;
      await nextTick();

      expect(status.attributes('data-status')).toBe('saving');
      expect(status.text()).toBe('Salvando alterações…');

      hasPendingChanges.value = false;
      saving.value = false;
      await nextTick();

      expect(status.attributes('data-status')).toBe('saved');
      expect(status.text()).toContain('Alterações salvas');

      saveError.value = 'Erro ao salvar alterações.';
      await nextTick();

      expect(status.attributes('data-status')).toBe('error');
      expect(status.text()).toBe('Erro ao salvar alterações.');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('ExerciseAuthoringPanel - generic block editor integration', () => {
  it('atualiza exerciseModel quando o editor genérico emite update:block', async () => {
    const exerciseModel = ref<LessonEditorModel>({
      blocks: [{ type: 'customBlock', foo: 'bar' }],
    });

    const { default: ExerciseAuthoringPanel } = await import('../ExerciseAuthoringPanel.vue');

    const wrapper = mount(ExerciseAuthoringPanel, {
      props: {
        exerciseModel,
        tagsField: createTextField(),
        saving: ref(false),
        hasPendingChanges: ref(false),
        saveError: ref<string | null>(null),
      },
      global: {
        stubs: {
          Md3Button: { template: '<button><slot /></button>' },
          MetadataListEditor: { template: '<div />' },
          ...iconStubs,
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const textarea = wrapper.find('[data-test="raw-json"]');
    expect(textarea.exists()).toBe(true);

    const nextValue = JSON.stringify({ type: 'customBlock', foo: 'baz' });
    await textarea.setValue(nextValue);

    expect(exerciseModel.value?.blocks?.[0]?.foo).toBe('baz');
  });
});

describe('ExerciseAuthoringPanel - templates padrão', () => {
  const exerciseSpecificTypes = [
    'codeSubmission',
    'dragAndDrop',
    'conceptMapper',
    'bugFixChallenge',
    'dataEntryForm',
    'scenarioBuilder',
    'peerReviewTask',
    'testGenerator',
    'rubricDisplay',
    'selfAssessment',
  ] as const;

  const templateEntries = (
    Object.entries(defaultBlockTemplates) as Array<[string, LessonBlock]>
  ).filter(([type]) =>
    exerciseSpecificTypes.includes(type as (typeof exerciseSpecificTypes)[number])
  );

  async function mountPanel(initialBlocks: LessonAuthoringBlock[] = []) {
    const exerciseModel = ref<LessonEditorModel | null>({
      blocks: initialBlocks,
    });

    const { default: ExerciseAuthoringPanel } = await import('../ExerciseAuthoringPanel.vue');

    const wrapper = mount(ExerciseAuthoringPanel, {
      props: {
        exerciseModel,
        tagsField: createTextField(),
        saving: ref(false),
        hasPendingChanges: ref(false),
        saveError: ref<string | null>(null),
      },
      global: {
        stubs: {
          Md3Button: { template: '<button><slot /></button>' },
          MetadataListEditor: { template: '<div />' },
          ...iconStubs,
        },
      },
    });

    await flushPromises();

    return { wrapper, exerciseModel };
  }

  it.each(templateEntries)('usa template padrão ao inserir bloco %s', async (type, template) => {
    const { wrapper, exerciseModel } = await mountPanel();

    const selector = wrapper.find('select');
    await selector.setValue(type);

    const insertButton = wrapper
      .findAll('button')
      .find((button) => button.text().trim() === 'Inserir');
    expect(insertButton).toBeTruthy();

    await insertButton!.trigger('click');
    await flushPromises();

    const blocks = (exerciseModel.value?.blocks ?? []) as LessonAuthoringBlock[];
    expect(blocks).toHaveLength(1);

    const block = blocks[0];
    expect(block.type).toBe(type);
    expect(block).toMatchObject(template);
    expect(block).not.toBe(template);

    const resolution = resolveBlock(block);
    expect(resolution.error).toBeUndefined();
    expect(resolution.component).not.toBeNull();
  });
});

describe('ExerciseAuthoringPanel - gerenciamento de foco', () => {
  let lastFocused: Element | null = null;
  const originalFocus = HTMLElement.prototype.focus;

  beforeAll(() => {
    Object.defineProperty(document, 'activeElement', {
      writable: true,
      value: document.body,
    });
    HTMLElement.prototype.focus = function focusOverride(
      ...args: Parameters<HTMLElement['focus']>
    ) {
      const self = this as HTMLElement;
      originalFocus?.apply(self, args);
      (document as any).activeElement = self;
      lastFocused = self;
    } as (
      this: HTMLElement,
      ...args: Parameters<HTMLElement['focus']>
    ) => void as typeof HTMLElement.prototype.focus;
  });

  afterAll(() => {
    HTMLElement.prototype.focus = originalFocus;
  });

  beforeEach(() => {
    scrollIntoViewSpy.mockClear();
    lastFocused = null;
  });

  it('move o foco para o editor do bloco selecionado', async () => {
    const exerciseModel = ref<LessonEditorModel>({
      blocks: [{ type: 'customBlock', foo: 'bar' }],
    });

    const { default: ExerciseAuthoringPanel } = await import('../ExerciseAuthoringPanel.vue');

    const wrapper = mount(ExerciseAuthoringPanel, {
      props: {
        exerciseModel,
        tagsField: createTextField(),
        saving: ref(false),
        hasPendingChanges: ref(false),
        saveError: ref<string | null>(null),
      },
      global: {
        stubs: {
          Md3Button: { template: '<button type="button"><slot /></button>' },
          MetadataListEditor: { template: '<div />' },
          AuthoringDraggableList: AuthoringDraggableListStub,
          ...iconStubs,
        },
      },
    });

    await flushPromises();
    await flushPromises();

    document.body.focus();

    const editButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Editar detalhes'));
    expect(editButton).toBeTruthy();

    await editButton!.trigger('click');
    await flushPromises();
    await nextTick();
    await flushPromises();
    await nextTick();

    const editorField = wrapper.find('[data-test="raw-json"]');
    expect(editorField.exists()).toBe(true);
    expect(lastFocused).toBe(editorField.element);
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });
});

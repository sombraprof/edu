import { flushPromises, mount } from '@vue/test-utils';
import { computed, defineComponent, nextTick, ref } from 'vue';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LessonEditorModel } from '@/composables/useLessonEditorModel';
import type { LessonAuthoringBlock } from '@/composables/useAuthoringBlockKeys';
import { defaultBlockTemplates } from '@/components/authoring/defaultBlockTemplates';
import { resolveBlock, type LessonBlock } from '@/components/lesson/blockRegistry';

vi.mock('@/components/authoring/blocks/UnsupportedBlockEditor.vue', async (importOriginal) => {
  const actual = await importOriginal();

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
  const actual = await importOriginal<typeof import('@/composables/useLessonEditorModel')>();
  const { default: Stub } = await import(
    '@/components/authoring/blocks/UnsupportedBlockEditor.vue'
  );

  return {
    __esModule: true,
    ...actual,
    resolveLessonBlockEditor(block) {
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
    HTMLElement.prototype.focus = function focusOverride(this: HTMLElement) {
      lastFocused = this;
      return originalFocus?.call(this);
    } as typeof HTMLElement.prototype.focus;
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
          ...iconStubs,
        },
      },
    });

    await flushPromises();

    const editorField = wrapper.find('[data-test="raw-json"]');
    expect(editorField.exists()).toBe(true);

    document.body.focus();

    const editButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Editar detalhes'));
    expect(editButton).toBeTruthy();

    await editButton!.trigger('click');
    await flushPromises();
    await nextTick();

    expect(lastFocused).toBe(editorField.element);
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });
});

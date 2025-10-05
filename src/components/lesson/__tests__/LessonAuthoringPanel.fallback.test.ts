import { flushPromises, mount } from '@vue/test-utils';
import { computed, defineComponent, h, nextTick, ref, type PropType } from 'vue';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LessonEditorModel } from '@/composables/useLessonEditorModel';
import type { LessonBlock } from '@/components/lesson/blockRegistry';

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

describe('LessonAuthoringPanel - generic block editor integration', () => {
  it('atualiza lessonModel quando o editor genérico emite update:block', async () => {
    const lessonModel = ref<LessonEditorModel>({
      blocks: [{ type: 'customBlock', foo: 'bar' }],
    });

    const { default: LessonAuthoringPanel } = await import('../LessonAuthoringPanel.vue');

    const wrapper = mount(LessonAuthoringPanel, {
      props: {
        lessonModel,
        tagsField: createTextField(),
        createArrayField: () => createTextField(),
        saving: ref(false),
        hasPendingChanges: ref(false),
        saveError: ref<string | null>(null),
      },
      global: {
        stubs: {
          Md3Button: {
            template: '<button><slot /></button>',
          },
          AuthoringDraggableList: AuthoringDraggableListStub,
          ...iconStubs,
        },
      },
    });

    await flushPromises();
    await flushPromises();
    await flushPromises();

    const textarea = wrapper.find('[data-test="raw-json"]');
    expect(textarea.exists()).toBe(true);

    const nextValue = JSON.stringify({ type: 'customBlock', foo: 'baz' });
    await textarea.setValue(nextValue);

    expect(lessonModel.value?.blocks?.[0]?.foo).toBe('baz');
  });
});

describe('LessonAuthoringPanel - gerenciamento de foco', () => {
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

  it('desloca o foco para o primeiro campo editável ao selecionar um bloco', async () => {
    const lessonModel = ref<LessonEditorModel>({
      blocks: [{ type: 'customBlock', foo: 'bar' }],
    });

    const { default: LessonAuthoringPanel } = await import('../LessonAuthoringPanel.vue');

    const wrapper = mount(LessonAuthoringPanel, {
      props: {
        lessonModel,
        tagsField: createTextField(),
        createArrayField: () => createTextField(),
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

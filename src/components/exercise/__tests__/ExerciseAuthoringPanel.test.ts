import { flushPromises, mount } from '@vue/test-utils';
import { computed, defineComponent, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { LessonEditorModel } from '@/composables/useLessonEditorModel';

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
    template: '<textarea data-test="raw-json" @input="handleInput"></textarea>',
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

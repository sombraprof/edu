import { flushPromises, mount } from '@vue/test-utils';
import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { describe, expect, it } from 'vitest';
import type { LessonEditorModel } from '@/composables/useLessonEditorModel';
import type { LessonAuthoringBlock } from '@/composables/useAuthoringBlockKeys';

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
      type: Array as PropType<LessonAuthoringBlock[]>,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'end'],
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'div',
        attrs,
        props.modelValue.map((element, index) =>
          slots.item ? slots.item({ element, index }) : slots.default?.({ element, index })
        )
      );
  },
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

describe('ExerciseAuthoringPanel - reordenação e inserção', () => {
  async function mountPanel(initialBlocks: LessonAuthoringBlock[]) {
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
          AuthoringDraggableList: AuthoringDraggableListStub,
          ...iconStubs,
        },
      },
    });

    await flushPromises();

    return { wrapper, exerciseModel };
  }

  function readCardTitles(wrapper: ReturnType<typeof mount>) {
    return wrapper
      .findAll('article')
      .map((card) => card.find('p.md-typescale-label-large').text().trim());
  }

  it('mantém o cartão correspondente após mover um bloco', async () => {
    const initialBlocks: LessonAuthoringBlock[] = [
      { type: 'contentBlock', title: 'Primeiro', __uiKey: 'exercise-block-1' },
      { type: 'contentBlock', title: 'Segundo', __uiKey: 'exercise-block-2' },
    ];

    const { wrapper, exerciseModel } = await mountPanel(initialBlocks);

    expect(readCardTitles(wrapper)).toEqual(['Primeiro', 'Segundo']);

    const firstCard = wrapper.findAll('article')[0];
    const moveDownButton = firstCard
      .findAll('button')
      .find((button) => button.text().includes('Mover para baixo'));
    expect(moveDownButton).toBeTruthy();

    await moveDownButton!.trigger('click');
    await flushPromises();

    expect(readCardTitles(wrapper)).toEqual(['Segundo', 'Primeiro']);
    const blocks = exerciseModel.value?.blocks as LessonAuthoringBlock[];
    expect(blocks[0].__uiKey).toBe('exercise-block-2');
    expect(blocks[1].__uiKey).toBe('exercise-block-1');
  });

  it('mantém os cartões corretos após inserir um novo bloco', async () => {
    const initialBlocks: LessonAuthoringBlock[] = [
      { type: 'contentBlock', title: 'Primeiro', __uiKey: 'exercise-block-1' },
      { type: 'contentBlock', title: 'Segundo', __uiKey: 'exercise-block-2' },
    ];

    const { wrapper, exerciseModel } = await mountPanel(initialBlocks);

    const firstCard = wrapper.findAll('article')[0];
    const insertBelowButton = firstCard
      .findAll('button')
      .find((button) => button.text().includes('Inserir abaixo'));
    expect(insertBelowButton).toBeTruthy();

    await insertBelowButton!.trigger('click');
    await flushPromises();

    expect(readCardTitles(wrapper)).toEqual(['Primeiro', 'Bloco 2', 'Segundo']);

    const blocks = (exerciseModel.value?.blocks ?? []) as LessonAuthoringBlock[];
    expect(blocks).toHaveLength(3);
    expect(blocks[0].__uiKey).toBe('exercise-block-1');
    expect(blocks[2].__uiKey).toBe('exercise-block-2');
    expect(typeof blocks[1].__uiKey).toBe('string');
    expect(blocks[1].__uiKey).not.toBe(blocks[0].__uiKey);
    expect(blocks[1].__uiKey).not.toBe(blocks[2].__uiKey);
  });

  it('permite reordenar blocos arrastando cartões', async () => {
    const initialBlocks: LessonAuthoringBlock[] = [
      { type: 'contentBlock', title: 'Primeiro', __uiKey: 'exercise-block-1' },
      { type: 'contentBlock', title: 'Segundo', __uiKey: 'exercise-block-2' },
      { type: 'contentBlock', title: 'Terceiro', __uiKey: 'exercise-block-3' },
    ];

    const { wrapper, exerciseModel } = await mountPanel(initialBlocks);

    const draggable = wrapper.findComponent({ name: 'AuthoringDraggableList' });
    expect(draggable.exists()).toBe(true);

    const reordered = [
      initialBlocks[2],
      initialBlocks[0],
      initialBlocks[1],
    ] as LessonAuthoringBlock[];

    await draggable.vm.$emit('update:modelValue', reordered);
    await draggable.vm.$emit('end', { oldIndex: 0, newIndex: 1 });
    await flushPromises();

    expect(readCardTitles(wrapper)).toEqual(['Terceiro', 'Primeiro', 'Segundo']);
    const blocks = (exerciseModel.value?.blocks ?? []) as LessonAuthoringBlock[];
    expect(blocks).toHaveLength(3);
    expect(blocks[0].__uiKey).toBe('exercise-block-3');
    expect(blocks[1].__uiKey).toBe('exercise-block-1');
    expect(blocks[2].__uiKey).toBe('exercise-block-2');
  });
});

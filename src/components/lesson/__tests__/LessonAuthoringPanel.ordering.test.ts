import { flushPromises, mount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import type { LessonEditorModel } from '@/composables/useLessonEditorModel';
import type { LessonAuthoringBlock } from '@/composables/useAuthoringBlockKeys';
import { defaultBlockTemplates } from '@/components/authoring/defaultBlockTemplates';
import { resolveBlock, type LessonBlock } from '@/components/lesson/blockRegistry';

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

describe('LessonAuthoringPanel - reordenação e inserção', () => {
  async function mountPanel(initialBlocks: LessonAuthoringBlock[]) {
    const lessonModel = ref<LessonEditorModel | null>({
      blocks: initialBlocks,
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
          Md3Button: { template: '<button><slot /></button>' },
          MetadataListEditor: { template: '<div />' },
          ...iconStubs,
        },
      },
    });

    await flushPromises();

    return { wrapper, lessonModel };
  }

  function readCardTitles(wrapper: ReturnType<typeof mount>) {
    return wrapper
      .findAll('article')
      .map((card) => card.find('p.md-typescale-label-large').text().trim());
  }

  it('mantém a correspondência entre cartões e blocos após mover um item', async () => {
    const initialBlocks: LessonAuthoringBlock[] = [
      { type: 'contentBlock', title: 'Primeiro', __uiKey: 'lesson-block-1' },
      { type: 'contentBlock', title: 'Segundo', __uiKey: 'lesson-block-2' },
    ];

    const { wrapper, lessonModel } = await mountPanel(initialBlocks);

    expect(readCardTitles(wrapper)).toEqual(['Primeiro', 'Segundo']);

    const firstCard = wrapper.findAll('article')[0];
    const moveDownButton = firstCard
      .findAll('button')
      .find((button) => button.text().includes('Mover para baixo'));
    expect(moveDownButton).toBeTruthy();

    await moveDownButton!.trigger('click');
    await flushPromises();

    expect(readCardTitles(wrapper)).toEqual(['Segundo', 'Primeiro']);
    const blocks = lessonModel.value?.blocks as LessonAuthoringBlock[];
    expect(blocks[0].__uiKey).toBe('lesson-block-2');
    expect(blocks[1].__uiKey).toBe('lesson-block-1');
  });

  it('mantém o cartão correto para cada bloco ao inserir um item', async () => {
    const initialBlocks: LessonAuthoringBlock[] = [
      { type: 'contentBlock', title: 'Primeiro', __uiKey: 'lesson-block-1' },
      { type: 'contentBlock', title: 'Segundo', __uiKey: 'lesson-block-2' },
    ];

    const { wrapper, lessonModel } = await mountPanel(initialBlocks);

    const firstCard = wrapper.findAll('article')[0];
    const insertBelowButton = firstCard
      .findAll('button')
      .find((button) => button.text().includes('Inserir abaixo'));
    expect(insertBelowButton).toBeTruthy();

    await insertBelowButton!.trigger('click');
    await flushPromises();

    expect(readCardTitles(wrapper)).toEqual(['Primeiro', 'Bloco 2', 'Segundo']);

    const blocks = (lessonModel.value?.blocks ?? []) as LessonAuthoringBlock[];
    expect(blocks).toHaveLength(3);
    expect(blocks[0].__uiKey).toBe('lesson-block-1');
    expect(blocks[2].__uiKey).toBe('lesson-block-2');
    expect(typeof blocks[1].__uiKey).toBe('string');
    expect(blocks[1].__uiKey).not.toBe(blocks[0].__uiKey);
    expect(blocks[1].__uiKey).not.toBe(blocks[2].__uiKey);
  });

  it.each(Object.entries(defaultBlockTemplates) as Array<[string, LessonBlock]>)(
    'usa template padrão ao inserir bloco %s',
    async (type, template) => {
      const { wrapper, lessonModel } = await mountPanel([]);

      const selector = wrapper.find('select');
      await selector.setValue(type);

      const insertButton = wrapper
        .findAll('button')
        .find((button) => button.text().trim() === 'Inserir');
      expect(insertButton).toBeTruthy();

      await insertButton!.trigger('click');
      await flushPromises();

      const blocks = (lessonModel.value?.blocks ?? []) as LessonAuthoringBlock[];
      expect(blocks).toHaveLength(1);

      const block = blocks[0];
      expect(block.type).toBe(type);
      expect(block).toMatchObject(template);
      expect(block).not.toBe(template);

      const resolution = resolveBlock(block);
      expect(resolution.error).toBeUndefined();
      expect(resolution.component).not.toBeNull();
    }
  );
});

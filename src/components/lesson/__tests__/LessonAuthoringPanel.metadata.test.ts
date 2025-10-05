import { mount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import type { LessonEditorModel } from '@/composables/useLessonEditorModel';

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

function createArrayField() {
  return computed({
    get: () => '',
    set: () => {
      /* no-op for tests */
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

describe('LessonAuthoringPanel - edição de metadados', () => {
  it('sincroniza título, resumo e tags com o modelo reativo', async () => {
    const lessonModel = ref<LessonEditorModel>({
      title: 'Introdução',
      summary: 'Resumo original',
      tags: ['frontend'],
      blocks: [],
    });

    const tagsField = computed({
      get: () => (lessonModel.value?.tags ?? []).join('\n'),
      set: (value: string) => {
        if (!lessonModel.value) return;
        lessonModel.value.tags = value
          .split('\n')
          .map((entry) => entry.trim())
          .filter(Boolean);
      },
    });

    const { default: LessonAuthoringPanel } = await import('../LessonAuthoringPanel.vue');

    const wrapper = mount(LessonAuthoringPanel, {
      props: {
        lessonModel,
        tagsField,
        createArrayField,
        saving: ref(false),
        hasPendingChanges: ref(false),
        saveError: ref<string | null>(null),
      },
      global: {
        stubs: {
          Md3Button: { template: '<button><slot /></button>' },
          MetadataListEditor: { template: '<div />' },
          AuthoringDraggableList: { template: '<div><slot /></div>' },
          ...iconStubs,
        },
      },
    });

    const titleInput = findField(wrapper, 'Título', 'input');
    await titleInput.setValue('Nova aula');

    const summaryField = findField(wrapper, 'Resumo', 'textarea');
    await summaryField.setValue('Resumo atualizado');

    const tagsFieldElement = findField(wrapper, 'Tags', 'textarea');
    await tagsFieldElement.setValue('tag-1\ntag-2');

    expect(lessonModel.value?.title).toBe('Nova aula');
    expect(lessonModel.value?.summary).toBe('Resumo atualizado');
    expect(lessonModel.value?.tags).toEqual(['tag-1', 'tag-2']);
  });
});

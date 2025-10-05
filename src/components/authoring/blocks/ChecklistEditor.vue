<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type ChecklistBlock = {
  type?: string;
  title?: string;
  description?: string;
  items?: string[];
};

const props = defineProps<{ block: ChecklistBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: ChecklistBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'checklist' ? 'checklist' : (props.block?.type ?? 'checklist'),
  title: 'Checklist',
  description: 'Liste tarefas ou verificações que os estudantes devem realizar.',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Checklist da aula' },
    {
      type: 'textarea',
      key: 'description',
      label: 'Descrição',
      rows: 3,
      placeholder: 'Explique o objetivo da lista. Opcional.',
    },
    {
      type: 'string-list',
      key: 'items',
      label: 'Itens do checklist',
      itemLabel: 'Item',
      addLabel: 'Adicionar item',
      minItems: 1,
    },
  ],
}));

function forward(value: ChecklistBlock) {
  emit('update:block', value);
}
</script>

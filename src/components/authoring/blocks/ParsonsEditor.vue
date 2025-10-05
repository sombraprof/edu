<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type ParsonsBlock = {
  type?: string;
  title?: string;
  prompt?: string;
  lines?: string[];
};

const props = defineProps<{ block: ParsonsBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: ParsonsBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'parsons' ? 'parsons' : (props.block?.type ?? 'parsons'),
  title: 'Desafio Parsons',
  description: 'Monte um quebra-cabeça de linhas de código para reorganizar na ordem correta.',
  fields: [
    { type: 'text', key: 'title', label: 'Título', placeholder: 'Ordene o algoritmo' },
    {
      type: 'textarea',
      key: 'prompt',
      label: 'Enunciado',
      rows: 4,
      placeholder: 'Descreva a tarefa e as regras de organização.',
    },
    {
      type: 'string-list',
      key: 'lines',
      label: 'Linhas embaralhadas',
      itemLabel: 'Linha',
      addLabel: 'Adicionar linha',
      help: 'Cada linha é exibida individualmente para rearranjo.',
    },
  ],
}));

function forward(value: ParsonsBlock) {
  emit('update:block', value);
}
</script>

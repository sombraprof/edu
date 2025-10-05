<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type ParsonsPuzzleBlock = {
  type?: string;
  title?: string;
  prompt?: string;
  lines?: string[];
};

const props = defineProps<{ block: ParsonsPuzzleBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: ParsonsPuzzleBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type:
    props.block?.type === 'parsonsPuzzle'
      ? 'parsonsPuzzle'
      : (props.block?.type ?? 'parsonsPuzzle'),
  title: 'Parsons Puzzle',
  description: 'Variante do desafio Parsons com suporte a distrações ou múltiplos níveis.',
  fields: [
    { type: 'text', key: 'title', label: 'Título', placeholder: 'Reordene o script' },
    {
      type: 'textarea',
      key: 'prompt',
      label: 'Enunciado',
      rows: 4,
      placeholder: 'Inclua instruções claras e objetivos de aprendizado.',
    },
    {
      type: 'string-list',
      key: 'lines',
      label: 'Linhas embaralhadas',
      itemLabel: 'Linha',
      addLabel: 'Adicionar linha',
      help: 'Forneça apenas linhas relevantes e eventuais distrações necessárias.',
    },
  ],
}));

function forward(value: ParsonsPuzzleBlock) {
  emit('update:block', value);
}
</script>

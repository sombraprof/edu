<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type PromptTipBlock = {
  type?: string;
  title?: string;
  description?: string;
  audience?: string;
  prompt?: string;
  tags?: string[];
  tips?: string[];
};

const props = defineProps<{ block: PromptTipBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: PromptTipBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'promptTip' ? 'promptTip' : (props.block?.type ?? 'promptTip'),
  title: 'Dica de prompt',
  description: 'Compartilhe boas práticas para criação de prompts e esclareça o público-alvo.',
  fields: [
    { type: 'text', key: 'title', label: 'Título', placeholder: 'Estruture seu prompt' },
    {
      type: 'textarea',
      key: 'description',
      label: 'Descrição',
      rows: 3,
      placeholder: 'Contextualize a situação em que a dica deve ser aplicada.',
    },
    { type: 'text', key: 'audience', label: 'Público-alvo', placeholder: 'Estudantes de ADS' },
    {
      type: 'textarea',
      key: 'prompt',
      label: 'Prompt sugerido',
      rows: 4,
      placeholder: 'Inclua placeholders e instruções claras.',
    },
    {
      type: 'string-list',
      key: 'tags',
      label: 'Tags',
      itemLabel: 'Tag',
      addLabel: 'Adicionar tag',
      help: 'Use palavras-chave para facilitar a busca no painel.',
    },
    {
      type: 'string-list',
      key: 'tips',
      label: 'Boas práticas',
      itemLabel: 'Dica',
      addLabel: 'Adicionar dica',
      help: 'Oriente ajustes no prompt, validação de respostas ou limites éticos.',
    },
  ],
}));

function forward(value: PromptTipBlock) {
  emit('update:block', value);
}
</script>

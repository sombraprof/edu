<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type BibliographyBlock = {
  type?: string;
  title?: string;
  items?: string[];
};

const props = defineProps<{ block: BibliographyBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: BibliographyBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type:
    props.block?.type === 'bibliographyBlock'
      ? 'bibliographyBlock'
      : (props.block?.type ?? 'bibliographyBlock'),
  title: 'Bibliografia (bloco legado)',
  description: 'Mantenha referências alinhadas ao padrão anterior enquanto migra para blocos MD3.',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Referências' },
    {
      type: 'string-list',
      key: 'items',
      label: 'Referências',
      itemLabel: 'Referência',
      addLabel: 'Adicionar referência',
      help: 'Revise o formato antes de publicar. Considere migrar para o bloco Bibliografia.',
    },
  ],
}));

function forward(value: BibliographyBlock) {
  emit('update:block', value);
}
</script>

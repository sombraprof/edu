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
    props.block?.type === 'bibliography' ? 'bibliography' : (props.block?.type ?? 'bibliography'),
  title: 'Bibliografia',
  description: 'Liste referências utilizadas na aula com formatação padronizada.',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Referências' },
    {
      type: 'string-list',
      key: 'items',
      label: 'Referências',
      itemLabel: 'Referência',
      addLabel: 'Adicionar referência',
      help: 'Use formatação ABNT ou APA conforme a diretriz da disciplina.',
    },
  ],
}));

function forward(value: BibliographyBlock) {
  emit('update:block', value);
}
</script>

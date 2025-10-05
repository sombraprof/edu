<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type GlossaryTerm = { term?: string; definition?: string };

type GlossaryBlock = {
  type?: string;
  title?: string;
  terms?: GlossaryTerm[];
};

const props = defineProps<{ block: GlossaryBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: GlossaryBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'glossary' ? 'glossary' : (props.block?.type ?? 'glossary'),
  title: 'Glossário',
  description: 'Defina termos chave para apoiar os estudantes durante a aula.',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Glossário' },
    {
      type: 'object-list',
      key: 'terms',
      label: 'Termos',
      itemLabel: 'Termo',
      addLabel: 'Adicionar termo',
      fields: [
        { type: 'text', key: 'term', label: 'Termo', placeholder: 'Encapsulamento' },
        {
          type: 'textarea',
          key: 'definition',
          label: 'Definição',
          rows: 3,
          placeholder: 'Explique o significado e como o termo se aplica ao contexto.',
        },
      ],
    },
  ],
}));

function forward(value: GlossaryBlock) {
  emit('update:block', value);
}
</script>

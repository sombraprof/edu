<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type AccordionItem = { title?: string; content?: string };

type AccordionBlock = {
  type?: string;
  items?: AccordionItem[];
};

const props = defineProps<{ block: AccordionBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: AccordionBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'accordion' ? 'accordion' : (props.block?.type ?? 'accordion'),
  title: 'Accordion de conteúdos',
  description: 'Agrupe tópicos extensos em seções recolhíveis para facilitar a navegação.',
  fields: [
    {
      type: 'object-list',
      key: 'items',
      label: 'Seções',
      itemLabel: 'Seção',
      addLabel: 'Adicionar seção',
      fields: [
        { type: 'text', key: 'title', label: 'Título', placeholder: 'Tópico 1' },
        {
          type: 'textarea',
          key: 'content',
          label: 'Conteúdo',
          rows: 4,
          placeholder: 'Texto exibido ao expandir a seção.',
        },
      ],
    },
  ],
}));

function forward(value: AccordionBlock) {
  emit('update:block', value);
}
</script>

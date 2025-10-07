<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type RepresentationItem = { title?: string; content?: string };

type RepresentationsBlock = {
  type?: string;
  title?: string;
  description?: string;
  items?: RepresentationItem[];
};

const props = defineProps<{ block: RepresentationsBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: RepresentationsBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type:
    props.block?.type === 'representations'
      ? 'representations'
      : (props.block?.type ?? 'representations'),
  title: 'Múltiplas representações',
  description: 'Explore o mesmo conceito por diferentes perspectivas (texto, áudio, imagem, etc.).',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Representações' },
    {
      type: 'textarea',
      key: 'description',
      label: 'Descrição',
      rows: 3,
      placeholder: 'Contextualize o objetivo das representações.',
    },
    {
      type: 'object-list',
      key: 'items',
      label: 'Representações',
      itemLabel: 'Representação',
      addLabel: 'Adicionar representação',
      fields: [
        { type: 'text', key: 'title', label: 'Título', placeholder: 'Visão conceitual' },
        {
          type: 'textarea',
          key: 'content',
          label: 'Conteúdo',
          rows: 3,
          placeholder: 'Descreva a representação ou forneça instruções.',
        },
      ],
    },
  ],
}));

function forward(value: RepresentationsBlock) {
  emit('update:block', value);
}
</script>

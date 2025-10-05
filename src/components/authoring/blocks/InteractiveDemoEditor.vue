<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type InteractiveDemoBlock = {
  type?: string;
  title?: string;
  url?: string;
  description?: string;
};

const props = defineProps<{ block: InteractiveDemoBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: InteractiveDemoBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type:
    props.block?.type === 'interactiveDemo'
      ? 'interactiveDemo'
      : (props.block?.type ?? 'interactiveDemo'),
  title: 'Demo interativa',
  description: 'Referencie protótipos ou laboratórios hospedados externamente.',
  fields: [
    { type: 'text', key: 'title', label: 'Título', placeholder: 'Simulador de algoritmos' },
    {
      type: 'url',
      key: 'url',
      label: 'URL da demo',
      placeholder: 'https://...',
      help: 'Certifique-se de que a demo está disponível sem login adicional.',
    },
    {
      type: 'textarea',
      key: 'description',
      label: 'Descrição',
      rows: 4,
      placeholder: 'Explique o objetivo da interação e o que observar.',
    },
  ],
}));

function forward(value: InteractiveDemoBlock) {
  emit('update:block', value);
}
</script>

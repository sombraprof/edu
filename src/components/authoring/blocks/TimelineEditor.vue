<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type TimelineStep = { title?: string; content?: string };

type TimelineBlock = {
  type?: string;
  title?: string;
  description?: string;
  steps?: TimelineStep[];
};

const props = defineProps<{ block: TimelineBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: TimelineBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'timeline' ? 'timeline' : (props.block?.type ?? 'timeline'),
  title: 'Linha do tempo',
  description: 'Mapeie marcos cronológicos ou etapas críticas da atividade.',
  fields: [
    {
      type: 'text',
      key: 'title',
      label: 'Título do bloco',
      placeholder: 'Linha do tempo do projeto',
    },
    {
      type: 'textarea',
      key: 'description',
      label: 'Descrição',
      rows: 3,
      placeholder: 'Explique como interpretar a linha do tempo. Opcional.',
    },
    {
      type: 'object-list',
      key: 'steps',
      label: 'Marcos',
      itemLabel: 'Marco',
      addLabel: 'Adicionar marco',
      fields: [
        { type: 'text', key: 'title', label: 'Título do marco', placeholder: 'Kick-off' },
        {
          type: 'textarea',
          key: 'content',
          label: 'Descrição',
          rows: 3,
          placeholder: 'Descreva o que acontece neste marco.',
        },
      ],
    },
  ],
}));

function forward(value: TimelineBlock) {
  emit('update:block', value);
}
</script>

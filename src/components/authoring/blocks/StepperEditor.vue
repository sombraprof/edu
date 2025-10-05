<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type StepperStep = { title?: string; description?: string };

type StepperBlock = {
  type?: string;
  title?: string;
  steps?: StepperStep[];
};

const props = defineProps<{ block: StepperBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: StepperBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'stepper' ? 'stepper' : (props.block?.type ?? 'stepper'),
  title: 'Passo a passo',
  description: 'Divida atividades complexas em etapas sequenciais com instruções claras.',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Passo a passo' },
    {
      type: 'object-list',
      key: 'steps',
      label: 'Passos',
      itemLabel: 'Passo',
      addLabel: 'Adicionar passo',
      fields: [
        { type: 'text', key: 'title', label: 'Título do passo', placeholder: 'Planejar' },
        {
          type: 'textarea',
          key: 'description',
          label: 'Descrição',
          rows: 3,
          placeholder: 'Explique o objetivo ou ação esperada neste passo.',
        },
      ],
    },
  ],
}));

function forward(value: StepperBlock) {
  emit('update:block', value);
}
</script>

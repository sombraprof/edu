<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type FlightPlanBlock = {
  type?: string;
  title?: string;
  items?: string[];
};

const props = defineProps<{ block: FlightPlanBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: FlightPlanBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'flightPlan' ? 'flightPlan' : (props.block?.type ?? 'flightPlan'),
  title: 'Plano de voo',
  description: 'Resuma grandes etapas da jornada e evidencie entregas esperadas.',
  fields: [
    { type: 'text', key: 'title', label: 'Título', placeholder: 'Plano de voo da sprint' },
    {
      type: 'string-list',
      key: 'items',
      label: 'Marcos principais',
      itemLabel: 'Marco',
      addLabel: 'Adicionar marco',
      help: 'Cada item representa uma etapa macro ou entrega importante.',
    },
  ],
}));

function forward(value: FlightPlanBlock) {
  emit('update:block', value);
}
</script>

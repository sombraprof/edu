<template>
  <label class="flex flex-col gap-2">
    <span class="md-typescale-label-large text-on-surface">{{ label }}</span>
    <textarea
      v-model="valueProxy"
      rows="4"
      class="rounded-3xl border border-outline bg-surface p-3 text-sm text-on-surface shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      placeholder="Uma entrada por linha"
    ></textarea>
    <span class="text-xs text-on-surface-variant"
      >Uma linha vazia remove o item correspondente.</span
    >
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ label: string; modelValue: string }>();
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>();

const valueProxy = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});
</script>

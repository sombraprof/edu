<template>
  <article class="knowledge-check card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        Checagem rápida
      </p>
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p class="text-body-medium text-on-surface">{{ data.prompt }}</p>
    </header>

    <fieldset class="knowledge-check__options" :aria-label="data.prompt">
      <legend class="sr-only">Respostas</legend>
      <label v-for="option in data.options" :key="option.id" class="knowledge-check__option">
        <input
          :type="data.allowMultiple ? 'checkbox' : 'radio'"
          :name="groupName"
          :value="option.id"
          v-model="selected"
        />
        <span>{{ option.text }}</span>
      </label>
    </fieldset>

    <p v-if="data.explanation && hasSelection" class="knowledge-check__explanation">
      {{ data.explanation }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface KnowledgeCheckOption {
  id: string;
  text: string;
}

export interface KnowledgeCheckBlockData {
  title?: string;
  prompt: string;
  options: KnowledgeCheckOption[];
  explanation?: string;
  allowMultiple?: boolean;
}

const props = defineProps<{ data: KnowledgeCheckBlockData }>();

const selected = ref<string | string[]>('');
const groupName = `knowledge-check-${Math.random().toString(36).slice(2, 8)}`;

const hasSelection = computed(() => {
  if (props.data.allowMultiple) {
    return Array.isArray(selected.value) && selected.value.length > 0;
  }
  return typeof selected.value === 'string' && selected.value.length > 0;
});
</script>

<style scoped>
.knowledge-check {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface-container);
}

.knowledge-check__options {
  border: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.knowledge-check__option {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface);
}

.knowledge-check__option input {
  margin-top: 0.25rem;
}

.knowledge-check__explanation {
  border-radius: 1rem;
  padding: 1rem;
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}
</style>

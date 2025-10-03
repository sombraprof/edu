<template>
  <article class="drag-drop card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.instructions" class="text-body-medium text-on-surface">
        {{ data.instructions }}
      </p>
    </header>

    <ul class="drag-drop__list" role="list">
      <li
        v-for="(step, index) in orderedSteps"
        :key="step.id"
        class="drag-drop__item"
        draggable="true"
        @dragstart="onDragStart(step.id)"
        @dragover.prevent="onDragOver(index)"
        @drop.prevent="onDrop(index)"
      >
        <span class="drag-drop__index">{{ index + 1 }}</span>
        <div class="drag-drop__content">
          <p class="text-body-medium text-on-surface">{{ step.label }}</p>
          <p v-if="step.description" class="text-body-small text-on-surface-variant">
            {{ step.description }}
          </p>
        </div>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

export interface DragAndDropStep {
  id: string;
  label: string;
  description?: string;
}

export interface DragAndDropBlockData {
  title?: string;
  instructions?: string;
  steps: DragAndDropStep[];
}

const props = defineProps<{ data: DragAndDropBlockData }>();

const steps = ref<DragAndDropStep[]>([...props.data.steps]);
const draggingId = ref<string | null>(null);

watch(
  () => props.data.steps,
  (value) => {
    steps.value = [...value];
  },
  { deep: true }
);

const orderedSteps = computed(() => steps.value);

function onDragStart(id: string) {
  draggingId.value = id;
}

function onDragOver(index: number) {
  // Mantido para acessibilidade; permite destacar possíveis alvos futuramente.
  void index;
}

function onDrop(index: number) {
  if (!draggingId.value) {
    return;
  }
  const currentIndex = steps.value.findIndex((step) => step.id === draggingId.value);
  if (currentIndex === -1) {
    return;
  }
  const [moved] = steps.value.splice(currentIndex, 1);
  steps.value.splice(index, 0, moved);
  draggingId.value = null;
}
</script>

<style scoped>
.drag-drop {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface-container);
}

.drag-drop__list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
}

.drag-drop__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface);
  cursor: move;
}

.drag-drop__item:focus,
.drag-drop__item:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
}

.drag-drop__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font-weight: 600;
}
</style>

<template>
  <article class="memory-visualizer card md-stack md-stack-4">
    <header v-if="data.title || data.summary" class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.summary" class="text-body-medium text-on-surface-variant">{{ data.summary }}</p>
    </header>

    <div class="memory-visualizer__grid">
      <section class="memory-visualizer__column" aria-label="Stack">
        <h4 class="text-title-small font-semibold text-on-surface">Stack</h4>
        <ol class="memory-visualizer__stack" role="list">
          <li v-for="(frame, index) in data.stack" :key="index" class="memory-visualizer__frame">
            <span class="text-label-medium text-on-surface-variant">{{ frame.label }}</span>
            <span class="text-body-large font-mono text-on-surface">{{ frame.value }}</span>
          </li>
          <li v-if="!data.stack?.length" class="memory-visualizer__empty">(vazio)</li>
        </ol>
      </section>

      <section class="memory-visualizer__column" aria-label="Heap">
        <h4 class="text-title-small font-semibold text-on-surface">Heap</h4>
        <ul class="memory-visualizer__heap" role="list">
          <li
            v-for="(allocation, index) in data.heap"
            :key="index"
            class="memory-visualizer__allocation"
          >
            <span class="text-label-medium text-on-surface-variant">{{ allocation.label }}</span>
            <span class="text-body-large font-mono text-on-surface">{{ allocation.value }}</span>
          </li>
          <li v-if="!data.heap?.length" class="memory-visualizer__empty">(sem alocações)</li>
        </ul>
      </section>
    </div>

    <p v-if="data.notes" class="text-body-small text-on-surface-variant">{{ data.notes }}</p>
  </article>
</template>

<script setup lang="ts">
export interface MemoryVisualizerEntry {
  label: string;
  value: string;
}

export interface MemoryVisualizerBlockData {
  title?: string;
  summary?: string;
  stack?: MemoryVisualizerEntry[];
  heap?: MemoryVisualizerEntry[];
  notes?: string;
}

defineProps<{ data: MemoryVisualizerBlockData }>();
</script>

<style scoped>
.memory-visualizer {
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.memory-visualizer__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.memory-visualizer__column {
  display: grid;
  gap: 0.75rem;
}

.memory-visualizer__stack,
.memory-visualizer__heap {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
}

.memory-visualizer__frame,
.memory-visualizer__allocation {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
}

.memory-visualizer__empty {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px dashed var(--md-sys-color-outline);
  color: var(--md-sys-color-on-surface-variant);
}
</style>

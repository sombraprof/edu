<template>
  <section class="memory-diagram">
    <p class="memory-diagram__title">{{ title }}</p>
    <div class="memory-diagram__grid">
      <div
        v-for="(char, index) in characters"
        :key="index"
        class="memory-diagram__cell"
        :class="{ 'memory-diagram__cell--terminator': char === '\\0' }"
      >
        {{ char === '\\0' ? '∅' : char }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  characters: string[];
}

defineProps<Props>();
</script>

<style scoped>
.memory-diagram {
  background: var(--md-sys-color-surface-container-high);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
  align-items: center;
  box-shadow: var(--shadow-elevation-1);
}

.memory-diagram__title {
  font-weight: 600;
  font-size: var(--md-sys-typescale-title-medium-size, 1.1rem);
  color: var(--md-sys-color-on-surface);
  text-align: center;
}

.memory-diagram__grid {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.memory-diagram__cell {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--md-sys-border-radius-medium);
  border: 2px solid var(--md-sys-color-outline);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1rem;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

.memory-diagram__cell--terminator {
  background: color-mix(in srgb, var(--md-sys-color-error-container) 70%, transparent);
  color: var(--md-sys-color-on-error-container);
  border-color: var(--md-sys-color-error);
}
</style>

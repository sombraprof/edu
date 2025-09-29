<template>
  <section class="lesson-timeline">
    <header class="lesson-timeline__header">
      <h3 class="lesson-timeline__title">{{ data.title }}</h3>
      <p v-if="data.description" class="lesson-timeline__description">{{ data.description }}</p>
    </header>

    <ol class="lesson-timeline__steps" role="list">
      <li v-for="(step, index) in data.steps" :key="index" class="lesson-timeline__step">
        <div class="lesson-timeline__marker">
          <span>{{ index + 1 }}</span>
        </div>
        <div class="lesson-timeline__body">
          <h4 class="lesson-timeline__step-title">{{ step.title }}</h4>
          <p class="lesson-timeline__step-text" v-html="sanitizeContent(step.content)"></p>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface Step {
  title: string;
  content: string;
}

interface TimelineData {
  title: string;
  description?: string;
  steps: Step[];
}

defineProps<{
  data: TimelineData;
}>();

function sanitizeContent(value: unknown): string {
  return sanitizeHtml(value);
}
</script>

<style scoped>
.lesson-timeline {
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface-container, var(--md-sys-color-surface)) 65%,
    var(--md-sys-color-surface, #ffffff) 35%
  );
  border-radius: var(--md-sys-shape-corner-extra-large, var(--md-sys-border-radius-large));
  padding: var(--md-sys-spacing-6) var(--md-sys-spacing-7);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
  border: 1px solid
    color-mix(
      in srgb,
      var(--md-sys-color-outline-variant, var(--md-sys-color-outline)) 70%,
      transparent
    );
}

.lesson-timeline__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-timeline__description {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
}

.lesson-timeline__steps {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-7);
}

.lesson-timeline__steps::before {
  content: '';
  position: absolute;
  left: 1.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
}

.lesson-timeline__step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-4);
  align-items: start;
  position: relative;
  padding-left: var(--md-sys-spacing-6);
}

.lesson-timeline__marker {
  position: relative;
  z-index: 1;
  width: 3.5rem;
  height: 3.5rem;
  margin-left: calc(-1.75rem);
  border-radius: var(--md-sys-border-radius-full);
  background: color-mix(in srgb, var(--md-sys-color-primary) 85%, var(--md-sys-color-surface) 15%);
  color: var(--md-sys-color-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: var(--md-sys-elevation-level2);
}

.lesson-timeline__marker span {
  transform: translateY(-1px);
}

.lesson-timeline__body {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-1);
  padding: var(--md-sys-spacing-4);
  border-radius: var(--md-sys-shape-corner-large, var(--md-sys-border-radius-large));
  background: color-mix(in srgb, var(--md-sys-color-surface) 85%, transparent 15%);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-timeline__step-title {
  font-size: var(--md-sys-typescale-title-medium-size, 1.1rem);
  font-weight: 600;
  color: var(--md-sys-color-primary);
}

.lesson-timeline__step-text {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.95rem);
}

.lesson-timeline :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .lesson-timeline {
    padding: var(--md-sys-spacing-5);
  }

  .lesson-timeline__steps::before {
    left: 1.5rem;
  }

  .lesson-timeline__step {
    grid-template-columns: 1fr;
    padding-left: 0;
  }

  .lesson-timeline__marker {
    margin-left: 0;
    margin-bottom: var(--md-sys-spacing-2);
  }
}
</style>

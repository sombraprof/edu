<template>
  <div class="card timeline">
    <h3 class="timeline__title">
      {{ data.title }}
    </h3>
    <p v-if="data.description" class="timeline__description">{{ data.description }}</p>

    <ol class="timeline__steps">
      <li v-for="(step, index) in data.steps" :key="index" class="timeline__item">
        <div class="timeline__marker">
          <span>{{ index + 1 }}</span>
        </div>
        <div class="timeline__body">
          <h4 class="timeline__step-title">{{ step.title }}</h4>
          <p class="timeline__step-text" v-html="step.content"></p>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  padding: var(--md-sys-spacing-6) var(--md-sys-spacing-7);
  margin: var(--md-sys-spacing-6) 0;
}

.timeline__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.timeline__description {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
  margin-bottom: var(--md-sys-spacing-2);
}

.timeline__steps {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-7);
}

.timeline__steps::before {
  content: '';
  position: absolute;
  left: 1.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
}

.timeline__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-4);
  align-items: start;
  position: relative;
  padding-left: calc(var(--md-sys-spacing-6));
}

.timeline__marker {
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
  box-shadow: var(--shadow-elevation-2);
}

.timeline__marker span {
  transform: translateY(-1px);
}

.timeline__body {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-1);
  padding: var(--md-sys-spacing-4);
  border-radius: var(--md-sys-border-radius-large);
  background: color-mix(in srgb, var(--md-sys-color-surface-container) 90%, transparent 10%);
  box-shadow: var(--shadow-elevation-1);
}

.timeline__step-title {
  font-size: var(--md-sys-typescale-title-medium-size, 1.1rem);
  font-weight: 600;
  color: var(--md-sys-color-primary);
}

.timeline__step-text {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.95rem);
}

@media (max-width: 640px) {
  .timeline {
    padding: var(--md-sys-spacing-5);
    margin: var(--md-sys-spacing-5) 0;
  }

  .timeline__steps::before {
    left: 1.5rem;
  }

  .timeline__item {
    grid-template-columns: 1fr;
    padding-left: 0;
  }

  .timeline__marker {
    margin-left: 0;
    margin-bottom: var(--md-sys-spacing-2);
  }
}
</style>

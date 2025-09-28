<template>
  <section class="md-roadmap" role="list">
    <article v-for="(step, index) in steps" :key="index" class="md-roadmap__step" role="listitem">
      <div class="md-roadmap__marker" aria-hidden="true">{{ index + 1 }}</div>
      <div class="md-roadmap__copy">
        <h6 class="md-roadmap__title">{{ step.title }}</h6>
        <p v-if="step.description" class="md-roadmap__description">{{ step.description }}</p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
interface RoadmapStep {
  title: string;
  description?: string;
}

defineProps<{ steps: RoadmapStep[] }>();
</script>

<style scoped>
.md-roadmap {
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.md-roadmap__step {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: var(--md-sys-spacing-3);
  padding: var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-large);
  background: var(--md-sys-color-surface-container-high);
  box-shadow: var(--shadow-elevation-1);
}

.md-roadmap__marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--md-sys-border-radius-full);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.md-roadmap__copy {
  display: grid;
  gap: var(--md-sys-spacing-1);
}

.md-roadmap__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-small-size, 1.05rem);
  line-height: var(--md-sys-typescale-title-small-line-height, 1.4);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.md-roadmap__description {
  margin: 0;
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 85%, transparent);
}

@media (max-width: 640px) {
  .md-roadmap__step {
    grid-template-columns: auto 1fr;
  }

  .md-roadmap__marker {
    width: 2.25rem;
    height: 2.25rem;
  }
}
</style>

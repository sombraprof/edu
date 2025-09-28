<template>
  <section class="lesson-flight-plan">
    <Rocket class="lesson-flight-plan__icon" aria-hidden="true" />

    <div class="lesson-flight-plan__content">
      <h3 class="lesson-flight-plan__title">{{ data.title }}</h3>
      <ul class="lesson-flight-plan__list" role="list">
        <li v-for="(item, index) in sanitizedItems" :key="index" v-html="item"></li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Rocket } from 'lucide-vue-next';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface FlightPlanData {
  title: string;
  items: string[];
}

const props = defineProps<{
  data: FlightPlanData;
}>();

const sanitizedItems = computed(() => props.data.items.map((item) => sanitizeHtml(item)));
</script>

<style scoped>
.lesson-flight-plan {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-4);
  align-items: start;
  box-shadow: var(--shadow-elevation-1);
}

.lesson-flight-plan__icon {
  width: 3rem;
  height: 3rem;
  color: var(--md-sys-color-primary);
}

.lesson-flight-plan__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.lesson-flight-plan__content {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
}

.lesson-flight-plan__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-flight-plan__list {
  margin: 0;
  padding-left: 1.25rem;
  list-style: disc;
  display: grid;
  gap: var(--md-sys-spacing-2);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
}

.lesson-flight-plan :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .lesson-flight-plan {
    grid-template-columns: 1fr;
  }

  .lesson-flight-plan__icon {
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>

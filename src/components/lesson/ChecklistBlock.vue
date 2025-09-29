<template>
  <section class="lesson-checklist">
    <header class="lesson-checklist__header">
      <h3 class="lesson-checklist__title">{{ data.title }}</h3>
      <p v-if="data.description" class="lesson-checklist__description">{{ data.description }}</p>
    </header>

    <ul class="lesson-checklist__list" role="list">
      <li v-for="(item, index) in sanitizedItems" :key="index" class="lesson-checklist__item">
        <CheckCircle class="lesson-checklist__icon" aria-hidden="true" />
        <p class="lesson-checklist__text" v-html="item"></p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle } from 'lucide-vue-next';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface ChecklistData {
  title: string;
  description?: string;
  items: string[];
}

const props = defineProps<{
  data: ChecklistData;
}>();

const sanitizedItems = computed(() => props.data.items.map((item) => sanitizeHtml(item)));
</script>

<style scoped>
.lesson-checklist {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-checklist__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-checklist__description {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
}

.lesson-checklist__list {
  display: grid;
  gap: var(--md-sys-spacing-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson-checklist__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-3);
  align-items: start;
}

.lesson-checklist__icon {
  width: 2rem;
  height: 2rem;
  color: var(--md-sys-color-success);
}

.lesson-checklist__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.lesson-checklist__text {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
}

.lesson-checklist :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .lesson-checklist {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

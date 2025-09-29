<template>
  <section class="lesson-bibliography">
    <header class="lesson-bibliography__header">
      <h3 class="lesson-bibliography__title">{{ data.title }}</h3>
    </header>

    <ul class="lesson-bibliography__list" role="list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="lesson-bibliography__item"
        v-html="item"
      ></li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface BibliographyEntry {
  html?: string;
  text?: string;
}

interface BibliographyData {
  title: string;
  items?: string[];
  content?: (string | BibliographyEntry)[];
}

const props = defineProps<{
  data: BibliographyData;
}>();

const items = computed(() => {
  if (Array.isArray(props.data.items) && props.data.items.length) {
    return props.data.items.map(sanitizeEntry);
  }

  if (Array.isArray(props.data.content)) {
    return props.data.content
      .map((entry) => {
        if (typeof entry === 'string') {
          return sanitizeEntry(entry);
        }

        if (!entry) {
          return '';
        }

        if (typeof entry.html === 'string') {
          return sanitizeEntry(entry.html);
        }

        if (typeof entry.text === 'string') {
          return sanitizeEntry(entry.text);
        }

        return '';
      })
      .filter(Boolean);
  }

  return [] as string[];
});

function sanitizeEntry(value: unknown): string {
  return sanitizeHtml(value);
}
</script>

<style scoped>
.lesson-bibliography {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-bibliography__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-bibliography__list {
  display: grid;
  gap: var(--md-sys-spacing-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson-bibliography__item {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
  line-height: 1.6;
}

.lesson-bibliography :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .lesson-bibliography {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

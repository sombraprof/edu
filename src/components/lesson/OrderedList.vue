<template>
  <ol class="lesson-ordered-list" role="list">
    <li v-for="(item, index) in sanitizedItems" :key="index" class="lesson-ordered-list__item">
      <span v-html="item"></span>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

type OrderedListEntry =
  | string
  | {
      title?: unknown;
      label?: unknown;
      text?: unknown;
      description?: unknown;
      content?: unknown;
      value?: unknown;
      html?: unknown;
    };

interface Props {
  items: OrderedListEntry[];
}

const props = defineProps<Props>();

const sanitizedItems = computed(() =>
  props.items
    .map((item) => {
      if (typeof item === 'string') {
        return sanitizeHtml(item);
      }

      if (item && typeof item === 'object') {
        const title = sanitizeHtml(item.title ?? item.label ?? '');
        const body =
          sanitizeHtml(item.text ?? item.description ?? item.content ?? item.value ?? '') ||
          sanitizeHtml(item.html ?? '');

        if (title && body) {
          return `<strong>${title}</strong> ${body}`.trim();
        }

        if (title) {
          return `<strong>${title}</strong>`;
        }

        if (body) {
          return body;
        }
      }

      return '';
    })
    .filter((value): value is string => value.length > 0)
);
</script>

<style scoped>
.lesson-ordered-list {
  margin: 0;
  padding-left: 1.5rem;
  list-style: decimal;
  display: grid;
  gap: var(--md-sys-spacing-3);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
}

.lesson-ordered-list__item {
  line-height: 1.6;
}

.lesson-ordered-list__item::marker {
  font-weight: 600;
  color: var(--md-sys-color-primary);
}

.lesson-ordered-list :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}
</style>

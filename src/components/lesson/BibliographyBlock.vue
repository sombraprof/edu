<template>
  <div class="card p-6 my-8">
    <h3 class="md-typescale-headline-small font-semibold text-on-surface mb-4">
      {{ data.title }}
    </h3>

    <ul :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-4)' }">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="md-typescale-body-large text-on-surface-variant lesson-content"
        v-html="item"
      ></li>
    </ul>
  </div>
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

  return [];
});

function sanitizeEntry(value: unknown): string {
  return sanitizeHtml(value);
}
</script>

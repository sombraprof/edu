<template>
  <div class="card p-6 my-8">
    <h3 class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">
      {{ data.title }}
    </h3>

    <ul :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-4)' }">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="text-body-large text-[var(--md-sys-color-on-surface-variant)] lesson-content"
        v-html="item"
      ></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
    return props.data.items;
  }

  if (Array.isArray(props.data.content)) {
    return props.data.content
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }

        if (!entry) {
          return '';
        }

        if (typeof entry.html === 'string') {
          return entry.html;
        }

        if (typeof entry.text === 'string') {
          return entry.text;
        }

        return '';
      })
      .filter(Boolean);
  }

  return [];
});
</script>

<template>
  <div class="card p-6 my-8">
    <h3 class="md-typescale-headline-small font-semibold text-on-surface mb-2">
      {{ data.title }}
    </h3>
    <p v-if="data.description" class="md-typescale-body-large text-on-surface-variant mb-6">
      {{ data.description }}
    </p>

    <ul :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-4)' }">
      <li v-for="(item, index) in data.items" :key="index" class="flex items-start gap-3">
        <CheckCircle class="md-icon md-icon--md text-[var(--md-sys-color-primary)] flex-shrink-0" />
        <p class="md-typescale-body-large text-on-surface-variant" v-html="sanitizeItem(item)"></p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle } from 'lucide-vue-next';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface ChecklistData {
  title: string;
  description?: string;
  items: string[];
}

defineProps<{
  data: ChecklistData;
}>();

function sanitizeItem(value: unknown): string {
  return sanitizeHtml(value);
}
</script>

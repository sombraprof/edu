<template>
  <div class="card md-surface-container p-6 my-8">
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <Rocket class="md-icon md-icon--md text-[var(--md-sys-color-primary)]" />
      </div>
      <div class="flex-grow">
        <h3 class="md-typescale-headline-small font-semibold text-on-surface mb-4">
          {{ data.title }}
        </h3>
        <ul
          class="list-disc list-inside md-typescale-body-large text-on-surface-variant"
          :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-3)' }"
        >
          <li v-for="(item, index) in data.items" :key="index" v-html="sanitizeItem(item)"></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Rocket } from 'lucide-vue-next';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface FlightPlanData {
  title: string;
  items: string[];
}

defineProps<{
  data: FlightPlanData;
}>();

function sanitizeItem(value: unknown): string {
  return sanitizeHtml(value);
}
</script>

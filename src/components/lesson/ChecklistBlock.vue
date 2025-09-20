<template>
  <div class="card p-6 my-8">
    <h3 class="text-headline-small font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">{{ data.title }}</h3>
    <p v-if="data.description" class="text-body-large mb-6 text-[var(--md-sys-color-on-surface-variant)]">{{ data.description }}</p>

    <ul :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-4)' }">
      <li v-for="(item, index) in data.items" :key="index" class="flex items-start gap-3">
        <CheckCircle :style="{ height: 'var(--md-sys-icon-size-medium)', width: 'var(--md-sys-icon-size-medium)' }" class="text-[var(--md-sys-color-primary)] flex-shrink-0" />
        <p class="text-body-large text-[var(--md-sys-color-on-surface-variant)]" v-html="item"></p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle } from 'lucide-vue-next';

interface ChecklistData {
  title: string;
  description?: string;
  items: string[];
}

defineProps<{
  data: ChecklistData;
}>();
</script>


<template>
  <div class="card surface-tonal p-6 my-8">
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <Rocket :style="{ height: 'var(--md-sys-icon-size-medium)', width: 'var(--md-sys-icon-size-medium)' }" class="text-[var(--md-sys-color-primary)]" />
      </div>
      <div class="flex-grow">
        <h3 class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ data.title }}</h3>
        <ul class="list-disc list-inside text-body-large text-[var(--md-sys-color-on-surface-variant)]" :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-3)' }">
          <li v-for="(item, index) in data.items" :key="index" v-html="item">
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Rocket } from 'lucide-vue-next';

interface FlightPlanData {
  title: string;
  items: string[];
}

defineProps<{
  data: FlightPlanData;
}>();
</script>

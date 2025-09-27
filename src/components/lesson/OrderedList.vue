<template>
  <ol class="list-decimal list-inside space-y-4 mt-4">
    <li v-for="(item, index) in sanitizedItems" :key="index" class="text-body-large">
      <span v-html="item"></span>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface Props {
  items: string[];
}

const props = defineProps<Props>();

const sanitizedItems = computed(() => props.items.map((item) => sanitizeHtml(item)));
</script>

<template>
  <div class="card p-6 my-8">
    <h3 class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ data.title }}</h3>

    <ul class="space-y-4">
      <li v-for="(item, index) in data.items" :key="index" class="text-body-large text-[var(--md-sys-color-on-surface-variant)] lesson-content" v-html="item"></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface BibliographyData {
  title: string;
  items: string[];
}

defineProps<{
  data: BibliographyData;
}>();
</script>

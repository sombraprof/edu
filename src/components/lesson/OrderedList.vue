<template>
  <ol class="list-decimal list-inside space-y-4 mt-4">
    <li v-for="(item, index) in items" :key="index" class="text-body-large">
      <span v-html="item"></span>
    </li>
  </ol>
</template>

<script setup lang="ts">
interface Props {
  items: string[];
}

defineProps<Props>();
</script>
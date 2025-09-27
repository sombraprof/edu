<script lang="ts">
import metaData from './lista1.json';

export const meta = {
  id: metaData.id,
  title: metaData.title,
  summary: metaData.summary,
  available: false,
};

export default {};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import exerciseData from './lista1.json';
</script>

<template>
  <LessonRenderer :data="exerciseData" />
</template>

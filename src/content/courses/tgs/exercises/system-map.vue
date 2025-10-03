<script lang="ts">
import metaData from './system-map.json';

export const meta = {
  id: metaData.id,
  title: metaData.title,
  summary: metaData.summary,
  available: true,
};

export default {};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import exerciseData from './system-map.json';
</script>

<template>
  <LessonRenderer :data="exerciseData" />
</template>

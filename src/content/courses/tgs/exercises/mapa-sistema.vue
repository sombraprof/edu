<script lang="ts">
import metaData from './mapa-sistema.json';

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
import exerciseData from './mapa-sistema.json';
</script>

<template>
  <LessonRenderer :data="exerciseData" />
</template>

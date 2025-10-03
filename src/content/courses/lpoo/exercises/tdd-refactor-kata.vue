<script lang="ts">
import metaData from './tdd-refactor-kata.json';

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
import exerciseData from './tdd-refactor-kata.json';
</script>

<template>
  <LessonRenderer :data="exerciseData" />
</template>

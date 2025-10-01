<script lang="ts">
import metaData from './refatoracao-modular.json';

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
import exerciseData from './refatoracao-modular.json';
</script>

<template>
  <LessonRenderer :data="exerciseData" />
</template>

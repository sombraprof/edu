<script lang="ts">
import metaData from './paper-prototype.json';

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
import exerciseData from './paper-prototype.json';
</script>

<template>
  <LessonRenderer :data="exerciseData" />
</template>

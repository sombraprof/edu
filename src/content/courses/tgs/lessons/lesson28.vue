<script lang="ts">
export const meta = {
  id: 'lesson28',
  title: 'Aula 28: Avaliação – NP2',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson28.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

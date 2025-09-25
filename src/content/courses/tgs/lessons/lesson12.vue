<script lang="ts">
export const meta = {
  id: 'lesson12',
  title: 'Aula 12: SI como Vantagem Competitiva',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson12.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

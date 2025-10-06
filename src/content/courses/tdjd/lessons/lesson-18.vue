<script lang="ts">
export const meta = {
  id: 'lesson-18',
  title: 'Aula 18: UX/UI em Jogos Digitais',
  available: false,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-18.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

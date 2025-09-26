<script lang="ts">
export const meta = {
  id: 'lesson-05',
  title: 'Aula 5: Fundamentos da Unity e Prototipagem',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-05.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

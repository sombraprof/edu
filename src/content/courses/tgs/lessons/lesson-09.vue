<script lang="ts">
export const meta = {
  id: 'lesson-09',
  title: 'Aula 9: Sistemas de Informação e seu Papel nas Organizações',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-09.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

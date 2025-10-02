<script lang="ts">
export const meta = {
  id: 'lesson-15',
  title: 'Aula 15: Tipos de Sistemas Empresariais',
  objective:
    'Analisar classificações de sistemas empresariais e relacioná-las a necessidades organizacionais.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-15.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

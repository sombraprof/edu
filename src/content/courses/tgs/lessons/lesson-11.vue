<script lang="ts">
export const meta = {
  id: 'lesson-11',
  title: 'Aula 11: Sistemas de Informação e a Tomada de Decisão',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-11.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

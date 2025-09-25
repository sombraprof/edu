<script lang="ts">
export const meta = {
  id: 'lesson7',
  title: 'Aula 7: Prototipagem Rápida e GDD',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson7.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

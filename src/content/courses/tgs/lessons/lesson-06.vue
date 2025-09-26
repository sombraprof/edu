<script lang="ts">
export const meta = {
  id: 'lesson-06',
  title: 'Aula 6: Fluxos e Transformação Organizacional',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-06.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

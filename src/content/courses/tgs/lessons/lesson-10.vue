<script lang="ts">
export const meta = {
  id: 'lesson-10',
  title: 'Aula 10: Níveis dos Sistemas de Informação (Operacional, Tático e Estratégico)',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-10.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

<script lang="ts">
export const meta = {
  id: 'lesson3',
  title: 'Aula 3: Estudos de Caso, Análise Crítica e Inovações',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson3.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

<script lang="ts">
export const meta = {
  id: 'lesson11',
  title: 'Aula 11: Revisão da Unidade III e Mini-teste',
  objective: 'Organizando decisões complexas de forma limpa e eficiente.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson11.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

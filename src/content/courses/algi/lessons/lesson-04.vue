<script lang="ts">
export const meta = {
  id: 'lesson-04',
  title: 'Aula 4: Do Pseudocódigo ao Primeiro Programa em C',
  objective: 'A transição do planeamento em Portugol para a implementação em Linguagem C.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-04.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

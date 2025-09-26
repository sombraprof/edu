<script lang="ts">
export const meta = {
  id: 'lesson-05',
  title: 'Aula 5: Representação Gráfica com Fluxogramas',
  objective:
    'Aprender a representar algoritmos de forma gráfica e compreender como os fluxogramas ajudam na clareza da lógica.',
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

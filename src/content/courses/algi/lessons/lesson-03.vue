<script lang="ts">
export const meta = {
  id: 'lesson-03',
  title: 'Aula 3: Estruturação de Algoritmos',
  objective:
    'Desenvolver a capacidade de transformar ideias em sequências lógicas ordenadas, preparando o raciocínio para a implementação em código.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-03.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

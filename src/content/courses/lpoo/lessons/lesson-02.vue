<script lang="ts">
export const meta = {
  id: 'lesson-02',
  title: 'Aula 2: Estrutura de um Programa Java e Sintaxe Básica',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-02.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

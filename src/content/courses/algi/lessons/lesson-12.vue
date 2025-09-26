<script lang="ts">
export const meta = {
  id: 'lesson-12',
  title: 'Aula 12: Condições Encadeadas com else if',
  objective: 'Criando múltiplos caminhos para decisões mais complexas e organizadas.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-12.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

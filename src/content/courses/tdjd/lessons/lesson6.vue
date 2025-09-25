<script lang="ts">
export const meta = {
  id: 'lesson6',
  title: 'Aula 6: Importação de Assets e Organização de Projeto',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson6.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

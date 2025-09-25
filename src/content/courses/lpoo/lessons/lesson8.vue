<script lang="ts">
export const meta = {
  id: 'lesson8',
  title: 'Aula 8: Tratamento de Exceções',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson8.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

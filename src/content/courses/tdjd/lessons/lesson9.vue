<script lang="ts">
export const meta = {
  id: 'lesson9',
  title: 'Aula 9: Consolidação de Protótipo e GDD',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson9.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

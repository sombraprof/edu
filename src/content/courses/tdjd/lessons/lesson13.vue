<script lang="ts">
export const meta = {
  id: 'lesson13',
  title: 'Aula 13: Projeto Final',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson13.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

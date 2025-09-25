<script lang="ts">
export const meta = {
  id: 'lesson5',
  title: 'Aula 5: A Organização como um Sistema Aberto',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson5.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

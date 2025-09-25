<script lang="ts">
export const meta = {
  id: 'lesson4',
  title: 'Aula 4: Unidade I – Activities e Intents',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson4.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

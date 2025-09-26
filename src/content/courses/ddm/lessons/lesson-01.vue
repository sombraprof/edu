<script lang="ts">
export const meta = {
  id: 'lesson-01',
  title: 'Aula 1: Unidade I – Fundamentos do Android',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-01.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

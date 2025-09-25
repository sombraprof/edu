<script lang="ts">
export const meta = {
  id: 'lesson10',
  title: 'Aula 10: Fundamentos de C# na Unity',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson10.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

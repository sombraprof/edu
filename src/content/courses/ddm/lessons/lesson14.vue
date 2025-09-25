<script lang="ts">
export const meta = {
  id: 'lesson14',
  title: 'Aula 14: Unidade III – Desenvolvimento Híbrido',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson14.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

<script lang="ts">
export const meta = {
  id: 'lesson3',
  title: 'Aula 3: Unidade I – Primeiro App Android',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson3.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

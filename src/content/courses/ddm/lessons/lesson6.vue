<script lang="ts">
export const meta = {
  id: 'lesson6',
  title: 'Aula 6: Unidade I – Projeto Prático: App de Boas-vindas',
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

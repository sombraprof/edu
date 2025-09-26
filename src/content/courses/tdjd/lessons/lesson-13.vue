<script lang="ts">
export const meta = {
  id: 'lesson-13',
  title: 'Aula 13: Arquitetura Baseada em Componentes',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-13.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

<script lang="ts">
export const meta = {
  id: 'lesson-04',
  title: 'Aula 4: Visibilidade, Modificadores de Acesso e Encapsulamento',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-04.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

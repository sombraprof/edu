<script lang="ts">
export const meta = {
  id: 'lesson7',
  title: 'Aula 7: Unidade II – O Ciclo de Vida das Activities',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson7.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

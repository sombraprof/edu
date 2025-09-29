<script lang="ts">
export const meta = {
  id: 'lesson-24',
  title: 'Aula 24 (Sábado Letivo): Estudo de Caso SAP em Operações',
  objective:
    'Vivenciar, em regime intensivo, a análise de um caso real de implantação SAP focado em operações industriais.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-24.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

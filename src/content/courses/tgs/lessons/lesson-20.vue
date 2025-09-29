<script lang="ts">
export const meta = {
  id: 'lesson-20',
  title: 'Aula 20: Módulos Essenciais e Processos Integrados',
  objective:
    'Explorar os módulos centrais de um ERP e compreender como eles suportam processos ponta a ponta.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-20.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

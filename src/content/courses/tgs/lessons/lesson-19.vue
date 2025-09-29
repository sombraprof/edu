<script lang="ts">
export const meta = {
  id: 'lesson-19',
  title: 'Aula 19: Introdução aos Sistemas ERP',
  objective:
    'Compreender o conceito de ERP, sua evolução histórica e o valor estratégico da integração de processos empresariais.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-19.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

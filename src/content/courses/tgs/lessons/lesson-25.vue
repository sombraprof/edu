<script lang="ts">
export const meta = {
  id: 'lesson-25',
  title: 'Aula 25: Estudo de Caso TOTVS em Serviços',
  objective:
    'Analisar implantação de TOTVS em uma empresa de serviços e identificar lições de integração financeira e operacional.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-25.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

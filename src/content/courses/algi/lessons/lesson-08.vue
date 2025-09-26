<script lang="ts">
export const meta = {
  id: 'lesson-08',
  title: 'Aula 8: Leitura Múltipla, Cálculos Encadeados e printf Formatado',
  objective: 'Consolidando o fluxo sequencial: Entrada → Processamento → Saída',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-08.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

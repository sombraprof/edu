<script lang="ts">
export const meta = {
  id: 'lesson39',
  title: 'Aula 39: Avaliação NP3',
  objective:
    'Avaliar de forma global o domínio dos conteúdos trabalhados ao longo do semestre, testando a capacidade do aluno de analisar problemas e implementar soluções completas em C, com estruturas de dados básicas.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson39.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

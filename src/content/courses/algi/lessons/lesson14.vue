<script lang="ts">
export const meta = {
  id: 'lesson14',
  title: 'Aula 14: Avaliação NP1',
  objective:
    'Avaliar o domínio dos conceitos fundamentais de algoritmos e programação em C trabalhados até o momento, medindo a capacidade de aplicar lógica e sintaxe correta para resolver problemas computacionais básicos.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson14.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

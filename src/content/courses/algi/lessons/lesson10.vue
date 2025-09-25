<script lang="ts">
export const meta = {
  id: 'lesson10',
  title: 'Aula 10: Estruturas de Controle Condicional com if e else',
  objective:
    'Escrever programas em C que alterem o fluxo do algoritmo com base em condições booleanas, utilizando if e else para decisões simples e compostas.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson10.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

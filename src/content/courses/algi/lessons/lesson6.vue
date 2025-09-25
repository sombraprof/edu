<script lang="ts">
export const meta = {
  id: 'lesson6',
  title: 'Aula 6: Variáveis, Constantes e Tipos de Dados em C',
  objective: 'Aprender a armazenar e manipular informações nos nossos programas.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson6.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

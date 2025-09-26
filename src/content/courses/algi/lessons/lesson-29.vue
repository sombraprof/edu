<script lang="ts">
export const meta = {
  id: 'lesson-29',
  title: 'Aula 29: Avaliação NP2',
  objective:
    'Avaliar a capacidade de aplicar <strong>if/else</strong> encadeados, operadores lógicos e estruturas de <strong>repetição</strong> (<code>while</code>, <code>for</code>, <code>do-while</code>), bem como a <strong>modularização com funções</strong> (parâmetros, retorno e boas práticas de escopo/protótipos) em problemas práticos de pequena escala.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-29.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

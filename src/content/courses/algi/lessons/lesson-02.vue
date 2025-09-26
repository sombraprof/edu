<script lang="ts">
export const meta = {
  id: 'lesson-02',
  title: 'Aula 2: Raciocínio Lógico',
  objective:
    'Desenvolver o raciocínio lógico através de exemplos do cotidiano e introduzir operadores lógicos como base para estruturas de decisão em programação.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-02.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

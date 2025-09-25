<script setup>
import lessonData from './lesson16.json';
// Importa o LessonRenderer que é o componente central para renderização de aulas
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

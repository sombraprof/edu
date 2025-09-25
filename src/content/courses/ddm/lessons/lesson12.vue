<script lang="ts">
export const meta = {
  id: 'lesson12',
  title: 'Aula 12: Unidade II – Storage e Notificações',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson12.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

<script lang="ts">
export const meta = {
  id: 'lesson-22',
  title: 'Aula 22: Governança de Dados Mestres no ERP',
  objective:
    'Estruturar políticas e processos para garantir qualidade, consistência e segurança dos dados mestres.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-22.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

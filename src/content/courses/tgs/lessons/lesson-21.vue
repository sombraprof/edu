<script lang="ts">
export const meta = {
  id: 'lesson-21',
  title: 'Aula 21: Integração ERP com a Cadeia de Suprimentos',
  objective:
    'Analisar como o ERP conecta fornecedores, estoques e distribuição em processos colaborativos.',
  available: true,
};
</script>

<script setup lang="ts">
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import lessonData from './lesson-21.json';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

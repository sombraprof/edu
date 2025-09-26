<script setup>
import lessonData from './lesson-14.json';
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

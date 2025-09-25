<script setup>
import lessonData from './lesson15.json';
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
</script>

<template>
  <LessonRenderer :data="lessonData" />
</template>

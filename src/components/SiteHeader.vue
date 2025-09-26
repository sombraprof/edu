<template>
  <!-- Sticky header with Material 3 styling -->
  <header class="app-top-bar">
    <div class="app-top-bar__content">
      <router-link to="/" class="brand">
        <span class="brand-mark">
          <GraduationCap class="md-icon md-icon--sm" />
        </span>
        <span class="brand-text">
          <span class="brand-subtitle">Disciplinas</span>
          <span class="brand-title">Prof. Tiago Sombra</span>
        </span>
        <span class="brand-title--mobile">Tiago Sombra</span>
      </router-link>
      <nav class="app-top-bar__actions">
        <router-link
          v-if="navAction"
          class="nav-link"
          :class="{ 'nav-link--active': navAction.to.name === route.name }"
          :to="navAction.to"
          :aria-label="navAction.label"
        >
          <component :is="navAction.icon" class="md-icon md-icon--sm" />
          <span>{{ navAction.label }}</span>
        </router-link>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// Header uses lucide icons and the theme toggle
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';
import { GraduationCap, Grid3x3, ArrowLeft } from 'lucide-vue-next';

const route = useRoute();

const navAction = computed(() => {
  if (route.name === 'lesson' || route.name === 'exercise') {
    const courseId = route.params.courseId ? String(route.params.courseId) : null;
    if (courseId) {
      return {
        label: 'Voltar para a disciplina',
        to: { name: 'course-home', params: { courseId } },
        icon: ArrowLeft,
      } as const;
    }
  }

  if (route.name === 'course-home') {
    return {
      label: 'Todas as disciplinas',
      to: { name: 'home' as const },
      icon: Grid3x3,
    } as const;
  }

  return null;
});
</script>

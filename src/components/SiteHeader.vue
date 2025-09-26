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
          v-for="action in navLinks"
          :key="action.label"
          class="nav-link"
          :class="{ 'nav-link--active': isActive(action) }"
          :to="action.to"
          :aria-label="action.label"
        >
          <component :is="action.icon" class="md-icon md-icon--sm" />
          <span>{{ action.label }}</span>
        </router-link>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// Header uses lucide icons and the theme toggle
import { computed } from 'vue';
import { useRoute, type RouteLocationRaw } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';
import { GraduationCap, Grid3x3, ArrowLeft, ClipboardList } from 'lucide-vue-next';

const route = useRoute();

type NavAction = {
  label: string;
  to: RouteLocationRaw;
  icon: unknown;
  targetName?: string;
};

const navLinks = computed<NavAction[]>(() => {
  const actions: NavAction[] = [];

  if (route.name === 'lesson' || route.name === 'exercise') {
    const courseId = route.params.courseId ? String(route.params.courseId) : null;
    if (courseId) {
      const toCourse: RouteLocationRaw = { name: 'course-home', params: { courseId } };
      actions.push({
        label: 'Voltar para a disciplina',
        to: toCourse,
        icon: ArrowLeft,
        targetName: 'course-home',
      });
    }
  }

  if (route.name === 'course-home') {
    const toHome: RouteLocationRaw = { name: 'home' };
    actions.push({
      label: 'Todas as disciplinas',
      to: toHome,
      icon: Grid3x3,
      targetName: 'home',
    });
  }

  const toReport: RouteLocationRaw = { name: 'validation-report' };
  actions.push({
    label: 'Relatório de validação',
    to: toReport,
    icon: ClipboardList,
    targetName: 'validation-report',
  });

  return actions;
});

function isActive(action: NavAction) {
  return action.targetName !== undefined && action.targetName === route.name;
}
</script>

<template>
  <Md3TopAppBar
    variant="center-aligned"
    density="comfortable"
    aria-label="Barra de navegação principal"
  >
    <router-link to="/" class="app-brand" aria-label="Início">
      <span class="app-brand__mark" aria-hidden="true">
        <GraduationCap class="md-icon md-icon--sm" />
      </span>
      <span class="app-brand__copy">
        <span class="app-brand__subtitle">Disciplinas</span>
        <span class="app-brand__title">Prof. Tiago Sombra</span>
      </span>
      <span class="app-brand__title--mobile">Tiago Sombra</span>
    </router-link>

    <template #actions>
      <nav class="app-top-bar__nav" aria-label="Rotas principais">
        <Md3Button
          v-for="action in navLinks"
          :key="action.label"
          :as="RouterLink"
          variant="text"
          class="md3-top-app-bar__action"
          :class="{ 'md3-top-app-bar__action--active': isActive(action) }"
          :to="action.to"
          :aria-current="isActive(action) ? 'page' : undefined"
        >
          <template #leading>
            <component :is="action.icon" class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          <span class="md3-top-app-bar__action-label">{{ action.label }}</span>
        </Md3Button>
        <ThemeToggle class="md3-top-app-bar__action md3-top-app-bar__action--icon" />
      </nav>
    </template>
  </Md3TopAppBar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, type RouteLocationRaw } from 'vue-router';
import Md3TopAppBar from './layout/Md3TopAppBar.vue';
import ThemeToggle from './ThemeToggle.vue';
import Md3Button from './Md3Button.vue';
import { GraduationCap, Grid3x3, ArrowLeft, ClipboardList, School } from 'lucide-vue-next';
import { useTeacherMode } from '../composables/useTeacherMode';

const route = useRoute();
const { teacherMode } = useTeacherMode();

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

  if (teacherMode.value) {
    const toTeacherGuide: RouteLocationRaw = { name: 'teacher-guide' };
    actions.push({
      label: 'Painel docente',
      to: toTeacherGuide,
      icon: School,
      targetName: 'teacher-guide',
    });
    const toReport: RouteLocationRaw = { name: 'validation-report' };
    actions.push({
      label: 'Relatório de validação',
      to: toReport,
      icon: ClipboardList,
      targetName: 'validation-report',
    });
  }

  return actions;
});

function isActive(action: NavAction) {
  return action.targetName !== undefined && action.targetName === route.name;
}
</script>

<template>
  <!-- Sticky header with Material 3 styling -->
  <header class="sticky top-0 z-50 border-b border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)]/90 backdrop-blur">
    <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
      <router-link to="/" class="inline-flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-elevation-1">
          <GraduationCap class="h-5 w-5" />
        </span>
        <span class="hidden flex-col leading-tight sm:flex">
          <span class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]">Educação Digital</span>
          <span class="text-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">EDU · Prof. Tiago Sombra</span>
        </span>
        <span class="text-title-medium font-semibold text-[var(--md-sys-color-on-surface)] sm:hidden">EDU</span>
      </router-link>
      <nav class="hidden items-center gap-2 md:flex">
        <router-link
          v-if="navAction"
          class="nav-link"
          :class="{ 'nav-link--active': navAction.to.name === route.name }"
          :to="navAction.to"
          :aria-label="navAction.label"
        >
          <component :is="navAction.icon" class="h-4 w-4" />
          <span>{{ navAction.label }}</span>
        </router-link>
        <ThemeToggle />
      </nav>
      <ThemeToggle class="md:hidden" />
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
  if (route.name === 'lesson') {
    const courseId = route.params.courseId ? String(route.params.courseId) : null;
    if (courseId) {
      return {
        label: 'Voltar para a disciplina',
        to: { name: 'course-home', params: { courseId } },
        icon: ArrowLeft
      } as const;
    }
  }

  if (route.name === 'course-home') {
    return {
      label: 'Todas as disciplinas',
      to: { name: 'home' as const },
      icon: Grid3x3
    } as const;
  }

  return null;
});
</script>

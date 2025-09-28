<template>
  <router-link
    class="card card--interactive course-card flex h-full flex-col p-6"
    :to="{ name: 'course-home', params: { courseId: meta.id } }"
    :aria-label="`Acessar disciplina ${meta.title}`"
    :style="accentStyle"
    @keydown.space.prevent="($event.target as HTMLElement).click()"
  >
    <div class="course-card__header">
      <div class="course-card__title-row">
        <span class="badge course-card__institution">
          {{ institutionLabel }}
        </span>
        <h3 class="md-typescale-headline-small font-semibold text-on-surface">
          {{ meta.title }}
        </h3>
      </div>
      <p
        v-if="meta.description"
        class="course-card__description supporting-text md-typescale-body-medium text-on-surface-variant"
      >
        {{ meta.description }}
      </p>
    </div>
    <div class="course-card__footer mt-auto w-full">
      <div
        v-if="$slots.meta"
        class="flex flex-wrap gap-2 md-typescale-body-small text-on-surface-variant"
      >
        <slot name="meta" />
      </div>
      <span class="course-card__action md-typescale-label-medium font-medium">
        <span>Acessar disciplina</span>
        <ChevronRight class="md-icon" />
      </span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
// Course card with institution-specific accent
import { computed } from 'vue';
import { ChevronRight } from 'lucide-vue-next';
import type { CourseMeta } from '../data/courses';

const props = defineProps<{ meta: CourseMeta }>();

const institutionLabel = computed(() => props.meta.institution);

const accentStyle = computed<Record<string, string>>(() => {
  switch (props.meta.institution) {
    case 'Unichristus':
      return {
        '--course-card-accent': 'var(--md-sys-color-primary)',
        '--course-card-accent-container': 'var(--md-sys-color-primary-container)',
        '--course-card-accent-on-container': 'var(--md-sys-color-on-primary-container)',
      };
    case 'Unifametro':
      return {
        '--course-card-accent': 'var(--md-sys-color-tertiary)',
        '--course-card-accent-container': 'var(--md-sys-color-tertiary-container)',
        '--course-card-accent-on-container': 'var(--md-sys-color-on-tertiary-container)',
      };
    default:
      return {
        '--course-card-accent': 'var(--md-sys-color-secondary)',
        '--course-card-accent-container': 'var(--md-sys-color-secondary-container)',
        '--course-card-accent-on-container': 'var(--md-sys-color-on-secondary-container)',
      };
  }
});
</script>

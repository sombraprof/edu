<template>
  <router-link
    class="card card--interactive course-card flex h-full flex-col p-6"
    :to="{ name: 'course-home', params: { courseId: meta.id } }"
    :aria-label="`Acessar disciplina ${meta.title}`"
    @keydown.space.prevent="($event.target as HTMLElement).click()"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="md-stack md-stack-2">
        <h3 class="md-typescale-headline-small font-semibold text-on-surface">
          {{ meta.title }}
        </h3>
        <p
          v-if="meta.description"
          class="supporting-text md-typescale-body-medium text-on-surface-variant max-w-lg"
        >
          {{ meta.description }}
        </p>
      </div>
      <span class="badge course-card__institution" :style="badgeStyle">{{ institutionLabel }}</span>
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

const badgeStyle = computed(() => {
  switch (props.meta.institution) {
    case 'Unichristus':
      return { backgroundColor: '#d1e9ff', color: '#0b4a6f' };
    case 'Unifametro':
      return { backgroundColor: '#d5f5e3', color: '#14532d' };
    default:
      return {
        backgroundColor: 'var(--md-sys-color-secondary-container)',
        color: 'var(--md-sys-color-on-secondary-container)',
      };
  }
});
</script>

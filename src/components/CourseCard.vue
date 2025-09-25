<template>
  <router-link
    class="card card--interactive group flex h-full flex-col gap-6 p-6"
    :to="{ name: 'course-home', params: { courseId: meta.id } }"
    :aria-label="`Acessar disciplina ${meta.title}`"
    @keydown.space.prevent="($event.target as HTMLElement).click()"
  >
    <div class="flex items-start justify-between gap-4">
      <div :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-2)' }">
        <h3 class="text-headline-small font-semibold text-[var(--md-sys-color-on-surface)]">
          {{ meta.title }}
        </h3>
        <p v-if="meta.description" class="supporting-text max-w-lg">{{ meta.description }}</p>
      </div>
      <span class="badge" :style="badgeStyle">{{ institutionLabel }}</span>
    </div>
    <div
      :class="[
        'mt-auto flex w-full items-end gap-4',
        $slots.meta ? 'justify-between' : 'justify-end',
      ]"
    >
      <div
        v-if="$slots.meta"
        class="flex flex-wrap gap-2 md-sys-typescale-body-small text-[var(--md-sys-color-on-surface-variant)]"
      >
        <slot name="meta" />
      </div>
      <span
        class="inline-flex items-center gap-2 text-label-medium font-medium text-[var(--md-sys-color-on-surface-variant)] transition-all duration-150 group-hover:text-[var(--md-sys-color-primary)] group-hover:drop-shadow"
      >
        <span>Acessar disciplina</span>
        <ChevronRight
          :style="{
            height: 'var(--md-sys-icon-size-small)',
            width: 'var(--md-sys-icon-size-small)',
          }"
          class="transition-transform duration-150 group-hover:translate-x-1"
        />
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

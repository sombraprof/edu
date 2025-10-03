<template>
  <TeacherModeGate>
    <article class="pedagogical-note card md-stack md-stack-3">
      <header class="md-stack md-stack-1">
        <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
          Nota pedagógica
        </p>
        <h3 v-if="data.title" class="text-title-medium font-semibold text-on-surface">
          {{ data.title }}
        </h3>
      </header>
      <p class="text-body-medium text-on-surface">{{ data.content }}</p>
      <p v-if="data.audience" class="pedagogical-note__audience">Público: {{ audienceLabel }}</p>
    </article>
  </TeacherModeGate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TeacherModeGate from '../TeacherModeGate.vue';

export type PedagogicalNoteAudience = 'teacher' | 'student' | 'team';

export interface PedagogicalNoteBlockData {
  title?: string;
  content: string;
  audience?: PedagogicalNoteAudience;
}

const props = defineProps<{ data: PedagogicalNoteBlockData }>();

const audienceLabel = computed(() => {
  switch (props.data.audience) {
    case 'teacher':
      return 'Docentes';
    case 'team':
      return 'Equipe de apoio';
    case 'student':
      return 'Estudantes';
    default:
      return 'Docentes';
  }
});
</script>

<style scoped>
.pedagogical-note {
  border: 1px dashed var(--md-sys-color-outline);
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: var(--md-sys-color-surface-container-high);
}

.pedagogical-note__audience {
  font-size: 0.875rem;
  color: var(--md-sys-color-on-surface-variant);
}
</style>

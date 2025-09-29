<template>
  <section v-if="hasAnyList" class="lesson-readiness">
    <header class="lesson-readiness__header">
      <p class="lesson-readiness__eyebrow">Preparação</p>
      <h3 class="lesson-readiness__title">Como chegar preparado</h3>
    </header>

    <div class="lesson-readiness__lists">
      <div v-for="section in listSections" :key="section.id" class="lesson-readiness__section">
        <h4 class="lesson-readiness__section-title">{{ section.title }}</h4>
        <ul class="lesson-readiness__list" role="list">
          <li v-for="(item, index) in section.items" :key="index" class="lesson-readiness__item">
            <span class="lesson-readiness__bullet" aria-hidden="true"></span>
            <span class="lesson-readiness__item-text">{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface LessonReadinessSection {
  id: string;
  title: string;
  items: string[];
}

export interface LessonReadinessProps {
  skills?: string[];
  outcomes?: string[];
  prerequisites?: string[];
}

const props = defineProps<LessonReadinessProps>();

function normalizeEntries(entries: unknown): string[] {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  return entries
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry): entry is string => entry.length > 0);
}

const listSections = computed<LessonReadinessSection[]>(() => {
  const sections: LessonReadinessSection[] = [];

  function pushSection(id: string, title: string, source: unknown) {
    const items = normalizeEntries(source);
    if (items.length === 0) {
      return;
    }

    sections.push({ id, title, items });
  }

  pushSection('skills', 'Habilidades', props.skills);
  pushSection('outcomes', 'Resultados esperados', props.outcomes);
  pushSection('prerequisites', 'Pré-requisitos', props.prerequisites);

  return sections;
});

const hasAnyList = computed(() => listSections.value.length > 0);
</script>

<style scoped>
.lesson-readiness {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-large);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
}

.lesson-readiness__header {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.lesson-readiness__eyebrow {
  font: var(--md-sys-typescale-label-small);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.8;
}

.lesson-readiness__title {
  font: var(--md-sys-typescale-title-medium);
  font-weight: 600;
  margin: 0;
}

.lesson-readiness__lists {
  display: grid;
  gap: var(--md-sys-spacing-4);
}

@media (min-width: 48rem) {
  .lesson-readiness__lists {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.lesson-readiness__section {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.lesson-readiness__section-title {
  font: var(--md-sys-typescale-title-small);
  margin: 0;
  color: var(--md-sys-color-on-surface);
}

.lesson-readiness__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-1);
}

.lesson-readiness__item {
  display: flex;
  align-items: flex-start;
  gap: var(--md-sys-spacing-3);
}

.lesson-readiness__bullet {
  flex-shrink: 0;
  width: 0.75rem;
  height: 0.75rem;
  margin-top: 0.35rem;
  border-radius: 9999px;
  background: var(--md-sys-color-secondary);
  box-shadow: inset 0 0 0 2px var(--md-sys-color-on-secondary-container);
}

.lesson-readiness__item-text {
  flex: 1;
  font: var(--md-sys-typescale-body-medium);
}
</style>

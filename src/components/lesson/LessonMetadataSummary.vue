<template>
  <section v-if="hasAnyContent" class="lesson-metadata-summary">
    <header class="lesson-metadata-summary__header">
      <h3 class="lesson-metadata-summary__title">Resumo da aula</h3>
    </header>

    <div class="lesson-metadata-summary__grid">
      <div v-if="generalObjective" class="lesson-metadata-summary__section">
        <h4 class="lesson-metadata-summary__section-title">Objetivo geral</h4>
        <p class="lesson-metadata-summary__text">{{ generalObjective }}</p>
      </div>

      <div
        v-for="section in listSections"
        :key="section.id"
        class="lesson-metadata-summary__section"
      >
        <h4 class="lesson-metadata-summary__section-title">{{ section.title }}</h4>
        <ul class="lesson-metadata-summary__list" role="list">
          <li
            v-for="(item, index) in section.items"
            :key="index"
            class="lesson-metadata-summary__list-item"
          >
            {{ item }}
          </li>
        </ul>
      </div>

      <div v-if="resources.length" class="lesson-metadata-summary__section">
        <h4 class="lesson-metadata-summary__section-title">Recursos</h4>
        <ul class="lesson-metadata-summary__list" role="list">
          <li
            v-for="(resource, index) in resources"
            :key="index"
            class="lesson-metadata-summary__resource"
          >
            <a
              v-if="resource.url"
              class="lesson-metadata-summary__resource-link"
              :href="resource.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ resource.label }}
            </a>
            <span v-else class="lesson-metadata-summary__resource-label">{{ resource.label }}</span>
            <span v-if="resource.type" class="lesson-metadata-summary__chip">
              {{ resource.type }}
            </span>
          </li>
        </ul>
      </div>

      <div
        v-if="assessment"
        class="lesson-metadata-summary__section lesson-metadata-summary__assessment"
      >
        <h4 class="lesson-metadata-summary__section-title">Avaliação</h4>
        <div class="lesson-metadata-summary__assessment-content">
          <span v-if="assessment.type" class="lesson-metadata-summary__chip">
            {{ assessment.type }}
          </span>
          <p
            v-if="assessment.description && sanitizedAssessmentHtml"
            class="lesson-metadata-summary__assessment-description"
            v-html="sanitizedAssessmentHtml"
          ></p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

export interface LessonMetadataResource {
  label: string;
  url?: string;
  type?: string;
}

export interface LessonMetadataAssessment {
  type?: string;
  description?: string;
}

export interface LessonMetadataSummaryProps {
  generalObjective?: string;
  objectives?: string[];
  competencies?: string[];
  skills?: string[];
  outcomes?: string[];
  prerequisites?: string[];
  resources?: LessonMetadataResource[];
  assessment?: LessonMetadataAssessment;
}

const props = defineProps<LessonMetadataSummaryProps>();

interface MetadataSection {
  id: string;
  title: string;
  items: string[];
}

const generalObjective = computed(() => {
  if (typeof props.generalObjective !== 'string') {
    return '';
  }

  const value = props.generalObjective.trim();
  return value.length > 0 ? value : '';
});

const listSections = computed<MetadataSection[]>(() => {
  const sections: MetadataSection[] = [];

  function addSection(id: string, title: string, entries: unknown) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return;
    }

    const normalized = entries
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0);

    if (normalized.length === 0) {
      return;
    }

    sections.push({ id, title, items: normalized });
  }

  addSection('objectives', 'Objetivos', props.objectives);
  addSection('competencies', 'Competências', props.competencies);
  addSection('skills', 'Habilidades', props.skills);
  addSection('outcomes', 'Resultados esperados', props.outcomes);
  addSection('prerequisites', 'Pré-requisitos', props.prerequisites);

  return sections;
});

const resources = computed(() => {
  if (!Array.isArray(props.resources)) {
    return [] as LessonMetadataResource[];
  }

  return props.resources
    .map((resource) => {
      if (!resource || typeof resource !== 'object') {
        return null;
      }

      const label = typeof resource.label === 'string' ? resource.label.trim() : '';
      if (!label) {
        return null;
      }

      const normalized: LessonMetadataResource = { label };
      const url = typeof resource.url === 'string' ? resource.url.trim() : '';
      if (url) {
        normalized.url = url;
      }
      const type = typeof resource.type === 'string' ? resource.type.trim() : '';
      if (type) {
        normalized.type = type;
      }
      return normalized;
    })
    .filter((resource): resource is LessonMetadataResource => Boolean(resource));
});

const assessment = computed(() => {
  const value = props.assessment;
  if (!value || typeof value !== 'object') {
    return null;
  }

  const type = typeof value.type === 'string' ? value.type.trim() : '';
  const description = typeof value.description === 'string' ? value.description : '';

  if (!type && !description.trim()) {
    return null;
  }

  return {
    type: type || undefined,
    description: description || undefined,
  } satisfies LessonMetadataAssessment;
});

const sanitizedAssessmentHtml = computed(() => {
  if (!assessment.value || !assessment.value.description) {
    return '';
  }

  return sanitizeHtml(assessment.value.description);
});

const hasAnyContent = computed(
  () =>
    Boolean(generalObjective.value) ||
    listSections.value.length > 0 ||
    resources.value.length > 0 ||
    Boolean(assessment.value)
);
</script>

<style scoped>
.lesson-metadata-summary {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-border-radius-large);
  background: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-metadata-summary__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-metadata-summary__grid {
  display: grid;
  gap: var(--md-sys-spacing-5);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.lesson-metadata-summary__section {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
}

.lesson-metadata-summary__section-title {
  font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-metadata-summary__list {
  display: grid;
  gap: var(--md-sys-spacing-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson-metadata-summary__list-item {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.9375rem);
  line-height: 1.6;
}

.lesson-metadata-summary__text {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.9375rem);
  line-height: 1.6;
}

.lesson-metadata-summary__resource {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--md-sys-spacing-2);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.9375rem);
}

.lesson-metadata-summary__resource-link {
  color: var(--md-sys-color-primary);
  font-weight: 600;
  text-decoration: underline;
}

.lesson-metadata-summary__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font-size: var(--md-sys-typescale-label-medium-size, 0.875rem);
  font-weight: 600;
  text-transform: capitalize;
}

.lesson-metadata-summary__assessment-content {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.lesson-metadata-summary__assessment-description {
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  font-size: var(--md-sys-typescale-body-medium-size, 0.9375rem);
  line-height: 1.6;
}

.lesson-metadata-summary__assessment-description :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .lesson-metadata-summary {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

<template>
  <section v-if="hasRenderableContent" class="lesson-renderer md-stack md-stack-6">
    <LessonMetadataSummary v-if="metadataSummary" v-bind="metadataSummary" />

    <template v-for="(entry, index) in resolvedBlocks" :key="index">
      <component v-if="entry.component" :is="entry.component" v-bind="entry.props" />
      <div v-else class="prose max-w-none text-[var(--md-sys-color-on-surface-variant)]">
        <p>{{ entry.error }}</p>
      </div>
    </template>

    <BibliographyBlock v-if="bibliographyFallback" :data="bibliographyFallback" />
  </section>
  <p v-else class="prose max-w-none text-[var(--md-sys-color-on-surface-variant)]">
    Nenhum conteúdo disponível para esta aula.
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NormalizedLesson } from '@/content/schema/lesson';
import BibliographyBlock from './BibliographyBlock.vue';
import LessonMetadataSummary, {
  type LessonMetadataAssessment,
  type LessonMetadataResource,
  type LessonMetadataSummaryProps,
} from './LessonMetadataSummary.vue';
import type { LessonBlock } from './blockRegistry';
import { resolveBlock } from './blockRegistry';

type LessonContent = NormalizedLesson & { content: LessonBlock[] };

const props = defineProps<{ data: LessonContent }>();

const blocks = computed<LessonBlock[]>(() => props.data?.content ?? []);

const resolvedBlocks = computed(() => {
  return blocks.value.map((block) => {
    const resolution = resolveBlock(block);
    return {
      ...resolution,
      props: resolution.props ?? {},
      error:
        resolution.error ?? `Bloco com tipo desconhecido: ${String(block.type ?? '(sem tipo)')}.`,
    };
  });
});

const metadataSummary = computed<LessonMetadataSummaryProps | null>(() => {
  const summary: LessonMetadataSummaryProps = {};
  let hasSummary = false;

  const generalObjective = toOptionalString(props.data?.objective);
  if (generalObjective) {
    summary.generalObjective = generalObjective;
    hasSummary = true;
  }

  const objectives = toStringArray(props.data?.objectives);
  if (objectives.length) {
    summary.objectives = objectives;
    hasSummary = true;
  }

  const competencies = toStringArray(props.data?.competencies);
  if (competencies.length) {
    summary.competencies = competencies;
    hasSummary = true;
  }

  const skills = toStringArray(props.data?.skills);
  if (skills.length) {
    summary.skills = skills;
    hasSummary = true;
  }

  const outcomes = toStringArray(props.data?.outcomes);
  if (outcomes.length) {
    summary.outcomes = outcomes;
    hasSummary = true;
  }

  const prerequisites = toStringArray(props.data?.prerequisites);
  if (prerequisites.length) {
    summary.prerequisites = prerequisites;
    hasSummary = true;
  }

  const resources = normalizeResources(props.data?.resources);
  if (resources.length) {
    summary.resources = resources;
    hasSummary = true;
  }

  const assessment = normalizeAssessment(props.data?.assessment);
  if (assessment) {
    summary.assessment = assessment;
    hasSummary = true;
  }

  return hasSummary ? summary : null;
});

const hasBibliographyBlock = computed(() =>
  blocks.value.some((block) => {
    const type = getBlockType(block);
    return type === 'bibliography' || type === 'bibliographyblock';
  })
);

interface BibliographyFallbackData {
  title: string;
  items: string[];
}

const bibliographyFallback = computed<BibliographyFallbackData | null>(() => {
  const entries = normalizeBibliography(props.data?.bibliography);
  if (!entries.length || hasBibliographyBlock.value) {
    return null;
  }

  return {
    title: 'Bibliografia',
    items: entries,
  };
});

const hasRenderableContent = computed(
  () =>
    Boolean(metadataSummary.value) ||
    resolvedBlocks.value.length > 0 ||
    Boolean(bibliographyFallback.value)
);

function getBlockType(block: LessonBlock): string {
  const type = typeof block?.type === 'string' ? block.type.trim().toLowerCase() : '';
  return type;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
}

function normalizeResources(value: unknown): LessonMetadataResource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const resources: LessonMetadataResource[] = [];

  value.forEach((entry) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const label = toOptionalString((entry as Record<string, unknown>).label);
    if (!label) {
      return;
    }

    const resource: LessonMetadataResource = { label };

    const url = toOptionalString((entry as Record<string, unknown>).url);
    if (url) {
      resource.url = url;
    }

    const type = toOptionalString((entry as Record<string, unknown>).type);
    if (type) {
      resource.type = type;
    }

    resources.push(resource);
  });

  return resources;
}

function normalizeAssessment(value: unknown): LessonMetadataAssessment | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const type = toOptionalString((value as Record<string, unknown>).type);
  const rawDescription =
    typeof (value as Record<string, unknown>).description === 'string'
      ? (value as Record<string, unknown>).description
      : undefined;
  const hasDescription = typeof rawDescription === 'string' && rawDescription.trim().length > 0;

  if (!type && !hasDescription) {
    return undefined;
  }

  const assessment: LessonMetadataAssessment = {};

  if (type) {
    assessment.type = type;
  }

  if (hasDescription && rawDescription) {
    assessment.description = rawDescription;
  }

  return assessment;
}

function normalizeBibliography(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry.trim();
      }

      if (!entry || typeof entry !== 'object') {
        return '';
      }

      const html = toOptionalString((entry as Record<string, unknown>).html);
      if (html) {
        return html;
      }

      const text = toOptionalString((entry as Record<string, unknown>).text);
      return text ?? '';
    })
    .filter((entry) => entry.length > 0);
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
</script>

<style scoped>
.lesson-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-6);
}
</style>

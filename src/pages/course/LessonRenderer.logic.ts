import { computed, unref, type Component, type ComputedRef, type MaybeRef } from 'vue';
import type { NormalizedLesson } from '@/content/schema/lesson';
import type { LessonBlock } from '@/components/lesson/blockRegistry';
import { resolveBlock as resolveLessonBlock } from '@/components/lesson/blockRegistry';
import {
  type LessonMetadataAssessment,
  type LessonMetadataResource,
  type LessonMetadataSummaryProps,
} from '@/components/lesson/LessonMetadataSummary.vue';

export type LessonContent = NormalizedLesson & { content: LessonBlock[] };

export interface ResolvedLessonBlock {
  component: Component | null;
  props: Record<string, unknown>;
  uiKey?: string | null;
  error?: string;
}

export interface BibliographyFallbackData {
  title: string;
  items: string[];
}

export interface LessonRendererBindings {
  metadataSummary: ComputedRef<LessonMetadataSummaryProps | null>;
  resolvedBlocks: ComputedRef<ResolvedLessonBlock[]>;
  bibliographyFallback: ComputedRef<BibliographyFallbackData | null>;
  hasRenderableContent: ComputedRef<boolean>;
}

export function useLessonRenderer(
  data: MaybeRef<LessonContent | null | undefined>
): LessonRendererBindings {
  const lesson = computed(() => unref(data) ?? null);
  const blocks = computed(() => lesson.value?.content ?? []);

  const metadataSummary = computed(() => buildMetadataSummary(lesson.value));
  const resolvedBlocks = computed(() => resolveBlocks(blocks.value));
  const bibliographyFallback = computed(() =>
    buildBibliographyFallback(lesson.value, blocks.value)
  );

  const hasRenderableContentResult = computed(() =>
    hasRenderableContent(metadataSummary.value, resolvedBlocks.value, bibliographyFallback.value)
  );

  return {
    metadataSummary,
    resolvedBlocks,
    bibliographyFallback,
    hasRenderableContent: hasRenderableContentResult,
  };
}

export function resolveBlocks(blocks: LessonBlock[]): ResolvedLessonBlock[] {
  return blocks.map((block) => {
    const resolution = resolveLessonBlock(block);
    const blockRecord = (block ?? {}) as Record<string, unknown>;
    const uiKey = typeof blockRecord?.__uiKey === 'string' ? (blockRecord.__uiKey as string) : null;
    return {
      component: resolution.component,
      props: { ...(resolution.props ?? {}) },
      uiKey,
      error:
        resolution.error ?? `Bloco com tipo desconhecido: ${String(block.type ?? '(sem tipo)')}.`,
    };
  });
}

export function buildMetadataSummary(
  lesson: NormalizedLesson | null | undefined
): LessonMetadataSummaryProps | null {
  if (!lesson || typeof lesson !== 'object') {
    return null;
  }

  const summary: LessonMetadataSummaryProps = {};
  let hasSummary = false;

  const generalObjective = toOptionalString((lesson as Record<string, unknown>).objective);
  if (generalObjective) {
    summary.generalObjective = generalObjective;
    hasSummary = true;
  }

  const objectives = toStringArray((lesson as Record<string, unknown>).objectives);
  if (objectives.length) {
    summary.objectives = objectives;
    hasSummary = true;
  }

  const competencies = toStringArray((lesson as Record<string, unknown>).competencies);
  if (competencies.length) {
    summary.competencies = competencies;
    hasSummary = true;
  }

  const skills = toStringArray((lesson as Record<string, unknown>).skills);
  if (skills.length) {
    summary.skills = skills;
    hasSummary = true;
  }

  const outcomes = toStringArray((lesson as Record<string, unknown>).outcomes);
  if (outcomes.length) {
    summary.outcomes = outcomes;
    hasSummary = true;
  }

  const prerequisites = toStringArray((lesson as Record<string, unknown>).prerequisites);
  if (prerequisites.length) {
    summary.prerequisites = prerequisites;
    hasSummary = true;
  }

  const resources = normalizeResources((lesson as Record<string, unknown>).resources);
  if (resources.length) {
    summary.resources = resources;
    hasSummary = true;
  }

  const assessment = normalizeAssessment((lesson as Record<string, unknown>).assessment);
  if (assessment) {
    summary.assessment = assessment;
    hasSummary = true;
  }

  return hasSummary ? summary : null;
}

export function hasRenderableContent(
  metadataSummary: LessonMetadataSummaryProps | null,
  blocks: ResolvedLessonBlock[],
  bibliographyFallback: BibliographyFallbackData | null
): boolean {
  return Boolean(metadataSummary) || blocks.length > 0 || Boolean(bibliographyFallback);
}

function buildBibliographyFallback(
  lesson: NormalizedLesson | null,
  blocks: LessonBlock[]
): BibliographyFallbackData | null {
  if (!lesson || typeof lesson !== 'object') {
    return null;
  }

  if (hasBibliographyBlock(blocks)) {
    return null;
  }

  const entries = normalizeBibliography((lesson as Record<string, unknown>).bibliography);
  if (!entries.length) {
    return null;
  }

  return {
    title: 'Bibliografia',
    items: entries,
  };
}

function hasBibliographyBlock(blocks: LessonBlock[]): boolean {
  return blocks.some((block) => {
    const type = getBlockType(block);
    return type === 'bibliography' || type === 'bibliographyblock';
  });
}

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

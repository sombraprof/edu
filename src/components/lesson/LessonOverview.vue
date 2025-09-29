<template>
  <section
    v-if="hasContent"
    class="lesson-overview md-stack md-stack-3"
    aria-label="Resumo da aula"
  >
    <p v-if="normalizedSummary" class="lesson-overview__summary text-body-large">
      {{ normalizedSummary }}
    </p>

    <div v-if="hasMetadata" class="lesson-overview__meta" role="list">
      <span
        v-if="durationLabel"
        class="lesson-overview__chip"
        data-testid="lesson-overview-duration"
        role="listitem"
      >
        {{ durationLabel }}
      </span>
      <span
        v-if="modalityLabel"
        class="lesson-overview__chip"
        data-testid="lesson-overview-modality"
        role="listitem"
      >
        {{ modalityLabel }}
      </span>
      <span
        v-for="tag in normalizedTags"
        :key="tag"
        class="lesson-overview__chip lesson-overview__chip--tag"
        data-testid="lesson-overview-tag"
        role="listitem"
      >
        {{ tag }}
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const MODALITY_LABELS: Record<string, string> = {
  'in-person': 'Presencial',
  remote: 'Remota',
  hybrid: 'Híbrida',
  async: 'Assíncrona',
};

interface LessonOverviewProps {
  summary?: string;
  duration?: number;
  modality?: string;
  tags?: string[];
}

const props = defineProps<LessonOverviewProps>();

const normalizedSummary = computed(() => cleanString(props.summary));
const normalizedTags = computed(() => normalizeTags(props.tags));
const durationLabel = computed(() => formatDuration(props.duration));
const modalityLabel = computed(() => formatModality(props.modality));
const hasMetadata = computed(() =>
  Boolean(durationLabel.value || modalityLabel.value || normalizedTags.value.length)
);
const hasContent = computed(() => Boolean(normalizedSummary.value || hasMetadata.value));

function cleanString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : '';
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const raw of value) {
    const tag = cleanString(raw);
    if (!tag) {
      continue;
    }
    const key = tag.toLocaleLowerCase('pt-BR');
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    tags.push(tag);
  }

  return tags;
}

function formatDuration(value: unknown): string {
  if (typeof value !== 'number') {
    return '';
  }

  if (!Number.isFinite(value) || value <= 0) {
    return '';
  }

  // Assume minutes when the value is larger than 12 (typical maximum of in-class hours).
  if (value > 12) {
    const totalMinutes = Math.round(value);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours && minutes) {
      return `${hours} h ${minutes} min`;
    }
    if (hours) {
      return `${hours} h`;
    }
    return `${totalMinutes} min`;
  }

  if (value < 1) {
    return `${Math.round(value * 60)} min`;
  }

  if (Number.isInteger(value)) {
    return `${value} h`;
  }

  return `${value.toFixed(1)} h`;
}

function formatModality(value: unknown): string {
  const normalized = cleanString(value);
  if (!normalized) {
    return '';
  }

  const key = normalized.toLocaleLowerCase('pt-BR');
  return MODALITY_LABELS[key] ?? normalized;
}
</script>

<style scoped>
.lesson-overview {
  gap: var(--md-sys-spacing-3);
}

.lesson-overview__summary {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-overview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
  row-gap: var(--md-sys-spacing-2);
}

.lesson-overview__chip {
  display: inline-flex;
  align-items: center;
  padding-inline: var(--md-sys-spacing-3);
  padding-block: calc(var(--md-sys-spacing-1) * 0.75);
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-surface-variant) 75%, transparent);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  font-family: var(--md-sys-typescale-font);
  font-size: var(--md-sys-typescale-label-medium-size);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  font-weight: 500;
}

.lesson-overview__chip--tag {
  background: color-mix(in srgb, var(--md-sys-color-surface) 86%, transparent);
}

:global(html[data-theme='dark']) .lesson-overview__chip {
  background: color-mix(in srgb, var(--md-sys-color-surface-variant) 55%, transparent);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
}

:global(html[data-theme='dark']) .lesson-overview__chip--tag {
  background: color-mix(in srgb, var(--md-sys-color-surface) 65%, transparent);
}
</style>

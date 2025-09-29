<template>
  <section
    class="pipeline-canvas card md-stack"
    role="group"
    :aria-label="title ?? 'Pipeline de produção'"
  >
    <header v-if="title || summary" class="pipeline-canvas__header md-stack">
      <h3
        v-if="title"
        class="pipeline-canvas__title text-title-medium font-semibold text-on-surface"
      >
        {{ title }}
      </h3>
      <p v-if="summary" class="pipeline-canvas__summary supporting-text">
        {{ summary }}
      </p>
    </header>

    <div class="pipeline-canvas__stages" role="list">
      <article
        v-for="stage in normalizedStages"
        :key="stage.id"
        class="pipeline-canvas__stage md-surface"
        role="listitem"
        :aria-labelledby="`${stage.id}-title`"
        :data-status="stage.status"
      >
        <header class="pipeline-canvas__stage-header">
          <div class="pipeline-canvas__stage-heading">
            <h4
              :id="`${stage.id}-title`"
              class="pipeline-canvas__stage-title text-title-small font-semibold"
            >
              {{ stage.title }}
            </h4>
            <span v-if="stage.status" class="pipeline-canvas__status" :data-status="stage.status">
              {{ stage.statusLabel }}
            </span>
          </div>
          <p v-if="stage.summary" class="pipeline-canvas__stage-summary supporting-text">
            {{ stage.summary }}
          </p>
          <div
            v-if="stage.owners.length || stage.durationHours"
            class="pipeline-canvas__stage-meta supporting-text"
          >
            <span v-if="stage.durationHours" class="pipeline-canvas__duration">
              {{ stage.durationLabel }}
            </span>
            <ul v-if="stage.owners.length" class="pipeline-canvas__owners" role="list">
              <li
                v-for="owner in stage.owners"
                :key="owner"
                class="pipeline-canvas__owner"
                role="listitem"
              >
                {{ owner }}
              </li>
            </ul>
          </div>
        </header>

        <section
          v-if="stage.activities.length"
          class="pipeline-canvas__section"
          aria-label="Atividades"
          role="list"
        >
          <h5 class="pipeline-canvas__section-title text-label-large font-semibold">
            Atividades chave
          </h5>
          <ul class="pipeline-canvas__items" role="list">
            <li
              v-for="activity in stage.activities"
              :key="activity.id"
              class="pipeline-canvas__item"
              role="listitem"
            >
              <p class="pipeline-canvas__item-label text-body-medium">{{ activity.label }}</p>
              <p
                v-if="activity.description"
                class="pipeline-canvas__item-description supporting-text"
              >
                {{ activity.description }}
              </p>
              <p v-if="activity.role" class="pipeline-canvas__item-role supporting-text">
                Responsável: {{ activity.role }}
              </p>
            </li>
          </ul>
        </section>

        <section
          v-if="stage.deliverables.length"
          class="pipeline-canvas__section"
          aria-label="Entregáveis"
          role="list"
        >
          <h5 class="pipeline-canvas__section-title text-label-large font-semibold">Entregáveis</h5>
          <ul class="pipeline-canvas__items" role="list">
            <li
              v-for="deliverable in stage.deliverables"
              :key="deliverable.id"
              class="pipeline-canvas__item"
              role="listitem"
            >
              <p class="pipeline-canvas__item-label text-body-medium">{{ deliverable.label }}</p>
              <p
                v-if="deliverable.description"
                class="pipeline-canvas__item-description supporting-text"
              >
                {{ deliverable.description }}
              </p>
              <p v-if="deliverable.evidence" class="pipeline-canvas__item-role supporting-text">
                Evidência: {{ deliverable.evidence }}
              </p>
            </li>
          </ul>
        </section>

        <section
          v-if="stage.risks.length"
          class="pipeline-canvas__section"
          aria-label="Riscos"
          role="list"
        >
          <h5 class="pipeline-canvas__section-title text-label-large font-semibold">
            Riscos monitorados
          </h5>
          <ul class="pipeline-canvas__items" role="list">
            <li
              v-for="risk in stage.risks"
              :key="risk.id"
              class="pipeline-canvas__item"
              role="listitem"
            >
              <p class="pipeline-canvas__item-label text-body-medium">
                {{ risk.label }}
                <span
                  v-if="risk.severityLabel"
                  class="pipeline-canvas__risk"
                  :data-severity="risk.severity"
                >
                  {{ risk.severityLabel }}
                </span>
              </p>
              <p v-if="risk.mitigation" class="pipeline-canvas__item-description supporting-text">
                Mitigação: {{ risk.mitigation }}
              </p>
            </li>
          </ul>
        </section>

        <section
          v-if="stage.checkpoints.length"
          class="pipeline-canvas__section"
          aria-label="Checkpoints"
          role="list"
        >
          <h5 class="pipeline-canvas__section-title text-label-large font-semibold">Checkpoints</h5>
          <ul class="pipeline-canvas__chips" role="list">
            <li
              v-for="checkpoint in stage.checkpoints"
              :key="checkpoint"
              class="pipeline-canvas__chip"
              role="listitem"
            >
              {{ checkpoint }}
            </li>
          </ul>
        </section>
      </article>
    </div>

    <section
      v-if="normalizedMilestones.length"
      class="pipeline-canvas__milestones md-stack"
      aria-label="Marcos"
      role="list"
    >
      <article
        v-for="milestone in normalizedMilestones"
        :key="milestone.id"
        class="pipeline-canvas__milestone"
        role="listitem"
      >
        <header class="pipeline-canvas__milestone-header">
          <h4 class="pipeline-canvas__milestone-title text-title-small font-semibold">
            {{ milestone.title }}
          </h4>
          <p v-if="milestone.due" class="pipeline-canvas__milestone-date supporting-text">
            {{ milestone.dueLabel }}
          </p>
        </header>
        <p
          v-if="milestone.description"
          class="pipeline-canvas__milestone-description supporting-text"
        >
          {{ milestone.description }}
        </p>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface PipelineActivity {
  id: string;
  label: string;
  description?: string;
  role?: string;
}

interface PipelineDeliverable {
  id: string;
  label: string;
  description?: string;
  evidence?: string;
}

interface PipelineRisk {
  id: string;
  label: string;
  severity?: 'low' | 'medium' | 'high';
  mitigation?: string;
}

interface PipelineStage {
  id: string;
  title: string;
  summary?: string;
  status?: 'not-started' | 'in-progress' | 'blocked' | 'done';
  owners?: string[];
  durationHours?: number;
  activities?: PipelineActivity[];
  deliverables?: PipelineDeliverable[];
  risks?: PipelineRisk[];
  checkpoints?: string[];
}

interface PipelineMilestone {
  id: string;
  title: string;
  description?: string;
  due?: string;
}

interface PipelineCanvasProps {
  title?: string;
  summary?: string;
  stages: PipelineStage[];
  milestones?: PipelineMilestone[];
}

const props = withDefaults(defineProps<PipelineCanvasProps>(), {
  stages: () => [],
  milestones: () => [],
  title: undefined,
  summary: undefined,
});

type NormalizedActivity = PipelineActivity & { description?: string; role?: string };
type NormalizedDeliverable = PipelineDeliverable & { description?: string; evidence?: string };
type NormalizedRisk = PipelineRisk & { severityLabel?: string; mitigation?: string };
type NormalizedStage = {
  id: string;
  title: string;
  summary?: string;
  status?: PipelineStage['status'];
  statusLabel?: string;
  owners: string[];
  durationHours?: number;
  durationLabel?: string;
  activities: NormalizedActivity[];
  deliverables: NormalizedDeliverable[];
  risks: NormalizedRisk[];
  checkpoints: string[];
};

type NormalizedMilestone = {
  id: string;
  title: string;
  description?: string;
  due?: string;
  dueLabel?: string;
};

const statusLabelMap: Record<NonNullable<PipelineStage['status']>, string> = {
  'not-started': 'Não iniciado',
  'in-progress': 'Em andamento',
  blocked: 'Bloqueado',
  done: 'Concluído',
};

const severityLabelMap: Record<NonNullable<PipelineRisk['severity']>, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
};

const normalizedStages = computed<NormalizedStage[]>(() =>
  props.stages
    .map((stage) => ({
      id: stage.id,
      title: stage.title,
      summary: cleanString(stage.summary) || undefined,
      status: stage.status,
      statusLabel: stage.status ? statusLabelMap[stage.status] : undefined,
      owners: normalizeStrings(stage.owners),
      durationHours: normalizeDuration(stage.durationHours),
      durationLabel: formatDuration(stage.durationHours),
      activities: normalizeActivities(stage.activities),
      deliverables: normalizeDeliverables(stage.deliverables),
      risks: normalizeRisks(stage.risks),
      checkpoints: normalizeStrings(stage.checkpoints),
    }))
    .filter((stage) => stage.id && stage.title)
);

const normalizedMilestones = computed<NormalizedMilestone[]>(() =>
  props.milestones
    .map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description: cleanString(milestone.description) || undefined,
      due: cleanString(milestone.due) || undefined,
      dueLabel: formatDate(cleanString(milestone.due)),
    }))
    .filter((milestone) => milestone.id && milestone.title)
);

function normalizeActivities(activities: PipelineActivity[] | undefined): NormalizedActivity[] {
  if (!Array.isArray(activities)) {
    return [];
  }
  return activities
    .map((activity, index) => ({
      id: activity.id ?? `activity-${index}`,
      label: activity.label,
      description: cleanString(activity.description) || undefined,
      role: cleanString(activity.role) || undefined,
    }))
    .filter((activity) => activity.id && cleanString(activity.label));
}

function normalizeDeliverables(
  deliverables: PipelineDeliverable[] | undefined
): NormalizedDeliverable[] {
  if (!Array.isArray(deliverables)) {
    return [];
  }
  return deliverables
    .map((deliverable, index) => ({
      id: deliverable.id ?? `deliverable-${index}`,
      label: deliverable.label,
      description: cleanString(deliverable.description) || undefined,
      evidence: cleanString(deliverable.evidence) || undefined,
    }))
    .filter((deliverable) => deliverable.id && cleanString(deliverable.label));
}

function normalizeRisks(risks: PipelineRisk[] | undefined): NormalizedRisk[] {
  if (!Array.isArray(risks)) {
    return [];
  }
  return risks
    .map((risk, index) => ({
      id: risk.id ?? `risk-${index}`,
      label: risk.label,
      severity: risk.severity,
      severityLabel: risk.severity ? severityLabelMap[risk.severity] : undefined,
      mitigation: cleanString(risk.mitigation) || undefined,
    }))
    .filter((risk) => risk.id && cleanString(risk.label));
}

function normalizeStrings(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map((value) => cleanString(value))
    .filter((value): value is string => Boolean(value));
}

function normalizeDuration(value: number | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  return undefined;
}

function formatDuration(value: number | undefined): string | undefined {
  const normalized = normalizeDuration(value);
  if (!normalized) {
    return undefined;
  }
  if (normalized < 1) {
    return `${Math.round(normalized * 60)} min`;
  }
  if (Number.isInteger(normalized)) {
    return `${normalized} h`;
  }
  return `${normalized.toFixed(1)} h`;
}

function formatDate(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function cleanString(value: string | undefined | null): string {
  return typeof value === 'string' ? value.trim() : '';
}
</script>

<style scoped>
.pipeline-canvas {
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-border-radius-3xl);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-high) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 65%, transparent);
  gap: var(--md-sys-spacing-6);
}

.pipeline-canvas__header {
  gap: var(--md-sys-spacing-2);
}

.pipeline-canvas__title {
  margin: 0;
}

.pipeline-canvas__summary {
  margin: 0;
}

.pipeline-canvas__stages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: var(--md-sys-spacing-5);
}

.pipeline-canvas__stage {
  display: grid;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-2xl);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--shadow-elevation-1);
  transition: box-shadow 160ms ease;
}

.pipeline-canvas__stage:hover,
.pipeline-canvas__stage:focus-within {
  box-shadow: var(--shadow-elevation-2);
}

.pipeline-canvas__stage-header {
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.pipeline-canvas__stage-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--md-sys-spacing-3);
}

.pipeline-canvas__stage-title {
  margin: 0;
}

.pipeline-canvas__status {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.75rem;
  border-radius: 999px;
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: 600;
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  background: color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
  color: var(--md-sys-color-on-surface);
}

.pipeline-canvas__status[data-status='in-progress'] {
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 60%, transparent);
  color: var(--md-sys-color-on-primary-container);
}

.pipeline-canvas__status[data-status='blocked'] {
  background: color-mix(in srgb, var(--md-sys-color-error-container) 70%, transparent);
  color: var(--md-sys-color-on-error-container);
}

.pipeline-canvas__status[data-status='done'] {
  background: color-mix(in srgb, var(--md-sys-color-tertiary-container) 65%, transparent);
  color: var(--md-sys-color-on-tertiary-container);
}

.pipeline-canvas__stage-summary {
  margin: 0;
}

.pipeline-canvas__stage-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
  align-items: center;
  margin: 0;
}

.pipeline-canvas__owners {
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
}

.pipeline-canvas__owner {
  padding: 0.125rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-secondary-container) 55%, transparent);
  color: var(--md-sys-color-on-secondary-container);
}

.pipeline-canvas__section {
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.pipeline-canvas__section-title {
  margin: 0;
}

.pipeline-canvas__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.pipeline-canvas__item {
  display: grid;
  gap: 0.25rem;
  padding: var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-large);
  background: color-mix(in srgb, var(--md-sys-color-surface-variant) 35%, transparent);
}

.pipeline-canvas__item-label {
  margin: 0;
}

.pipeline-canvas__item-description,
.pipeline-canvas__item-role {
  margin: 0;
}

.pipeline-canvas__risk {
  display: inline-flex;
  align-items: center;
  margin-left: var(--md-sys-spacing-2);
  padding: 0 0.5rem;
  border-radius: 999px;
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: 600;
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  background: color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
}

.pipeline-canvas__risk[data-severity='high'] {
  background: color-mix(in srgb, var(--md-sys-color-error) 45%, transparent);
  color: var(--md-sys-color-on-error);
}

.pipeline-canvas__risk[data-severity='medium'] {
  background: color-mix(in srgb, var(--md-sys-color-tertiary) 35%, transparent);
  color: var(--md-sys-color-on-tertiary);
}

.pipeline-canvas__risk[data-severity='low'] {
  background: color-mix(in srgb, var(--md-sys-color-secondary) 30%, transparent);
  color: var(--md-sys-color-on-secondary);
}

.pipeline-canvas__chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
}

.pipeline-canvas__chip {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 40%, transparent);
  color: var(--md-sys-color-on-primary-container);
}

.pipeline-canvas__milestones {
  gap: var(--md-sys-spacing-3);
}

.pipeline-canvas__milestone {
  border-radius: var(--md-sys-border-radius-2xl);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  padding: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-2);
  background: var(--md-sys-color-surface);
}

.pipeline-canvas__milestone-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--md-sys-spacing-3);
}

.pipeline-canvas__milestone-title,
.pipeline-canvas__milestone-date,
.pipeline-canvas__milestone-description {
  margin: 0;
}

@media (max-width: 640px) {
  .pipeline-canvas {
    padding: var(--md-sys-spacing-4);
  }

  .pipeline-canvas__stage {
    padding: var(--md-sys-spacing-4);
  }
}
</style>

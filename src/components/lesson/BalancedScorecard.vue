<template>
  <section
    class="balanced-scorecard card md-stack"
    role="group"
    :aria-label="title ?? 'Balanced Scorecard'"
  >
    <header v-if="title || summary" class="balanced-scorecard__header md-stack">
      <h3
        v-if="title"
        class="balanced-scorecard__title text-title-medium font-semibold text-on-surface"
      >
        {{ title }}
      </h3>
      <p v-if="summary" class="balanced-scorecard__summary supporting-text">
        {{ summary }}
      </p>
    </header>

    <div class="balanced-scorecard__grid">
      <article
        v-for="entry in groupedPerspectives"
        :key="entry.perspective.id"
        class="balanced-scorecard__perspective md-stack"
        role="region"
        :aria-labelledby="`${entry.perspective.id}-title`"
        :data-tone="entry.perspective.tone ?? undefined"
      >
        <header class="balanced-scorecard__perspective-header md-stack">
          <p
            class="balanced-scorecard__perspective-badge text-label-large font-semibold"
            aria-hidden="true"
          >
            {{ perspectiveBadge(entry.perspective) }}
          </p>
          <div class="balanced-scorecard__perspective-heading">
            <h4
              :id="`${entry.perspective.id}-title`"
              class="balanced-scorecard__perspective-title text-title-small font-semibold"
            >
              {{ entry.perspective.title }}
            </h4>
            <p
              v-if="entry.perspective.summary"
              class="balanced-scorecard__perspective-summary supporting-text"
            >
              {{ entry.perspective.summary }}
            </p>
          </div>
        </header>

        <ul v-if="entry.objectives.length" class="balanced-scorecard__objectives" role="list">
          <li
            v-for="objective in entry.objectives"
            :key="objective.id"
            class="balanced-scorecard__objective md-stack"
            role="listitem"
          >
            <header class="balanced-scorecard__objective-header">
              <h5 class="balanced-scorecard__objective-title text-title-small font-semibold">
                {{ objective.title }}
              </h5>
              <p v-if="objective.owner" class="balanced-scorecard__objective-owner supporting-text">
                Responsável: {{ objective.owner }}
              </p>
            </header>
            <p
              v-if="objective.summary"
              class="balanced-scorecard__objective-summary supporting-text"
            >
              {{ objective.summary }}
            </p>
            <ul
              v-if="objective.initiatives?.length"
              class="balanced-scorecard__initiatives"
              role="list"
              aria-label="Iniciativas do objetivo"
            >
              <li
                v-for="initiative in objective.initiatives"
                :key="initiative"
                class="balanced-scorecard__initiative supporting-text"
                role="listitem"
              >
                {{ initiative }}
              </li>
            </ul>
            <section
              v-if="objective.indicators.length"
              class="balanced-scorecard__indicator-section md-stack"
              aria-label="Indicadores associados"
            >
              <article
                v-for="indicator in objective.indicators"
                :key="indicator.id"
                class="balanced-scorecard__indicator"
                :data-status="indicator.status ?? undefined"
              >
                <header class="balanced-scorecard__indicator-header">
                  <h6 class="balanced-scorecard__indicator-title text-title-small font-semibold">
                    {{ indicator.title }}
                  </h6>
                  <span
                    v-if="indicator.status"
                    class="balanced-scorecard__indicator-status text-label-small font-semibold"
                  >
                    {{ statusLabel(indicator.status) }}
                  </span>
                </header>
                <p
                  v-if="indicator.summary"
                  class="balanced-scorecard__indicator-summary supporting-text"
                >
                  {{ indicator.summary }}
                </p>
                <dl class="balanced-scorecard__indicator-metrics">
                  <div v-if="indicator.target" class="balanced-scorecard__metric">
                    <dt class="text-label-small font-semibold">Meta</dt>
                    <dd class="text-body-medium">{{ indicator.target }}</dd>
                  </div>
                  <div v-if="indicator.current" class="balanced-scorecard__metric">
                    <dt class="text-label-small font-semibold">Atual</dt>
                    <dd class="text-body-medium">{{ indicator.current }}</dd>
                  </div>
                  <div v-if="indicator.frequency" class="balanced-scorecard__metric">
                    <dt class="text-label-small font-semibold">Frequência</dt>
                    <dd class="text-body-medium">{{ indicator.frequency }}</dd>
                  </div>
                  <div v-if="indicator.owner" class="balanced-scorecard__metric">
                    <dt class="text-label-small font-semibold">Responsável</dt>
                    <dd class="text-body-medium">{{ indicator.owner }}</dd>
                  </div>
                  <div v-if="indicator.baseline" class="balanced-scorecard__metric">
                    <dt class="text-label-small font-semibold">Base</dt>
                    <dd class="text-body-medium">{{ indicator.baseline }}</dd>
                  </div>
                </dl>
              </article>
            </section>
          </li>
        </ul>

        <section
          v-if="entry.standaloneIndicators.length"
          class="balanced-scorecard__indicator-section md-stack"
          aria-label="Indicadores globais da perspectiva"
        >
          <article
            v-for="indicator in entry.standaloneIndicators"
            :key="indicator.id"
            class="balanced-scorecard__indicator"
            :data-status="indicator.status ?? undefined"
          >
            <header class="balanced-scorecard__indicator-header">
              <h6 class="balanced-scorecard__indicator-title text-title-small font-semibold">
                {{ indicator.title }}
              </h6>
              <span
                v-if="indicator.status"
                class="balanced-scorecard__indicator-status text-label-small font-semibold"
              >
                {{ statusLabel(indicator.status) }}
              </span>
            </header>
            <p
              v-if="indicator.summary"
              class="balanced-scorecard__indicator-summary supporting-text"
            >
              {{ indicator.summary }}
            </p>
            <dl class="balanced-scorecard__indicator-metrics">
              <div v-if="indicator.target" class="balanced-scorecard__metric">
                <dt class="text-label-small font-semibold">Meta</dt>
                <dd class="text-body-medium">{{ indicator.target }}</dd>
              </div>
              <div v-if="indicator.current" class="balanced-scorecard__metric">
                <dt class="text-label-small font-semibold">Atual</dt>
                <dd class="text-body-medium">{{ indicator.current }}</dd>
              </div>
              <div v-if="indicator.frequency" class="balanced-scorecard__metric">
                <dt class="text-label-small font-semibold">Frequência</dt>
                <dd class="text-body-medium">{{ indicator.frequency }}</dd>
              </div>
              <div v-if="indicator.owner" class="balanced-scorecard__metric">
                <dt class="text-label-small font-semibold">Responsável</dt>
                <dd class="text-body-medium">{{ indicator.owner }}</dd>
              </div>
              <div v-if="indicator.baseline" class="balanced-scorecard__metric">
                <dt class="text-label-small font-semibold">Base</dt>
                <dd class="text-body-medium">{{ indicator.baseline }}</dd>
              </div>
            </dl>
          </article>
        </section>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type BalancedScorecardTone = 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';

type BalancedScorecardIndicatorStatus =
  | 'on-track'
  | 'at-risk'
  | 'off-track'
  | 'achieved'
  | 'not-started';

interface BalancedScorecardPerspective {
  id: string;
  title: string;
  summary?: string;
  tone?: BalancedScorecardTone;
  badge?: string;
}

interface BalancedScorecardObjective {
  id: string;
  perspectiveId: string;
  title: string;
  summary?: string;
  owner?: string;
  initiatives?: string[];
  indicatorIds?: string[];
}

interface BalancedScorecardIndicator {
  id: string;
  title: string;
  summary?: string;
  perspectiveId?: string;
  objectiveId?: string;
  target?: string;
  current?: string;
  baseline?: string;
  frequency?: string;
  owner?: string;
  status?: BalancedScorecardIndicatorStatus;
}

interface BalancedScorecardProps {
  title?: string;
  summary?: string;
  perspectives: BalancedScorecardPerspective[];
  objectives: BalancedScorecardObjective[];
  indicators: BalancedScorecardIndicator[];
}

const props = withDefaults(defineProps<BalancedScorecardProps>(), {
  title: undefined,
  summary: undefined,
  perspectives: () => [],
  objectives: () => [],
  indicators: () => [],
});

const indicatorMap = computed(
  () => new Map(props.indicators.map((indicator) => [indicator.id, indicator]))
);

const objectivesByPerspective = computed(() => {
  const map = new Map<
    string,
    Array<BalancedScorecardObjective & { indicators: BalancedScorecardIndicator[] }>
  >();

  props.objectives.forEach((objective) => {
    const perspectiveId = objective.perspectiveId;
    if (!perspectiveId) {
      return;
    }

    const indicators = collectIndicatorsForObjective(objective);
    const enriched = { ...objective, indicators };
    const list = map.get(perspectiveId);
    if (list) {
      list.push(enriched);
    } else {
      map.set(perspectiveId, [enriched]);
    }
  });

  return map;
});

const standaloneIndicatorsByPerspective = computed(() => {
  const map = new Map<string, BalancedScorecardIndicator[]>();

  props.indicators.forEach((indicator) => {
    if (indicator.objectiveId) {
      return;
    }

    const perspectiveId = indicator.perspectiveId;
    if (!perspectiveId) {
      return;
    }

    const list = map.get(perspectiveId);
    if (list) {
      list.push(indicator);
    } else {
      map.set(perspectiveId, [indicator]);
    }
  });

  return map;
});

const groupedPerspectives = computed(() =>
  props.perspectives.map((perspective) => ({
    perspective,
    objectives: objectivesByPerspective.value.get(perspective.id) ?? [],
    standaloneIndicators: standaloneIndicatorsByPerspective.value.get(perspective.id) ?? [],
  }))
);

function collectIndicatorsForObjective(
  objective: BalancedScorecardObjective
): BalancedScorecardIndicator[] {
  const indicators: BalancedScorecardIndicator[] = [];

  if (objective.indicatorIds?.length) {
    objective.indicatorIds.forEach((id) => {
      const indicator = indicatorMap.value.get(id);
      if (indicator) {
        indicators.push(indicator);
      }
    });
  }

  if (!objective.indicatorIds || objective.indicatorIds.length === 0) {
    props.indicators.forEach((indicator) => {
      if (indicator.objectiveId === objective.id) {
        indicators.push(indicator);
      }
    });
  }

  return indicators;
}

function statusLabel(status: BalancedScorecardIndicatorStatus): string {
  switch (status) {
    case 'on-track':
      return 'No ritmo';
    case 'at-risk':
      return 'Atenção';
    case 'off-track':
      return 'Crítico';
    case 'achieved':
      return 'Atingido';
    case 'not-started':
      return 'Não iniciado';
    default:
      return status;
  }
}

function perspectiveBadge(perspective: BalancedScorecardPerspective): string {
  if (perspective.badge) {
    return perspective.badge;
  }

  return `Perspectiva`;
}
</script>

<style scoped>
.balanced-scorecard {
  gap: var(--md-sys-spacing-6);
  padding: var(--md-sys-spacing-6);
}

.balanced-scorecard__header {
  gap: var(--md-sys-spacing-2);
}

.balanced-scorecard__summary {
  margin: 0;
}

.balanced-scorecard__grid {
  display: grid;
  gap: var(--md-sys-spacing-5);
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
}

.balanced-scorecard__perspective {
  position: relative;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-shape-corner-extra-large, var(--md-sys-border-radius-large));
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-high, var(--md-sys-color-surface)) 80%,
    transparent
  );
  border: 1px solid
    color-mix(
      in srgb,
      var(--md-sys-color-outline-variant, var(--md-sys-color-outline)) 65%,
      transparent
    );
  box-shadow: var(--md-sys-elevation-level1);
}

.balanced-scorecard__perspective::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  border: 2px solid transparent;
}

.balanced-scorecard__perspective[data-tone='primary']::before {
  border-color: color-mix(in srgb, var(--md-sys-color-primary) 60%, transparent);
}

.balanced-scorecard__perspective[data-tone='success']::before {
  border-color: color-mix(in srgb, var(--md-sys-color-tertiary) 60%, transparent);
}

.balanced-scorecard__perspective[data-tone='warning']::before {
  border-color: color-mix(in srgb, var(--md-sys-color-secondary) 60%, transparent);
}

.balanced-scorecard__perspective[data-tone='info']::before {
  border-color: color-mix(in srgb, var(--md-sys-color-secondary) 50%, transparent);
}

.balanced-scorecard__perspective[data-tone='danger']::before {
  border-color: color-mix(in srgb, var(--md-sys-color-error) 60%, transparent);
}

.balanced-scorecard__perspective-header {
  gap: var(--md-sys-spacing-2);
}

.balanced-scorecard__perspective-badge {
  margin: 0;
  color: color-mix(in srgb, var(--md-sys-color-primary) 80%, var(--md-sys-color-on-surface));
}

.balanced-scorecard__perspective-title {
  margin: 0;
}

.balanced-scorecard__perspective-summary {
  margin: 0;
}

.balanced-scorecard__objectives {
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--md-sys-spacing-4);
  list-style: none;
}

.balanced-scorecard__objective {
  gap: var(--md-sys-spacing-3);
  padding: var(--md-sys-spacing-4);
  border-radius: var(--md-sys-shape-corner-large, var(--md-sys-border-radius-medium));
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface-container, var(--md-sys-color-surface)) 85%,
    transparent
  );
  border-left: 4px solid color-mix(in srgb, var(--md-sys-color-primary) 70%, transparent);
}

.balanced-scorecard__objective-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--md-sys-spacing-2);
}

.balanced-scorecard__objective-title {
  margin: 0;
}

.balanced-scorecard__objective-owner {
  margin: 0;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 80%, transparent);
}

.balanced-scorecard__objective-summary {
  margin: 0;
}

.balanced-scorecard__initiatives {
  margin: 0;
  padding-left: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.balanced-scorecard__initiative {
  margin: 0;
}

.balanced-scorecard__indicator-section {
  gap: var(--md-sys-spacing-3);
}

.balanced-scorecard__indicator {
  padding: var(--md-sys-spacing-4);
  border-radius: var(--md-sys-shape-corner-large, var(--md-sys-border-radius-medium));
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-highest, var(--md-sys-color-surface)) 85%,
    transparent
  );
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 70%, transparent);
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.balanced-scorecard__indicator[data-status='on-track'] {
  border-color: color-mix(in srgb, var(--md-sys-color-tertiary) 60%, transparent);
}

.balanced-scorecard__indicator[data-status='at-risk'] {
  border-color: color-mix(in srgb, var(--md-sys-color-secondary) 60%, transparent);
}

.balanced-scorecard__indicator[data-status='off-track'] {
  border-color: color-mix(in srgb, var(--md-sys-color-error) 70%, transparent);
}

.balanced-scorecard__indicator[data-status='achieved'] {
  border-color: color-mix(in srgb, var(--md-sys-color-primary) 60%, transparent);
}

.balanced-scorecard__indicator[data-status='not-started'] {
  border-style: dashed;
}

.balanced-scorecard__indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--md-sys-spacing-2);
}

.balanced-scorecard__indicator-title {
  margin: 0;
}

.balanced-scorecard__indicator-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.65rem;
  border-radius: var(--md-sys-border-radius-pill, 999px);
  background: color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent);
  color: color-mix(in srgb, var(--md-sys-color-primary) 85%, var(--md-sys-color-on-surface));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.balanced-scorecard__indicator-summary {
  margin: 0;
}

.balanced-scorecard__indicator-metrics {
  margin: 0;
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.balanced-scorecard__metric {
  display: grid;
  gap: 0.25rem;
  margin: 0;
}

.balanced-scorecard__metric dt,
.balanced-scorecard__metric dd {
  margin: 0;
}

@media (max-width: 768px) {
  .balanced-scorecard {
    padding: var(--md-sys-spacing-4);
  }

  .balanced-scorecard__grid {
    grid-template-columns: 1fr;
  }
}
</style>

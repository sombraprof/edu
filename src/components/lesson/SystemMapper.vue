<template>
  <section class="system-mapper card md-stack" role="group" :aria-label="title ?? 'Mapa sistêmico'">
    <header v-if="title || summary" class="system-mapper__header md-stack">
      <h3 v-if="title" class="system-mapper__title text-title-medium font-semibold text-on-surface">
        {{ title }}
      </h3>
      <p v-if="summary" class="system-mapper__summary supporting-text">
        {{ summary }}
      </p>
    </header>

    <div class="system-mapper__factors" role="list">
      <article
        v-for="factor in normalizedFactors"
        :key="factor.id"
        class="system-mapper__factor md-surface"
        role="listitem"
        :aria-labelledby="`${factor.id}-label`"
        :data-kind="factor.kind ?? 'driver'"
      >
        <header class="system-mapper__factor-header">
          <span class="system-mapper__factor-kind" :data-kind="factor.kind ?? 'driver'">
            {{ factor.kindLabel }}
          </span>
          <h4
            :id="`${factor.id}-label`"
            class="system-mapper__factor-title text-title-small font-semibold"
          >
            {{ factor.name }}
          </h4>
        </header>
        <p v-if="factor.summary" class="system-mapper__factor-summary supporting-text">
          {{ factor.summary }}
        </p>
        <ul
          v-if="factor.indicators.length"
          class="system-mapper__indicators"
          role="list"
          aria-label="Indicadores monitorados"
        >
          <li
            v-for="indicator in factor.indicators"
            :key="indicator"
            class="system-mapper__indicator"
            role="listitem"
          >
            {{ indicator }}
          </li>
        </ul>
      </article>
    </div>

    <section
      v-if="normalizedLoops.length"
      class="system-mapper__loops md-stack"
      aria-label="Loops de feedback"
      role="list"
    >
      <article
        v-for="loop in normalizedLoops"
        :key="loop.id"
        class="system-mapper__loop"
        role="listitem"
      >
        <header class="system-mapper__loop-header">
          <span class="system-mapper__loop-badge" :data-polarity="loop.polarity">
            {{ loop.polarity === 'reinforcing' ? 'R' : 'B' }}
          </span>
          <div class="system-mapper__loop-heading">
            <h4 class="system-mapper__loop-title text-title-small font-semibold">
              {{ loop.name }}
            </h4>
            <p class="system-mapper__loop-polarity supporting-text">{{ loop.polarityLabel }}</p>
          </div>
        </header>
        <p v-if="loop.summary" class="system-mapper__loop-summary supporting-text">
          {{ loop.summary }}
        </p>
        <ol class="system-mapper__steps" role="list">
          <li
            v-for="step in loop.steps"
            :key="step.id"
            class="system-mapper__step"
            :data-effect="step.effect"
          >
            <p class="system-mapper__step-connection text-body-medium">
              {{ step.fromLabel }} → {{ step.toLabel }}
              <span v-if="step.effectLabel" class="system-mapper__step-effect"
                >({{ step.effectLabel }})</span
              >
            </p>
            <p v-if="step.description" class="system-mapper__step-description supporting-text">
              {{ step.description }}
            </p>
          </li>
        </ol>
        <ul
          v-if="loop.insights.length"
          class="system-mapper__loop-insights"
          role="list"
          aria-label="Insights desse loop"
        >
          <li
            v-for="insight in loop.insights"
            :key="insight"
            class="system-mapper__loop-insight supporting-text"
            role="listitem"
          >
            {{ insight }}
          </li>
        </ul>
      </article>
    </section>

    <section
      v-if="normalizedInsights.length"
      class="system-mapper__insights md-stack"
      aria-label="Insights gerais"
      role="list"
    >
      <article
        v-for="insight in normalizedInsights"
        :key="insight.id"
        class="system-mapper__insight"
        role="listitem"
      >
        <header class="system-mapper__insight-header">
          <h4 class="system-mapper__insight-title text-title-small font-semibold">
            {{ insight.label }}
          </h4>
        </header>
        <p v-if="insight.description" class="system-mapper__insight-description supporting-text">
          {{ insight.description }}
        </p>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type SystemFactorKind = 'stock' | 'flow' | 'driver' | 'outcome' | 'constraint';

type SystemFactor = {
  id: string;
  name: string;
  summary?: string;
  kind?: SystemFactorKind;
  indicators?: string[];
};

type SystemLoopStep = {
  id: string;
  from: string;
  to: string;
  effect?: 'reinforces' | 'balances';
  description?: string;
};

type SystemLoop = {
  id: string;
  name: string;
  polarity: 'reinforcing' | 'balancing';
  summary?: string;
  steps: SystemLoopStep[];
  insights?: string[];
};

type SystemInsight = {
  id: string;
  label: string;
  description?: string;
};

interface SystemMapperProps {
  title?: string;
  summary?: string;
  factors: SystemFactor[];
  loops: SystemLoop[];
  insights?: SystemInsight[];
}

const props = withDefaults(defineProps<SystemMapperProps>(), {
  factors: () => [],
  loops: () => [],
  insights: () => [],
  title: undefined,
  summary: undefined,
});

type NormalizedFactor = {
  id: string;
  name: string;
  summary?: string;
  kind?: SystemFactorKind;
  kindLabel: string;
  indicators: string[];
};

type NormalizedLoopStep = {
  id: string;
  fromLabel: string;
  toLabel: string;
  effect?: 'reinforces' | 'balances';
  effectLabel?: string;
  description?: string;
};

type NormalizedLoop = {
  id: string;
  name: string;
  polarity: SystemLoop['polarity'];
  polarityLabel: string;
  summary?: string;
  steps: NormalizedLoopStep[];
  insights: string[];
};

type NormalizedInsight = {
  id: string;
  label: string;
  description?: string;
};

const factorLabelMap: Record<SystemFactorKind, string> = {
  stock: 'Estoque',
  flow: 'Fluxo',
  driver: 'Motor',
  outcome: 'Resultado',
  constraint: 'Restrição',
};

const polarityLabelMap: Record<SystemLoop['polarity'], string> = {
  reinforcing: 'Loop reforçador',
  balancing: 'Loop balanceador',
};

const effectLabelMap: Record<NonNullable<SystemLoopStep['effect']>, string> = {
  reinforces: 'Reforça',
  balances: 'Equilibra',
};

const normalizedFactors = computed<NormalizedFactor[]>(() =>
  props.factors
    .map((factor) => ({
      id: factor.id,
      name: factor.name,
      summary: cleanString(factor.summary) || undefined,
      kind: factor.kind,
      kindLabel: factor.kind ? factorLabelMap[factor.kind] : factorLabelMap.driver,
      indicators: normalizeStrings(factor.indicators),
    }))
    .filter((factor) => factor.id && factor.name)
);

const normalizedLoops = computed<NormalizedLoop[]>(() =>
  props.loops
    .map((loop) => ({
      id: loop.id,
      name: loop.name,
      polarity: loop.polarity,
      polarityLabel: polarityLabelMap[loop.polarity],
      summary: cleanString(loop.summary) || undefined,
      steps: normalizeSteps(loop.steps),
      insights: normalizeStrings(loop.insights),
    }))
    .filter((loop) => loop.id && loop.name && loop.steps.length)
);

const normalizedInsights = computed<NormalizedInsight[]>(() =>
  props.insights
    .map((insight) => ({
      id: insight.id,
      label: insight.label,
      description: cleanString(insight.description) || undefined,
    }))
    .filter((insight) => insight.id && insight.label)
);

function normalizeSteps(steps: SystemLoopStep[] | undefined): NormalizedLoopStep[] {
  if (!Array.isArray(steps)) {
    return [];
  }
  return steps
    .map((step, index) => ({
      id: step.id ?? `step-${index}`,
      fromLabel: cleanString(step.from),
      toLabel: cleanString(step.to),
      effect: step.effect,
      effectLabel: step.effect ? effectLabelMap[step.effect] : undefined,
      description: cleanString(step.description) || undefined,
    }))
    .filter((step) => step.id && step.fromLabel && step.toLabel);
}

function normalizeStrings(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map((value) => cleanString(value))
    .filter((value): value is string => Boolean(value));
}

function cleanString(value: string | undefined | null): string {
  return typeof value === 'string' ? value.trim() : '';
}
</script>

<style scoped>
.system-mapper {
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-border-radius-3xl);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-high) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 65%, transparent);
  gap: var(--md-sys-spacing-6);
}

.system-mapper__header {
  gap: var(--md-sys-spacing-2);
}

.system-mapper__title {
  margin: 0;
}

.system-mapper__summary {
  margin: 0;
}

.system-mapper__factors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: var(--md-sys-spacing-5);
}

.system-mapper__factor {
  display: grid;
  gap: var(--md-sys-spacing-3);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-2xl);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--shadow-elevation-1);
}

.system-mapper__factor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--md-sys-spacing-2);
}

.system-mapper__factor-kind {
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

.system-mapper__factor-kind[data-kind='stock'] {
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 60%, transparent);
  color: var(--md-sys-color-on-primary-container);
}

.system-mapper__factor-kind[data-kind='flow'] {
  background: color-mix(in srgb, var(--md-sys-color-secondary-container) 60%, transparent);
  color: var(--md-sys-color-on-secondary-container);
}

.system-mapper__factor-kind[data-kind='outcome'] {
  background: color-mix(in srgb, var(--md-sys-color-tertiary-container) 65%, transparent);
  color: var(--md-sys-color-on-tertiary-container);
}

.system-mapper__factor-kind[data-kind='constraint'] {
  background: color-mix(in srgb, var(--md-sys-color-error-container) 70%, transparent);
  color: var(--md-sys-color-on-error-container);
}

.system-mapper__factor-title {
  margin: 0;
}

.system-mapper__factor-summary {
  margin: 0;
}

.system-mapper__indicators {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
}

.system-mapper__indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-surface-variant) 40%, transparent);
  color: var(--md-sys-color-on-surface-variant);
}

.system-mapper__loops {
  gap: var(--md-sys-spacing-4);
}

.system-mapper__loop {
  border-radius: var(--md-sys-border-radius-2xl);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  background: var(--md-sys-color-surface);
  padding: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.system-mapper__loop-header {
  display: flex;
  align-items: center;
  gap: var(--md-sys-spacing-3);
}

.system-mapper__loop-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  font-weight: 700;
  background: color-mix(in srgb, var(--md-sys-color-primary) 45%, transparent);
  color: var(--md-sys-color-on-primary);
}

.system-mapper__loop-badge[data-polarity='balancing'] {
  background: color-mix(in srgb, var(--md-sys-color-tertiary) 45%, transparent);
  color: var(--md-sys-color-on-tertiary);
}

.system-mapper__loop-heading {
  display: grid;
  gap: 0.125rem;
}

.system-mapper__loop-title,
.system-mapper__loop-polarity,
.system-mapper__loop-summary {
  margin: 0;
}

.system-mapper__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.system-mapper__step {
  padding: var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-large);
  background: color-mix(in srgb, var(--md-sys-color-surface-variant) 35%, transparent);
  display: grid;
  gap: 0.25rem;
}

.system-mapper__step[data-effect='reinforces'] {
  border-left: 4px solid color-mix(in srgb, var(--md-sys-color-primary) 60%, transparent);
}

.system-mapper__step[data-effect='balances'] {
  border-left: 4px solid color-mix(in srgb, var(--md-sys-color-tertiary) 60%, transparent);
}

.system-mapper__step-connection,
.system-mapper__step-description {
  margin: 0;
}

.system-mapper__step-effect {
  margin-left: var(--md-sys-spacing-1);
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: 600;
  color: color-mix(in srgb, var(--md-sys-color-primary) 55%, var(--md-sys-color-on-surface) 45%);
}

.system-mapper__loop-insights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.system-mapper__loop-insight {
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-large);
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 40%, transparent);
  color: var(--md-sys-color-on-primary-container);
}

.system-mapper__insights {
  gap: var(--md-sys-spacing-3);
}

.system-mapper__insight {
  border-radius: var(--md-sys-border-radius-2xl);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  background: var(--md-sys-color-surface);
  padding: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.system-mapper__insight-title,
.system-mapper__insight-description {
  margin: 0;
}

@media (max-width: 640px) {
  .system-mapper {
    padding: var(--md-sys-spacing-4);
  }

  .system-mapper__factor,
  .system-mapper__loop,
  .system-mapper__insight {
    padding: var(--md-sys-spacing-4);
  }
}
</style>

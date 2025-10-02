<template>
  <section class="scenario-matrix">
    <header class="scenario-matrix__header">
      <h3 v-if="data.title" class="scenario-matrix__title">{{ data.title }}</h3>
      <p v-if="data.summary" class="scenario-matrix__summary">{{ data.summary }}</p>
    </header>

    <div class="scenario-matrix__grid">
      <div class="scenario-matrix__y-label">
        <span class="scenario-matrix__axis-title">{{ y.label }}</span>
        <div class="scenario-matrix__axis-extremes">
          <span>{{ y.positive }}</span>
          <span>{{ y.negative }}</span>
        </div>
      </div>

      <div class="scenario-matrix__cells">
        <div class="scenario-matrix__axis-x">
          <span>{{ x.negative }}</span>
          <span class="scenario-matrix__axis-title">{{ x.label }}</span>
          <span>{{ x.positive }}</span>
        </div>

        <div class="scenario-matrix__row">
          <div class="scenario-matrix__cell" data-q="+-">
            <ul class="scenario-matrix__items" role="list">
              <li v-for="(it, i) in quadrants['+-']" :key="i" class="scenario-matrix__item">
                {{ it.label }}
              </li>
            </ul>
          </div>
          <div class="scenario-matrix__cell" data-q="++">
            <ul class="scenario-matrix__items" role="list">
              <li v-for="(it, i) in quadrants['++']" :key="i" class="scenario-matrix__item">
                {{ it.label }}
              </li>
            </ul>
          </div>
        </div>
        <div class="scenario-matrix__row">
          <div class="scenario-matrix__cell" data-q="--">
            <ul class="scenario-matrix__items" role="list">
              <li v-for="(it, i) in quadrants['--']" :key="i" class="scenario-matrix__item">
                {{ it.label }}
              </li>
            </ul>
          </div>
          <div class="scenario-matrix__cell" data-q="-+">
            <ul class="scenario-matrix__items" role="list">
              <li v-for="(it, i) in quadrants['-+']" :key="i" class="scenario-matrix__item">
                {{ it.label }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Axis = { label: string; positive: string; negative: string };
type QuadrantKey = '++' | '+-' | '-+' | '--';
type Item = { label: string; quadrant: QuadrantKey };

interface ScenarioMatrixData {
  title?: string;
  summary?: string;
  x: Axis | { label: string; pos: string; neg: string };
  y: Axis | { label: string; pos: string; neg: string };
  items: Array<
    Item | { title?: string; label?: string; quadrant?: QuadrantKey; x?: number; y?: number }
  >;
}

const props = defineProps<{ data: ScenarioMatrixData }>();

const x = computed<Axis>(() => {
  const raw: any = props.data?.x || {};
  return {
    label: String(raw.label || ''),
    positive: String(raw.positive || raw.pos || ''),
    negative: String(raw.negative || raw.neg || ''),
  };
});

const y = computed<Axis>(() => {
  const raw: any = props.data?.y || {};
  return {
    label: String(raw.label || ''),
    positive: String(raw.positive || raw.pos || ''),
    negative: String(raw.negative || raw.neg || ''),
  };
});

function resolveQuadrant(entry: any): QuadrantKey | undefined {
  if (entry?.quadrant && ['++', '+-', '-+', '--'].includes(entry.quadrant)) return entry.quadrant;
  const xv = Number.isFinite(entry?.x) ? Number(entry.x) : 0;
  const yv = Number.isFinite(entry?.y) ? Number(entry.y) : 0;
  const xs = xv >= 0 ? '+' : '-';
  const ys = yv >= 0 ? '+' : '-';
  return (ys + xs) as QuadrantKey; // row-major: y then x
}

const quadrants = computed<Record<QuadrantKey, { label: string }[]>>(() => {
  const result: Record<QuadrantKey, { label: string }[]> = {
    '++': [],
    '+-': [],
    '-+': [],
    '--': [],
  };
  const raw = Array.isArray(props.data?.items) ? props.data.items : [];
  raw.forEach((entry: any) => {
    const label = String(entry?.label || entry?.title || '').trim();
    if (!label) return;
    const q = resolveQuadrant(entry);
    if (!q) return;
    result[q].push({ label });
  });
  return result;
});
</script>

<style scoped>
.scenario-matrix {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}
.scenario-matrix__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
}
.scenario-matrix__summary {
  color: var(--md-sys-color-on-surface-variant);
}

.scenario-matrix__grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-3);
}
.scenario-matrix__y-label {
  display: grid;
  gap: var(--md-sys-spacing-2);
  align-content: start;
}
.scenario-matrix__axis-title {
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}
.scenario-matrix__axis-extremes {
  display: grid;
  gap: var(--md-sys-spacing-2);
  color: var(--md-sys-color-on-surface-variant);
}

.scenario-matrix__cells {
  display: grid;
  gap: var(--md-sys-spacing-3);
}
.scenario-matrix__axis-x {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  justify-items: center;
  color: var(--md-sys-color-on-surface-variant);
}
.scenario-matrix__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--md-sys-spacing-3);
}
.scenario-matrix__cell {
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  min-height: 120px;
  padding: var(--md-sys-spacing-3);
}
.scenario-matrix__items {
  display: grid;
  gap: var(--md-sys-spacing-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.scenario-matrix__item {
  display: inline-block;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  padding: 0.25rem 0.5rem;
  border-radius: var(--md-sys-border-radius-large);
}

@media (max-width: 640px) {
  .scenario-matrix {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

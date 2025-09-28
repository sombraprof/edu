<template>
  <section class="lesson-chart" role="figure">
    <header v-if="title" class="lesson-chart__header">
      <h4 class="lesson-chart__title">{{ title }}</h4>
    </header>

    <div v-if="segmentsWithMetadata.length" class="lesson-chart__content">
      <div v-if="type === 'pie'" class="lesson-chart__visual lesson-chart__visual--pie">
        <div
          class="lesson-chart__pie"
          :style="{ background: pieGradient }"
          aria-hidden="true"
        ></div>
        <div class="lesson-chart__pie-total">
          <span class="lesson-chart__total-value">{{ formatNumber(totalValue) }}</span>
          <span class="lesson-chart__total-label">Total</span>
        </div>
      </div>

      <div v-else class="lesson-chart__visual lesson-chart__visual--bars">
        <div v-for="segment in segmentsWithMetadata" :key="segment.label" class="lesson-chart__bar">
          <div class="lesson-chart__bar-header">
            <span class="lesson-chart__bar-label">{{ segment.label }}</span>
            <span class="lesson-chart__bar-value">{{ formatNumber(segment.value) }}</span>
          </div>
          <div class="lesson-chart__bar-track" role="presentation">
            <span
              class="lesson-chart__bar-fill"
              :style="{ width: segment.relativeWidth, background: segment.color }"
            ></span>
          </div>
        </div>
      </div>

      <ul class="lesson-chart__legend" role="list">
        <li
          v-for="segment in segmentsWithMetadata"
          :key="segment.label"
          class="lesson-chart__legend-item"
        >
          <span class="lesson-chart__legend-swatch" :style="{ background: segment.color }"></span>
          <div class="lesson-chart__legend-text">
            <span class="lesson-chart__legend-label">{{ segment.label }}</span>
            <span class="lesson-chart__legend-meta">
              {{ formatNumber(segment.value) }}
              <template v-if="type === 'pie'">· {{ segment.percentageLabel }}</template>
            </span>
          </div>
        </li>
      </ul>
    </div>

    <p v-else class="lesson-chart__empty">Sem dados suficientes para exibir o gráfico.</p>

    <footer v-if="source" class="lesson-chart__footer">
      <span class="lesson-chart__source-label">Fonte:</span>
      <span class="lesson-chart__source-text">{{ source }}</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type ChartKind = 'pie' | 'bar';

interface ChartSegment {
  label: string;
  value: number;
  color?: string;
}

const props = defineProps<{
  type: ChartKind;
  title?: string;
  source?: string;
  segments: ChartSegment[];
}>();

const title = computed(() => props.title ?? '');
const source = computed(() => props.source ?? '');
const type = computed(() => props.type);

const palette = [
  'var(--md-sys-color-primary)',
  'var(--md-sys-color-secondary)',
  'var(--md-sys-color-tertiary)',
  'var(--md-sys-color-success)',
  'var(--md-sys-color-warning)',
  'var(--md-sys-color-error)',
];

const totalValue = computed(() =>
  props.segments.reduce(
    (sum, segment) => sum + (Number.isFinite(segment.value) ? segment.value : 0),
    0
  )
);

const segmentsWithMetadata = computed(() => {
  if (!Array.isArray(props.segments) || !props.segments.length) {
    return [] as Array<{
      label: string;
      value: number;
      color: string;
      percentage: number;
      percentageLabel: string;
      relativeWidth: string;
    }>;
  }

  const sanitized = props.segments
    .map((segment, index) => {
      const value = Number.isFinite(segment.value) ? segment.value : 0;
      const color = segment.color ?? palette[index % palette.length];
      return {
        label: segment.label,
        value,
        color,
      };
    })
    .filter((segment) => segment.label && segment.value >= 0);

  const total = sanitized.reduce((sum, segment) => sum + segment.value, 0);
  const highest = Math.max(...sanitized.map((segment) => segment.value), 1);

  return sanitized.map((segment) => {
    const percentage = total > 0 ? (segment.value / total) * 100 : 0;
    return {
      ...segment,
      percentage,
      percentageLabel: `${percentage.toFixed(1)}%`,
      relativeWidth: `${(segment.value / highest) * 100}%`,
    };
  });
});

const pieGradient = computed(() => {
  if (type.value !== 'pie' || !segmentsWithMetadata.value.length || totalValue.value <= 0) {
    return 'var(--md-sys-color-surface-variant)';
  }

  let current = 0;
  const stops = segmentsWithMetadata.value.map((segment) => {
    const start = current;
    const end = current + segment.percentage;
    current = end;
    return `${segment.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `conic-gradient(${stops.join(', ')})`;
});

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(value);
}
</script>

<style scoped>
.lesson-chart {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
  box-shadow: var(--shadow-elevation-1);
}

.lesson-chart__header {
  display: flex;
  align-items: center;
}

.lesson-chart__title {
  font-size: var(--md-sys-typescale-title-large-size, 1.25rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-chart__content {
  display: grid;
  gap: var(--md-sys-spacing-4);
}

.lesson-chart__visual {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lesson-chart__visual--pie {
  min-height: 220px;
}

.lesson-chart__pie {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 8px rgba(0, 0, 0, 0.05);
}

.lesson-chart__pie-total {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: var(--md-sys-color-on-surface);
}

.lesson-chart__total-value {
  font-weight: 700;
  font-size: var(--md-sys-typescale-title-large-size, 1.25rem);
}

.lesson-chart__total-label {
  font-size: var(--md-sys-typescale-label-large-size, 0.9rem);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lesson-chart__visual--bars {
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
}

.lesson-chart__bar {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-1);
}

.lesson-chart__bar-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: var(--md-sys-color-on-surface);
  font-weight: 600;
}

.lesson-chart__bar-track {
  height: 8px;
  background: color-mix(in srgb, var(--md-sys-color-outline) 20%, transparent);
  border-radius: var(--md-sys-border-radius-full);
  overflow: hidden;
}

.lesson-chart__bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;
}

.lesson-chart__legend {
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.lesson-chart__legend-item {
  display: flex;
  align-items: center;
  gap: var(--md-sys-spacing-3);
}

.lesson-chart__legend-swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.lesson-chart__legend-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--md-sys-color-on-surface);
}

.lesson-chart__legend-label {
  font-weight: 600;
}

.lesson-chart__legend-meta {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size, 0.85rem);
}

.lesson-chart__footer {
  display: flex;
  gap: 0.5rem;
  font-size: var(--md-sys-typescale-body-small-size, 0.85rem);
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-chart__source-label {
  font-weight: 600;
}

.lesson-chart__empty {
  color: var(--md-sys-color-on-surface-variant);
  font-style: italic;
}

@media (max-width: 768px) {
  .lesson-chart__visual--pie {
    min-height: 180px;
  }

  .lesson-chart__pie {
    width: 160px;
    height: 160px;
  }
}
</style>

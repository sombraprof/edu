<template>
  <article class="rubric card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <div class="rubric__content">
      <div class="rubric__table" role="table" aria-label="Rúbrica avaliativa">
        <div class="rubric__row rubric__row--header" role="row">
          <div class="rubric__cell rubric__cell--header" role="columnheader">Critério</div>
          <div
            v-for="level in levels"
            :key="level"
            class="rubric__cell rubric__cell--header"
            role="columnheader"
          >
            {{ level }}
          </div>
        </div>

        <div
          v-for="criterion in data.criteria"
          :key="criterion.criterion"
          class="rubric__row"
          role="row"
        >
          <div class="rubric__cell rubric__cell--criterion" role="rowheader">
            {{ criterion.criterion }}
          </div>
          <div
            v-for="(descriptor, index) in criterion.levels"
            :key="index"
            class="rubric__cell"
            role="cell"
          >
            {{ descriptor.description }}
          </div>
        </div>
      </div>

      <aside v-if="shouldRenderChart" class="rubric__chart" aria-live="polite">
        <div
          ref="chartContainer"
          class="rubric__chart-canvas"
          role="img"
          :aria-label="chartAriaLabel"
        ></div>
        <p class="rubric__chart-fallback text-body-small text-on-surface">
          {{ chartFallbackText }}
        </p>
        <ul class="sr-only">
          <li v-for="summary in aggregatedSummary" :key="summary.label">
            {{ summary.label }}: {{ summary.value
            }}<span v-if="summary.weight !== undefined"> (peso {{ summary.weight }}) </span>
          </li>
        </ul>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

export interface RubricLevelDescriptor {
  level: string;
  description: string;
}

export interface RubricCriterion {
  criterion: string;
  levels: RubricLevelDescriptor[];
}

export interface RubricAggregatedScore {
  criterion?: string;
  value: number;
}

export interface RubricLevelDistributionRow {
  level: string;
  values: number[];
}

export interface RubricAggregatedData {
  chart?: 'auto' | 'radar' | 'heatmap';
  scores: Array<number | RubricAggregatedScore>;
  weights?: number[];
  levelDistribution?: RubricLevelDistributionRow[];
}

export interface RubricDisplayBlockData {
  title?: string;
  description?: string;
  criteria: RubricCriterion[];
  aggregated?: RubricAggregatedData;
}

const props = defineProps<{ data: RubricDisplayBlockData }>();

const levels = computed(() => {
  if (props.data.criteria.length === 0) {
    return [] as string[];
  }
  return props.data.criteria[0].levels.map((level) => level.level);
});

const aggregatedScores = computed(() => {
  const { aggregated } = props.data;
  if (!aggregated) {
    return [] as Array<{ label: string; value: number }>;
  }

  return aggregated.scores
    .map((score, index) => {
      if (typeof score === 'number') {
        return {
          label: props.data.criteria[index]?.criterion ?? `Critério ${index + 1}`,
          value: score,
        };
      }

      return {
        label: score.criterion ?? props.data.criteria[index]?.criterion ?? `Critério ${index + 1}`,
        value: score.value,
      };
    })
    .filter((entry) => Number.isFinite(entry.value));
});

const aggregatedSummary = computed(() => {
  const weights = props.data.aggregated?.weights ?? [];

  return aggregatedScores.value.map((entry, index) => ({
    label: entry.label,
    value: entry.value,
    weight: Number.isFinite(weights[index]) ? weights[index] : undefined,
  }));
});

const levelDistribution = computed(
  () =>
    props.data.aggregated?.levelDistribution?.map((row) => ({
      level: row.level,
      values: row.values ?? [],
    })) ?? []
);

const preferredChart = computed(() => props.data.aggregated?.chart ?? 'auto');

const chartType = computed(() => {
  if (!props.data.aggregated) {
    return null;
  }

  const hasDistribution = levelDistribution.value.length > 0;
  const hasScores = aggregatedScores.value.length > 0;

  if (preferredChart.value === 'heatmap' && hasDistribution) {
    return 'heatmap';
  }

  if (preferredChart.value === 'radar' && hasScores) {
    return 'radar';
  }

  if (preferredChart.value === 'auto') {
    if (hasDistribution) {
      return 'heatmap';
    }
    if (hasScores) {
      return 'radar';
    }
  }

  return null;
});

const shouldRenderChart = computed(() => chartType.value !== null);

const chartAriaLabel = computed(() => {
  if (chartType.value === 'heatmap') {
    return 'Mapa de calor dos níveis avaliados na rubrica';
  }

  if (chartType.value === 'radar') {
    return 'Gráfico radar com pontuações agregadas da rubrica';
  }

  return '';
});

const chartFallbackText = computed(() => {
  if (!aggregatedSummary.value.length) {
    return 'Visualização indisponível: utilize a tabela para consultar os critérios.';
  }

  return 'Resumo textual disponível abaixo para leitores de tela.';
});

const chartContainer = ref<HTMLDivElement>();
let chartInstance: any;
let echartsModule: any;
let resizeObserver: ResizeObserver | undefined;

const disposeChart = () => {
  if (chartInstance) {
    chartInstance.dispose?.();
    chartInstance = undefined;
  }
};

const ensureResizeObserver = () => {
  if (typeof ResizeObserver === 'undefined') {
    return;
  }

  if (!resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize?.();
    });
  }

  if (chartContainer.value) {
    resizeObserver.observe(chartContainer.value);
  }
};

const detachResizeObserver = () => {
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value);
  }
};

const buildRadarOption = () => {
  if (!aggregatedSummary.value.length) {
    return null;
  }

  const values = aggregatedSummary.value.map((item) => item.value);
  const hasPositiveValues = values.some((value) => value > 0);
  const defaultMax = hasPositiveValues ? Math.max(...values) : 1;

  return {
    tooltip: { trigger: 'item' },
    legend: { show: false },
    radar: {
      indicator: aggregatedSummary.value.map((item, index) => ({
        name: item.label,
        max: item.weight ?? defaultMax,
      })),
      radius: '70%',
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            name: 'Pontuações agregadas',
            value: values,
            areaStyle: { opacity: 0.25 },
            lineStyle: { width: 2 },
            symbolSize: 6,
          },
        ],
      },
    ],
  };
};

const buildHeatmapOption = () => {
  if (!levelDistribution.value.length || !aggregatedSummary.value.length) {
    return null;
  }

  const xAxisData = aggregatedSummary.value.map((item) => item.label);
  const yAxisData = levelDistribution.value.map((row) => row.level);
  const values = levelDistribution.value.flatMap((row, rowIndex) =>
    row.values.map((value, columnIndex) => [
      columnIndex,
      rowIndex,
      Number.isFinite(value) ? value : 0,
    ])
  );

  const maxValue = values.reduce((acc, [, , value]) => Math.max(acc, value), 0);

  return {
    tooltip: {
      position: 'top',
      formatter: (params: { value: [number, number, number] }) => {
        const [criterionIndex, levelIndex, value] = params.value;
        const levelLabel = yAxisData[levelIndex] ?? '';
        const criterionLabel = xAxisData[criterionIndex] ?? '';
        return `${levelLabel} — ${criterionLabel}: ${value}`;
      },
    },
    grid: { top: 10, bottom: 45, left: 5, right: 10, containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitArea: { show: true },
      axisLabel: { rotate: 30 },
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxValue || 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
    },
    series: [
      {
        name: 'Distribuição por nível',
        type: 'heatmap',
        data: values,
        label: { show: true },
        emphasis: { focus: 'series' },
      },
    ],
  };
};

const renderChart = async () => {
  if (!shouldRenderChart.value || !chartContainer.value) {
    disposeChart();
    return;
  }

  try {
    if (!echartsModule) {
      const mod = await import('echarts');
      echartsModule = mod.default ?? mod;
    }

    if (!chartInstance) {
      chartInstance = echartsModule.init(chartContainer.value);
    }

    const option = chartType.value === 'heatmap' ? buildHeatmapOption() : buildRadarOption();

    if (option) {
      chartInstance.setOption(option, true);
      chartInstance.resize?.();
      ensureResizeObserver();
    }
  } catch (error) {
    console.warn('Não foi possível carregar o gráfico da rubrica.', error);
    disposeChart();
  }
};

onMounted(() => {
  if (chartContainer.value) {
    ensureResizeObserver();
  }
  if (shouldRenderChart.value) {
    renderChart();
  }
});

watch(
  () => [chartType.value, props.data.aggregated],
  () => {
    nextTick(() => {
      if (shouldRenderChart.value) {
        renderChart();
      } else {
        disposeChart();
      }
    });
  },
  { deep: true }
);

watch(
  () => chartContainer.value,
  (current, previous) => {
    if (previous) {
      detachResizeObserver();
    }

    if (current) {
      ensureResizeObserver();
      if (shouldRenderChart.value) {
        renderChart();
      }
    }
  }
);

onBeforeUnmount(() => {
  detachResizeObserver();
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  disposeChart();
});
</script>

<style scoped>
.rubric {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.rubric__content {
  display: grid;
  gap: 1.5rem;
}

.rubric__table {
  display: grid;
  gap: 0.75rem;
}

.rubric__row {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(160px, 1fr) repeat(auto-fit, minmax(160px, 1fr));
}

.rubric__row--header {
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
}

.rubric__cell {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
}

.rubric__cell--header {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.rubric__cell--criterion {
  font-weight: 600;
}

.rubric__chart {
  display: grid;
  gap: 0.5rem;
}

.rubric__chart-canvas {
  width: 100%;
  min-height: 240px;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface-container-lowest);
}

.rubric__chart-fallback {
  margin: 0;
}

@media (min-width: 960px) {
  .rubric__content {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
    align-items: start;
  }
}

:global(.sr-only) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

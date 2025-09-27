<template>
  <section
    class="block-diagram card md-stack"
    role="group"
    :aria-label="title ?? 'Diagrama de blocos'"
  >
    <header v-if="title || summary" class="block-diagram__header md-stack">
      <h3 v-if="title" class="block-diagram__title text-title-medium font-semibold text-on-surface">
        {{ title }}
      </h3>
      <p v-if="summary" class="block-diagram__summary supporting-text">
        {{ summary }}
      </p>
    </header>

    <div
      class="block-diagram__grid"
      role="list"
      :data-dense="dense ? 'true' : undefined"
      :style="{ '--columns': String(layerCount) }"
    >
      <article
        v-for="block in blocksWithPlacement"
        :key="block.id"
        class="block-diagram__block md-surface"
        role="listitem"
        :aria-labelledby="`${block.id}-title`"
        :aria-describedby="
          block.summary || block.metrics?.length ? `${block.id}-description` : undefined
        "
        :data-kind="block.kind ?? 'process'"
        :style="blockStyle(block)"
      >
        <header class="block-diagram__block-header">
          <span v-if="block.badge" class="block-diagram__badge">{{ block.badge }}</span>
          <h4
            :id="`${block.id}-title`"
            class="block-diagram__block-title text-title-small font-semibold"
          >
            {{ block.title }}
          </h4>
        </header>
        <p v-if="block.summary" class="block-diagram__block-summary supporting-text">
          {{ block.summary }}
        </p>
        <dl
          v-if="block.metrics?.length"
          :id="`${block.id}-description`"
          class="block-diagram__metrics"
          role="list"
        >
          <div
            v-for="metric in block.metrics"
            :key="metric.id"
            class="block-diagram__metric"
            role="listitem"
          >
            <dt class="block-diagram__metric-label text-label-large">{{ metric.label }}</dt>
            <dd class="block-diagram__metric-value text-body-medium">{{ metric.value }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <section
      v-if="channels.length"
      class="block-diagram__channels"
      aria-label="Conexões entre blocos"
      role="list"
    >
      <article
        v-for="channel in channelsWithLabels"
        :key="channel.id"
        class="block-diagram__channel"
        role="listitem"
        :data-kind="channel.kind ?? 'data'"
      >
        <header class="block-diagram__channel-header supporting-text">
          <span class="block-diagram__channel-direction" aria-hidden="true">{{
            channel.directionLabel
          }}</span>
          <span class="sr-only">{{ channel.accessibleLabel }}</span>
        </header>
        <p v-if="channel.description" class="block-diagram__channel-description supporting-text">
          {{ channel.description }}
        </p>
      </article>
    </section>

    <section
      v-if="legend?.length"
      class="block-diagram__legend md-stack"
      aria-label="Legenda"
      role="list"
    >
      <article
        v-for="item in legend"
        :key="item.id"
        class="block-diagram__legend-item"
        role="listitem"
      >
        <span class="block-diagram__legend-swatch" :data-kind="item.kind ?? 'process'"></span>
        <div class="block-diagram__legend-copy md-stack">
          <p class="text-label-large font-semibold">{{ item.label }}</p>
          <p v-if="item.description" class="supporting-text">{{ item.description }}</p>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type BlockKind = 'process' | 'data-store' | 'input-output' | 'external';

type ChannelKind = 'data' | 'control' | 'feedback';

interface BlockMetric {
  id: string;
  label: string;
  value: string;
}

interface BlockDescriptor {
  id: string;
  title: string;
  summary?: string;
  layer: number;
  row?: number;
  kind?: BlockKind;
  badge?: string;
  metrics?: BlockMetric[];
}

interface ChannelDescriptor {
  id: string;
  from: string;
  to: string;
  description?: string;
  kind?: ChannelKind;
}

interface LegendItem {
  id: string;
  label: string;
  description?: string;
  kind?: BlockKind | ChannelKind;
}

interface Md3BlockDiagramProps {
  title?: string;
  summary?: string;
  blocks: BlockDescriptor[];
  channels?: ChannelDescriptor[];
  legend?: LegendItem[];
  dense?: boolean;
}

const props = withDefaults(defineProps<Md3BlockDiagramProps>(), {
  title: undefined,
  summary: undefined,
  channels: () => [],
  legend: () => [],
  dense: false,
});

const layerOrder = computed(() => {
  const uniqueLayers = Array.from(new Set(props.blocks.map((block) => block.layer)));
  uniqueLayers.sort((a, b) => a - b);
  return uniqueLayers;
});

const layerCount = computed(() => Math.max(layerOrder.value.length, 1));

const blocksWithPlacement = computed(() =>
  props.blocks
    .map((block) => ({
      ...block,
      column: layerOrder.value.indexOf(block.layer) + 1,
      row: block.row ?? undefined,
    }))
    .sort((a, b) => {
      if (a.column === b.column) {
        return (a.row ?? Number.MAX_SAFE_INTEGER) - (b.row ?? Number.MAX_SAFE_INTEGER);
      }
      return a.column - b.column;
    })
);

const titleById = computed(() => new Map(props.blocks.map((block) => [block.id, block.title])));

const channelsWithLabels = computed(() =>
  props.channels.map((channel) => {
    const fromTitle = titleById.value.get(channel.from) ?? channel.from;
    const toTitle = titleById.value.get(channel.to) ?? channel.to;
    return {
      ...channel,
      directionLabel: `${fromTitle} → ${toTitle}`,
      accessibleLabel: `Fluxo de ${fromTitle} para ${toTitle}`,
    };
  })
);

function blockStyle(block: { column: number; row?: number }) {
  return {
    gridColumn: String(block.column),
    gridRow: block.row ? String(block.row) : undefined,
  } as Record<string, string | undefined>;
}
</script>

<style scoped>
.block-diagram {
  gap: var(--md-sys-spacing-6);
  padding: var(--md-sys-spacing-6);
}

.block-diagram__header {
  gap: var(--md-sys-spacing-2);
}

.block-diagram__summary {
  color: var(--md-sys-color-on-surface-variant);
}

.block-diagram__grid {
  --columns: 1;
  display: grid;
  gap: var(--md-sys-spacing-4);
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
}

.block-diagram__grid[data-dense='true'] {
  gap: var(--md-sys-spacing-3);
}

.block-diagram__block {
  padding: var(--md-sys-spacing-4);
  border-radius: var(--md-sys-shape-corner-medium);
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-ref-shadow-level2);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
  min-height: 100%;
}

.block-diagram__block[data-kind='data-store'] {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.block-diagram__block[data-kind='input-output'] {
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.block-diagram__block[data-kind='external'] {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline);
  box-shadow: none;
}

.block-diagram__block-header {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.block-diagram__badge {
  align-self: flex-start;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: var(--md-sys-shape-corner-full);
  padding: 0 var(--md-sys-spacing-2);
  font: inherit;
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: var(--md-sys-typescale-label-small-weight);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
}

.block-diagram__block-summary {
  margin: 0;
}

.block-diagram__metrics {
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.block-diagram__metric {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--md-sys-spacing-2);
  color: var(--md-sys-color-on-surface-variant);
}

.block-diagram__metric-label {
  margin: 0;
}

.block-diagram__metric-value {
  margin: 0;
}

.block-diagram__channels {
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.block-diagram__channel {
  border-radius: var(--md-sys-shape-corner-small);
  padding: var(--md-sys-spacing-3);
  background: var(--md-sys-color-surface-container-low);
  border: 1px dashed var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface);
}

.block-diagram__channel[data-kind='control'] {
  border-style: solid;
}

.block-diagram__channel[data-kind='feedback'] {
  border-style: dotted;
}

.block-diagram__channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--md-sys-spacing-2);
}

.block-diagram__channel-direction {
  font-weight: 600;
}

.block-diagram__legend {
  padding-top: var(--md-sys-spacing-4);
  border-top: 1px solid var(--md-sys-color-outline-variant);
  gap: var(--md-sys-spacing-3);
}

.block-diagram__legend-item {
  display: flex;
  gap: var(--md-sys-spacing-3);
  align-items: flex-start;
}

.block-diagram__legend-swatch {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--md-sys-shape-corner-small);
  background: var(--md-sys-color-surface-container-high);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.block-diagram__legend-swatch[data-kind='data-store'] {
  background: var(--md-sys-color-secondary-container);
  border-color: transparent;
}

.block-diagram__legend-swatch[data-kind='input-output'] {
  background: var(--md-sys-color-tertiary-container);
  border-color: transparent;
}

.block-diagram__legend-swatch[data-kind='external'] {
  background: var(--md-sys-color-surface-container);
}

.block-diagram__legend-swatch[data-kind='control'] {
  background: transparent;
  border-style: solid;
}

.block-diagram__legend-swatch[data-kind='feedback'] {
  background: transparent;
  border-style: dotted;
}

.block-diagram__legend-copy {
  gap: var(--md-sys-spacing-1);
}

@media (max-width: 900px) {
  .block-diagram__grid {
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  }
}
</style>

<template>
  <section :class="rootClasses" role="group" :aria-labelledby="headingId || undefined">
    <header v-if="hasHeader" class="md3-truth-table__header">
      <h3
        v-if="title"
        :id="headingId || undefined"
        data-testid="truth-table-title"
        class="md3-truth-table__title"
      >
        {{ title }}
      </h3>
      <p v-if="description" :id="descriptionId || undefined" class="md3-truth-table__description">
        {{ description }}
      </p>
    </header>

    <div
      class="md3-truth-table__scroller"
      role="region"
      :aria-labelledby="headingId || undefined"
      :aria-describedby="tableDescriptionId || undefined"
      tabindex="0"
    >
      <table
        class="md3-truth-table__table"
        data-testid="truth-table"
        :aria-describedby="tableDescriptionId || undefined"
      >
        <caption v-if="caption" :id="captionId || undefined" class="md3-truth-table__caption">
          {{
            caption
          }}
        </caption>
        <thead>
          <tr>
            <th
              v-for="(header, index) in normalizedHeaders"
              :key="index"
              scope="col"
              :class="[
                'md3-truth-table__column-header',
                header.srOnly ? 'sr-only' : null,
                header.align ? `is-${header.align}` : null,
              ]"
            >
              <span aria-hidden="true">{{ header.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in normalizedRows" :key="rowIndex">
            <td
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              :class="getCellClasses(cell)"
              :aria-label="getCellLabel(cell) || undefined"
              :colspan="cell.colSpan || undefined"
              :rowspan="cell.rowSpan || undefined"
            >
              <span class="md3-truth-table__cell-content">
                <svg
                  v-if="shouldRenderIcon(cell)"
                  class="md3-truth-table__icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path :d="iconPaths[cell.icon!]" fill="currentColor" />
                </svg>
                <span v-if="cell.displayValue !== ''" class="md3-truth-table__value">
                  {{ cell.displayValue }}
                </span>
              </span>
              <span v-if="cell.note" class="md3-truth-table__note">{{ cell.note }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer
      v-if="legendItems.length"
      class="md3-truth-table__legend"
      aria-label="Legenda da tabela verdade"
    >
      <ul class="md3-truth-table__legend-list">
        <li
          v-for="(item, index) in legendItems"
          :key="index"
          :class="['md3-truth-table__legend-item', item.state ? `is-${item.state}` : null]"
        >
          <span class="md3-truth-table__legend-icon-wrapper">
            <svg
              v-if="legendIcon(item)"
              class="md3-truth-table__legend-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path :d="legendIcon(item)" fill="currentColor" />
            </svg>
          </span>
          <div class="md3-truth-table__legend-text">
            <span class="md3-truth-table__legend-label">{{ item.label }}</span>
            <span v-if="item.description" class="md3-truth-table__legend-description">
              {{ item.description }}
            </span>
          </div>
        </li>
      </ul>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type HeaderAlign = 'start' | 'center' | 'end';
type TruthTableState = 'true' | 'false' | 'emphasis' | 'muted' | 'neutral';
type TruthTableIcon = 'check' | 'x' | 'dash';
type TruthTableHeader = string | { label: string; srOnly?: boolean; align?: HeaderAlign };

type TruthTableCellValue = string | number | boolean | null | undefined;

interface TruthTableCell {
  value?: TruthTableCellValue;
  display?: string;
  srLabel?: string;
  isTrue?: boolean;
  isFalse?: boolean;
  state?: TruthTableState;
  icon?: TruthTableIcon | 'none';
  note?: string;
  align?: HeaderAlign;
  colSpan?: number;
  rowSpan?: number;
}

type TruthTableRow = TruthTableCell[];

interface TruthTableLegendItem {
  label: string;
  description?: string;
  state?: TruthTableState;
  icon?: TruthTableIcon | 'none';
}

interface NormalizedHeader {
  label: string;
  srOnly: boolean;
  align: HeaderAlign;
}

interface NormalizedTruthTableCell extends TruthTableCell {
  state?: TruthTableState;
  icon?: TruthTableIcon;
  displayValue: string;
}

interface NormalizedLegendItem extends TruthTableLegendItem {
  icon?: TruthTableIcon;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    headers: TruthTableHeader[];
    rows: TruthTableRow[];
    caption?: string;
    description?: string;
    legend?: TruthTableLegendItem[];
    dense?: boolean;
  }>(),
  {
    title: '',
    caption: '',
    description: '',
    legend: () => [],
    dense: false,
  }
);

const uniqueId = `truth-table-${Math.random().toString(36).slice(2, 9)}`;

const iconPaths: Record<TruthTableIcon, string> = {
  check:
    'M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05l-5.913 7.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z',
  x: 'M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z',
  dash: 'M2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Z',
};

const stateLabels: Record<TruthTableState, string> = {
  true: 'Verdadeiro',
  false: 'Falso',
  emphasis: 'Valor em destaque',
  muted: 'Valor desabilitado',
  neutral: 'Valor neutro',
};

const normalizedHeaders = computed<NormalizedHeader[]>(() =>
  props.headers.map((header) =>
    typeof header === 'string'
      ? { label: header, srOnly: false, align: 'center' }
      : {
          label: header.label,
          srOnly: header.srOnly ?? false,
          align: header.align ?? 'center',
        }
  )
);

function normalizeCell(cell: TruthTableCell): NormalizedTruthTableCell {
  const state = cell.state ?? (cell.isTrue ? 'true' : cell.isFalse ? 'false' : undefined);
  const icon =
    cell.icon === 'none'
      ? undefined
      : (cell.icon ?? (state === 'true' ? 'check' : state === 'false' ? 'x' : undefined));
  const displayValue =
    cell.display ??
    (cell.value === null || cell.value === undefined
      ? ''
      : typeof cell.value === 'boolean'
        ? cell.value
          ? 'Verdadeiro'
          : 'Falso'
        : String(cell.value));

  return {
    ...cell,
    state,
    icon,
    displayValue,
  };
}

const normalizedRows = computed<NormalizedTruthTableCell[][]>(() =>
  props.rows.map((row) => row.map((cell) => normalizeCell(cell)))
);

const legendItems = computed<NormalizedLegendItem[]>(() =>
  props.legend.map((item) => {
    const icon =
      item.icon === 'none'
        ? undefined
        : (item.icon ??
          (item.state === 'true' ? 'check' : item.state === 'false' ? 'x' : undefined));

    return {
      ...item,
      icon,
    };
  })
);

const headingId = computed(() => (props.title ? `${uniqueId}-title` : undefined));
const descriptionId = computed(() => (props.description ? `${uniqueId}-description` : undefined));
const captionId = computed(() => (props.caption ? `${uniqueId}-caption` : undefined));
const tableDescriptionId = computed(() => {
  const ids = [descriptionId.value, captionId.value].filter(Boolean) as string[];
  return ids.length ? ids.join(' ') : undefined;
});

const hasHeader = computed(() => Boolean(props.title || props.description));

const rootClasses = computed(() => [
  'md3-truth-table',
  'card',
  'shadow-elevation-2',
  props.dense ? 'md3-truth-table--dense' : null,
]);

function getCellClasses(cell: NormalizedTruthTableCell) {
  return [
    'md3-truth-table__cell',
    cell.align ? `is-${cell.align}` : null,
    cell.state ? `is-${cell.state}` : null,
    cell.note ? 'has-note' : null,
  ];
}

function shouldRenderIcon(cell: NormalizedTruthTableCell) {
  return Boolean(cell.icon && iconPaths[cell.icon]);
}

function getCellLabel(cell: NormalizedTruthTableCell) {
  if (cell.srLabel) {
    return cell.srLabel;
  }

  if (cell.displayValue) {
    return cell.displayValue;
  }

  if (cell.state && stateLabels[cell.state]) {
    return stateLabels[cell.state];
  }

  return undefined;
}

function legendIcon(item: NormalizedLegendItem) {
  return item.icon ? iconPaths[item.icon] : undefined;
}

export type {
  TruthTableLegendItem,
  TruthTableRow,
  TruthTableHeader,
  TruthTableCell,
  TruthTableState,
  TruthTableIcon,
};
</script>

<style scoped>
.md3-truth-table {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-border-radius-large);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

.md3-truth-table--dense {
  padding: var(--md-sys-spacing-4);
  gap: var(--md-sys-spacing-3);
}

.md3-truth-table__header {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
  text-align: center;
}

.md3-truth-table__title {
  margin: 0;
  font-family: var(--md-sys-typescale-font);
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  color: var(--md-sys-color-on-surface);
}

.md3-truth-table__description {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.md3-truth-table__scroller {
  overflow-x: auto;
  border-radius: var(--md-sys-border-radius-medium);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  background-color: color-mix(in srgb, var(--md-sys-color-surface-container) 80%, transparent);
  padding: var(--md-sys-spacing-2);
}

@supports not (color: color-mix(in srgb, white 0%, black 0%)) {
  .md3-truth-table__scroller {
    border: 1px solid var(--md-sys-color-outline-variant);
    background-color: var(--md-sys-color-surface-container);
  }
}

.md3-truth-table--dense .md3-truth-table__scroller {
  padding: var(--md-sys-spacing-2);
}

.md3-truth-table__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 420px;
}

.md3-truth-table__caption {
  caption-side: bottom;
  padding-top: var(--md-sys-spacing-2);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  text-align: left;
}

.md3-truth-table__column-header,
.md3-truth-table__cell {
  padding: var(--md-sys-spacing-3);
  text-align: center;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  font-family: var(--md-sys-typescale-font);
}

.md3-truth-table--dense .md3-truth-table__column-header,
.md3-truth-table--dense .md3-truth-table__cell {
  padding: var(--md-sys-spacing-2);
}

.md3-truth-table__column-header {
  font-size: var(--md-sys-typescale-title-small-size);
  font-weight: var(--md-sys-typescale-title-small-weight);
  color: var(--md-sys-color-on-surface-variant);
  letter-spacing: var(--md-sys-typescale-title-small-tracking);
  text-transform: uppercase;
}

.md3-truth-table__column-header.is-start,
.md3-truth-table__cell.is-start {
  text-align: left;
}

.md3-truth-table__column-header.is-end,
.md3-truth-table__cell.is-end {
  text-align: right;
}

.md3-truth-table__cell {
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
}

.md3-truth-table__cell:last-child {
  border-right: none;
}

.md3-truth-table__cell.has-note {
  padding-bottom: var(--md-sys-spacing-1);
}

.md3-truth-table__cell-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--md-sys-spacing-2);
}

.md3-truth-table__icon {
  width: var(--md-sys-icon-size-small);
  height: var(--md-sys-icon-size-small);
}

.md3-truth-table__value {
  font-weight: 600;
}

.md3-truth-table__note {
  display: block;
  margin-top: var(--md-sys-spacing-1);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  color: var(--md-sys-color-on-surface-variant);
}

.md3-truth-table__cell.is-true {
  background-color: var(--md-sys-color-success-container);
  color: var(--md-sys-color-on-success-container);
  font-weight: 600;
}

.md3-truth-table__cell.is-false {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: var(--md-sys-color-error);
  border-color: color-mix(in srgb, var(--md-sys-color-error) 45%, transparent);
  font-weight: 600;
}

.md3-truth-table__cell.is-emphasis {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-weight: 600;
}

.md3-truth-table__cell.is-muted {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.9;
}

.md3-truth-table__cell.is-neutral {
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant);
}

.md3-truth-table__legend {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: var(--md-sys-spacing-3);
}

.md3-truth-table__legend-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.md3-truth-table__legend-item {
  display: flex;
  align-items: flex-start;
  gap: var(--md-sys-spacing-2);
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-medium);
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  border: 1px solid transparent;
}

.md3-truth-table__legend-item.is-true {
  background-color: var(--md-sys-color-success-container);
  color: var(--md-sys-color-on-success-container);
  border-color: color-mix(in srgb, var(--md-sys-color-success) 40%, transparent);
}

.md3-truth-table__legend-item.is-false {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: var(--md-sys-color-error);
  border-color: color-mix(in srgb, var(--md-sys-color-error) 45%, transparent);
}

.md3-truth-table__legend-item.is-emphasis {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-color: color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent);
}

.md3-truth-table__legend-item.is-muted {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 50%, transparent);
}

.md3-truth-table__legend-item.is-neutral {
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
}

.md3-truth-table__legend-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--md-sys-icon-size-small);
  height: var(--md-sys-icon-size-small);
  color: inherit;
}

.md3-truth-table__legend-icon {
  width: 100%;
  height: 100%;
}

.md3-truth-table__legend-text {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-1);
}

.md3-truth-table__legend-label {
  font-weight: 600;
  font-size: var(--md-sys-typescale-body-medium-size);
}

.md3-truth-table__legend-description {
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  color: var(--md-sys-color-on-surface-variant);
}

@media (prefers-reduced-motion: reduce) {
  .md3-truth-table__cell {
    transition: none;
  }
}
</style>

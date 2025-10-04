<template>
  <section class="md3-table-card md-elevation-2 card">
    <div class="md3-table-scroll" role="region" aria-live="polite">
      <table class="md3-table" role="table">
        <thead class="md3-table__head bg-surface-variant text-on-surface-variant">
          <tr>
            <th
              v-for="(header, index) in headers"
              :key="index"
              scope="col"
              class="md3-table__header"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            class="md3-table__row border-b border-outline-variant"
          >
            <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="md3-table__cell">
              <span
                :class="[
                  'md3-table__cell-content',
                  {
                    'md3-table__cell-content--mono': cell.mono,
                    'md3-table__cell-content--code': cell.code,
                    'font-mono': cell.mono,
                    'inline-code': cell.code,
                  },
                ]"
              >
                {{ cell.value }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
interface TableCell {
  value: string;
  mono?: boolean;
  code?: boolean;
}

interface TableRow extends Array<TableCell> {}

interface Md3TableProps {
  headers: string[];
  rows: TableRow[];
}

defineProps<Md3TableProps>();
</script>

<style scoped>
.md3-table-card {
  background: var(--md-sys-color-surface, #fff);
  border-radius: var(--md-sys-shape-corner-large, 1rem);
  border: 1px solid var(--md-sys-color-outline-variant);
  overflow: hidden;
}

.md3-table-scroll {
  overflow-x: auto;
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
  scrollbar-width: thin;
}

.md3-table-scroll::-webkit-scrollbar {
  height: 8px;
}

.md3-table-scroll::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  border-radius: 9999px;
}

.md3-table {
  width: 100%;
  min-width: clamp(360px, 100%, 960px);
  border-collapse: collapse;
}

.md3-table thead {
  background: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface-variant);
}

.md3-table__header {
  text-align: left;
  font: var(
    --md-sys-typescale-title-small-font,
    600 1rem/1.5 var(--md-ref-typeface-plain, 'Roboto', sans-serif)
  );
  letter-spacing: var(--md-sys-typescale-title-small-tracking, 0.005em);
  padding: var(--md-sys-spacing-4) var(--md-sys-spacing-5);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  white-space: nowrap;
}

.md3-table__row {
  background: var(--md-sys-color-surface);
  transition: background-color 120ms ease-in-out;
}

.md3-table__row:nth-child(even) {
  background: var(--md-sys-color-surface-container-high);
}

.md3-table__row:hover {
  background: var(--md-sys-color-surface-container-highest);
}

.md3-table__cell {
  padding: var(--md-sys-spacing-4) var(--md-sys-spacing-5);
  color: var(--md-sys-color-on-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  vertical-align: top;
  word-break: break-word;
}

.md3-table__row:last-child .md3-table__cell {
  border-bottom: none;
}

.md3-table__cell-content {
  display: inline-flex;
  align-items: center;
  gap: var(--md-sys-spacing-2);
  font: var(
    --md-sys-typescale-body-medium-font,
    400 0.9375rem/1.5 var(--md-ref-typeface-plain, 'Roboto', sans-serif)
  );
}

.md3-table__cell-content--mono,
.font-mono {
  font-family: var(--md-ref-typeface-code, 'Roboto Mono', monospace);
  font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
}

.md3-table__cell-content--code,
.inline-code {
  font-family: var(--md-ref-typeface-code, 'Roboto Mono', monospace);
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  padding: var(--md-sys-spacing-1) var(--md-sys-spacing-2);
  border-radius: var(--md-sys-shape-corner-extra-small, 0.375rem);
  font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
}

@media (max-width: 640px) {
  .md3-table-scroll {
    padding-inline: var(--md-sys-spacing-2);
  }

  .md3-table__header,
  .md3-table__cell {
    padding-inline: var(--md-sys-spacing-3);
  }
}
</style>

<template>
  <div class="truth-table-container card p-6 my-8">
    <h3 v-if="title" class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ title }}</h3>
    <p v-if="description" class="text-body-large mb-6 text-[var(--md-sys-color-on-surface-variant)]" v-html="description"></p>

    <div class="overflow-x-auto">
      <table class="truth-table w-full border-collapse">
        <thead>
          <tr class="bg-[var(--md-sys-color-surface-container-high)]">
            <th
              v-for="(header, index) in headers"
              :key="index"
              class="px-4 py-3 text-left text-body-medium font-semibold text-[var(--md-sys-color-on-surface)] border-b border-[var(--md-sys-color-outline)]"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            :class="rowIndex % 2 === 0 ? 'bg-[var(--md-sys-color-surface)]' : 'bg-[var(--md-sys-color-surface-container)]'"
          >
            <td
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              class="px-4 py-3 text-body-medium text-[var(--md-sys-color-on-surface-variant)] border-b border-[var(--md-sys-color-outline)]"
            >
              <span
                :class="[
                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-body-small font-medium',
                  cell === 'V' || cell === '1' || cell === true || cell === 'true'
                    ? 'bg-[var(--md-sys-color-primary-container] text-[var(--md-sys-color-on-primary-container]'
                    : 'bg-[var(--md-sys-color-error-container] text-[var(--md-sys-color-on-error-container]'
                ]"
              >
                {{ formatCellValue(cell) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="legend" class="mt-4 p-4 bg-[var(--md-sys-color-surface-container)] rounded-lg">
      <h4 class="text-title-medium font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Legenda</h4>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-body-small font-medium bg-[var(--md-sys-color-primary-container] text-[var(--md-sys-color-on-primary-container]">V</span>
          <span class="text-body-medium text-[var(--md-sys-color-on-surface-variant)]">Verdadeiro</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-body-small font-medium bg-[var(--md-sys-color-error-container] text-[var(--md-sys-color-on-error-container]">F</span>
          <span class="text-body-medium text-[var(--md-sys-color-on-surface-variant)]">Falso</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TruthTableProps {
  title?: string;
  description?: string;
  headers: string[];
  rows: (string | boolean | number)[][];
  legend?: boolean;
}

defineProps<TruthTableProps>();

function formatCellValue(cell: string | boolean | number): string {
  if (typeof cell === 'boolean') {
    return cell ? 'V' : 'F';
  }
  if (typeof cell === 'number') {
    return cell === 1 ? 'V' : 'F';
  }
  if (typeof cell === 'string') {
    const upperCell = cell.toUpperCase();
    if (upperCell === 'TRUE' || upperCell === 'V' || upperCell === '1') return 'V';
    if (upperCell === 'FALSE' || upperCell === 'F' || upperCell === '0') return 'F';
    return cell;
  }
  return 'F';
}
</script>

<style scoped>
.truth-table {
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-border-radius-large);
  overflow: hidden;
}

.truth-table-container {
  border-radius: var(--md-sys-border-radius-large);
}

/* Responsive design */
@media (max-width: 640px) {
  .truth-table-container {
    padding: 1rem;
  }

  .truth-table th,
  .truth-table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .truth-table {
    border-color: var(--md-sys-color-outline);
  }
}
</style>
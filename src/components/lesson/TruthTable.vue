<template>
  <div class="card shadow-elevation-2">
    <h5 class="font-semibold text-title-small mb-2 text-center text-on-surface">{{ title }}</h5>
    <div class="overflow-x-auto -mx-2 sm:mx-0">
      <table class="w-full truth-table min-w-[480px]">
        <thead class="bg-surface-variant text-on-surface-variant">
          <tr>
            <th v-for="(header, index) in headers" :key="index" class="p-3 text-left font-semibold">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="border-b border-outline-variant">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="p-3 text-on-surface" :class="{ 'result true': cell.isTrue, 'result false': cell.isFalse }">
              <template v-if="cell.isTrue">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" /></svg>
              </template>
              <template v-else-if="cell.isFalse">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1 0-.708z"/></svg>
              </template>
              <template v-else>
                {{ cell.value }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TruthTableCell {
  value?: string;
  isTrue?: boolean;
  isFalse?: boolean;
}

interface TruthTableRow extends Array<TruthTableCell> {}

interface TruthTableProps {
  title: string;
  headers: string[];
  rows: TruthTableRow[];
}

defineProps<TruthTableProps>();
</script>

<style scoped>
.truth-table th, .truth-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.truth-table tbody tr:last-child td {
  border-bottom: none;
}

.truth-table .result.true {
  color: var(--md-sys-color-primary);
  font-weight: 600;
}

.truth-table .result.false {
  color: var(--md-sys-color-error);
  font-weight: 600;
}

.truth-table svg {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.25rem;
}
</style>
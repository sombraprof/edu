<template>
  <div class="card md-elevation-2">
    <div class="overflow-x-auto -mx-2 sm:mx-0">
      <table class="w-full md3-table min-w-[480px]">
        <thead class="bg-surface-variant text-on-surface-variant">
          <tr>
            <th
              v-for="(header, index) in headers"
              :key="index"
              class="text-left font-semibold"
              :style="{ padding: 'var(--md-sys-spacing-3)' }"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            class="border-b border-outline-variant"
          >
            <td
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              class="text-on-surface"
              :style="{ padding: 'var(--md-sys-spacing-3)' }"
            >
              <span v-if="cell.mono" class="font-mono text-body-small">{{ cell.value }}</span>
              <span v-else-if="cell.code" class="inline-code">{{ cell.value }}</span>
              <span v-else>{{ cell.value }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
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
.md3-table th,
.md3-table td {
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.md3-table tbody tr:last-child td {
  border-bottom: none;
}

.md3-table .inline-code {
  background-color: var(--md-sys-color-surface-variant);
  padding: var(--md-sys-spacing-1) var(--md-sys-spacing-2);
  border-radius: 0.25rem;
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
}
</style>

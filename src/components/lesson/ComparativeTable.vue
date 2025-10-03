<template>
  <article class="comparative-table card md-stack md-stack-4">
    <header v-if="data.title || data.description" class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <div class="overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-y-2 text-left">
        <caption v-if="data.caption" class="text-label-medium text-on-surface-variant">
          {{
            data.caption
          }}
        </caption>
        <thead>
          <tr>
            <th class="px-4 py-3 text-label-medium uppercase tracking-wide text-on-surface-variant">
              {{ data.leadingColumnLabel || 'Comparativo' }}
            </th>
            <th
              v-for="(header, index) in data.headers"
              :key="index"
              class="px-4 py-3 text-label-medium uppercase tracking-wide text-on-surface-variant"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in data.rows"
            :key="rowIndex"
            class="rounded-lg border border-outline-variant bg-surface"
          >
            <th
              scope="row"
              class="whitespace-nowrap px-4 py-3 text-body-medium font-semibold text-on-surface"
            >
              {{ row.label }}
            </th>
            <td
              v-for="(cell, cellIndex) in row.values"
              :key="cellIndex"
              class="px-4 py-3 align-top text-body-medium text-on-surface"
            >
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<script setup lang="ts">
export interface ComparativeTableRow {
  label: string;
  values: string[];
}

export interface ComparativeTableBlockData {
  title?: string;
  description?: string;
  caption?: string;
  leadingColumnLabel?: string;
  headers: string[];
  rows: ComparativeTableRow[];
}

defineProps<{ data: ComparativeTableBlockData }>();
</script>

<style scoped>
.comparative-table {
  padding: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 1.5rem;
  background: var(--md-sys-color-surface-container);
}

th,
td {
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

tbody tr:last-of-type th,
tbody tr:last-of-type td {
  border-bottom: none;
}
</style>

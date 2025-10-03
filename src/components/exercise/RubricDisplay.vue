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
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface RubricLevelDescriptor {
  level: string;
  description: string;
}

export interface RubricCriterion {
  criterion: string;
  levels: RubricLevelDescriptor[];
}

export interface RubricDisplayBlockData {
  title?: string;
  description?: string;
  criteria: RubricCriterion[];
}

const props = defineProps<{ data: RubricDisplayBlockData }>();

const levels = computed(() => {
  if (props.data.criteria.length === 0) {
    return [] as string[];
  }
  return props.data.criteria[0].levels.map((level) => level.level);
});
</script>

<style scoped>
.rubric {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
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
</style>

<template>
  <article class="peer-review card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
      <p v-if="data.dueDate" class="text-body-small text-on-surface-variant">
        Prazo: {{ data.dueDate }}
      </p>
    </header>

    <section class="peer-review__section" aria-label="Critérios">
      <h4 class="text-title-small font-semibold text-on-surface">Critérios de avaliação</h4>
      <ul class="md-stack md-stack-1" role="list">
        <li v-for="criterion in data.criteria" :key="criterion.id" class="peer-review__criterion">
          <p class="text-body-medium text-on-surface">{{ criterion.label }}</p>
          <p v-if="criterion.description" class="text-body-small text-on-surface-variant">
            {{ criterion.description }}
          </p>
        </li>
      </ul>
    </section>

    <section v-if="data.steps?.length" class="peer-review__section" aria-label="Fluxo sugerido">
      <h4 class="text-title-small font-semibold text-on-surface">Fluxo sugerido</h4>
      <ol class="md-stack md-stack-1" role="list">
        <li
          v-for="(step, index) in data.steps"
          :key="index"
          class="text-body-medium text-on-surface"
        >
          {{ step }}
        </li>
      </ol>
    </section>
  </article>
</template>

<script setup lang="ts">
export interface PeerReviewCriterion {
  id: string;
  label: string;
  description?: string;
}

export interface PeerReviewTaskBlockData {
  title?: string;
  description?: string;
  dueDate?: string;
  criteria: PeerReviewCriterion[];
  steps?: string[];
}

defineProps<{ data: PeerReviewTaskBlockData }>();
</script>

<style scoped>
.peer-review {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface-container);
}

.peer-review__section {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.peer-review__criterion {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface);
}
</style>

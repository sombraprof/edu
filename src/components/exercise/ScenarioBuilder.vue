<template>
  <article class="scenario-builder card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <div class="scenario-builder__grid">
      <section class="scenario-builder__column" aria-label="Entradas">
        <h4 class="text-title-small font-semibold text-on-surface">Entradas</h4>
        <ul class="md-stack md-stack-1" role="list">
          <li v-for="(input, index) in data.inputs" :key="index" class="scenario-builder__item">
            {{ input }}
          </li>
        </ul>
      </section>

      <section class="scenario-builder__column" aria-label="Processamentos">
        <h4 class="text-title-small font-semibold text-on-surface">Processamentos</h4>
        <ul class="md-stack md-stack-1" role="list">
          <li
            v-for="(process, index) in data.processes"
            :key="index"
            class="scenario-builder__item"
          >
            {{ process }}
          </li>
        </ul>
      </section>

      <section class="scenario-builder__column" aria-label="Saídas">
        <h4 class="text-title-small font-semibold text-on-surface">Saídas</h4>
        <ul class="md-stack md-stack-1" role="list">
          <li v-for="(output, index) in data.outputs" :key="index" class="scenario-builder__item">
            {{ output }}
          </li>
        </ul>
      </section>
    </div>

    <section v-if="data.guidingQuestions?.length" class="scenario-builder__questions">
      <h4 class="text-title-small font-semibold text-on-surface">Perguntas orientadoras</h4>
      <ol class="md-stack md-stack-1" role="list">
        <li
          v-for="(question, index) in data.guidingQuestions"
          :key="index"
          class="text-body-medium text-on-surface"
        >
          {{ question }}
        </li>
      </ol>
    </section>
  </article>
</template>

<script setup lang="ts">
export interface ScenarioBuilderBlockData {
  title?: string;
  description?: string;
  inputs: string[];
  processes: string[];
  outputs: string[];
  guidingQuestions?: string[];
}

defineProps<{ data: ScenarioBuilderBlockData }>();
</script>

<style scoped>
.scenario-builder {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.scenario-builder__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.scenario-builder__column {
  display: grid;
  gap: 0.75rem;
}

.scenario-builder__item {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
}

.scenario-builder__questions {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
}
</style>

<template>
  <article class="case-study card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        Estudo de caso
      </p>
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p class="text-body-medium text-on-surface">{{ data.scenario }}</p>
    </header>

    <p v-if="data.background" class="text-body-medium text-on-surface-variant">
      {{ data.background }}
    </p>

    <section v-if="data.dataPoints?.length" class="case-study__section" aria-label="Dados">
      <h4 class="text-title-small font-semibold text-on-surface">Dados fornecidos</h4>
      <dl class="case-study__data">
        <div v-for="(item, index) in data.dataPoints" :key="index" class="case-study__data-item">
          <dt class="text-label-medium uppercase text-on-surface-variant">{{ item.label }}</dt>
          <dd class="text-body-large text-on-surface">{{ item.value }}</dd>
        </div>
      </dl>
    </section>

    <section
      v-if="data.questions?.length"
      class="case-study__section"
      aria-label="Perguntas para discussão"
    >
      <h4 class="text-title-small font-semibold text-on-surface">Perguntas para discussão</h4>
      <ol class="md-stack md-stack-1" role="list">
        <li
          v-for="(question, index) in data.questions"
          :key="index"
          class="text-body-medium text-on-surface"
        >
          {{ question }}
        </li>
      </ol>
    </section>

    <section v-if="data.tasks?.length" class="case-study__section" aria-label="Tarefas">
      <h4 class="text-title-small font-semibold text-on-surface">Tarefas sugeridas</h4>
      <ul class="md-stack md-stack-1" role="list">
        <li
          v-for="(task, index) in data.tasks"
          :key="index"
          class="text-body-medium text-on-surface"
        >
          {{ task }}
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
export interface CaseStudyDataPoint {
  label: string;
  value: string;
}

export interface CaseStudyBlockData {
  title?: string;
  scenario: string;
  background?: string;
  dataPoints?: CaseStudyDataPoint[];
  questions?: string[];
  tasks?: string[];
}

defineProps<{ data: CaseStudyBlockData }>();
</script>

<style scoped>
.case-study {
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: var(--md-sys-color-surface-container);
}

.case-study__section {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.case-study__data {
  display: grid;
  gap: 1rem;
}

.case-study__data-item {
  display: grid;
  gap: 0.25rem;
}
</style>

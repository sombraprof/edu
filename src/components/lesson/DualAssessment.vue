<template>
  <article class="dual-assessment card md-stack md-stack-5">
    <header class="dual-assessment__header md-stack md-stack-2">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        Avaliação integrada
      </p>
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.summary" class="text-body-medium text-on-surface">
        {{ data.summary }}
      </p>
    </header>

    <section class="dual-assessment__section md-stack md-stack-3" aria-labelledby="theory-heading">
      <header id="theory-heading" class="dual-assessment__section-header">
        <h4 class="text-title-small font-semibold text-on-surface">Teoria</h4>
        <p class="text-body-small text-on-surface-variant">
          Revise conceitos rápidos antes de partir para a prática.
        </p>
      </header>
      <KnowledgeCheck :data="theoryData" />
    </section>

    <section
      class="dual-assessment__section md-stack md-stack-3"
      aria-labelledby="practice-heading"
    >
      <header id="practice-heading" class="dual-assessment__section-header">
        <h4 class="text-title-small font-semibold text-on-surface">Prática</h4>
        <p class="text-body-small text-on-surface-variant">
          Coloque o aprendizado em ação com o exercício orientado.
        </p>
      </header>
      <CodeSubmission :data="practiceData" />
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import KnowledgeCheck, {
  type KnowledgeCheckBlockData,
} from '@/components/lesson/KnowledgeCheck.vue';
import CodeSubmission, {
  type CodeSubmissionBlockData,
} from '@/components/exercise/CodeSubmission.vue';

interface DualAssessmentBlockData {
  title?: string;
  summary?: string;
  theory: KnowledgeCheckBlockData & { type?: string };
  practice: CodeSubmissionBlockData & { type?: string };
}

const props = defineProps<{ data: DualAssessmentBlockData }>();

const theoryData = computed<KnowledgeCheckBlockData>(() => {
  const { type: _type, ...rest } = props.data.theory;
  return rest;
});

const practiceData = computed<CodeSubmissionBlockData>(() => {
  const { type: _type, ...rest } = props.data.practice;
  return rest;
});
</script>

<style scoped>
.dual-assessment {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface-container);
}

.dual-assessment__header {
  text-align: left;
}

.dual-assessment__section {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1.25rem;
  margin-top: 0.75rem;
}

.dual-assessment__section:first-of-type {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.dual-assessment__section-header {
  display: grid;
  gap: 0.25rem;
}

.dual-assessment :deep(.knowledge-check),
.dual-assessment :deep(.code-submission) {
  border-radius: 1.25rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface);
  box-shadow: none;
}
</style>

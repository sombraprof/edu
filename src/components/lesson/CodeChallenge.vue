<template>
  <article class="code-challenge card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        Desafio rápido
      </p>
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p class="text-body-medium text-on-surface">{{ data.prompt }}</p>
    </header>

    <CodeBlock
      v-if="data.code"
      :code="data.code"
      :language="data.language"
      :plainText="!data.language"
    />

    <section v-if="data.question" class="md-stack md-stack-2">
      <h4 class="text-title-medium font-semibold text-on-surface">{{ data.question }}</h4>
      <div class="code-challenge__options" role="group" :aria-label="data.question">
        <label v-for="option in data.options" :key="option.id" class="code-challenge__option">
          <input type="radio" :name="groupName" :value="option.id" v-model="selectedOption" />
          <span>{{ option.text }}</span>
        </label>
      </div>
    </section>

    <p v-if="showExplanation" class="code-challenge__explanation">
      {{ data.answerExplanation }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeBlock from './CodeBlock.vue';

export interface CodeChallengeOption {
  id: string;
  text: string;
}

export interface CodeChallengeBlockData {
  title?: string;
  prompt: string;
  code?: string;
  language?: string;
  question?: string;
  options?: CodeChallengeOption[];
  answerExplanation?: string;
}

const props = defineProps<{ data: CodeChallengeBlockData }>();

const selectedOption = ref<string>('');
const groupName = `code-challenge-${Math.random().toString(36).slice(2, 8)}`;

const showExplanation = computed(
  () => Boolean(props.data.answerExplanation) && Boolean(selectedOption.value)
);
</script>

<style scoped>
.code-challenge {
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: var(--md-sys-color-surface-container-low);
}

.code-challenge__options {
  display: grid;
  gap: 0.75rem;
}

.code-challenge__option {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 1rem;
  cursor: pointer;
  background: var(--md-sys-color-surface);
}

.code-challenge__option input {
  margin-top: 0.25rem;
}

.code-challenge__explanation {
  padding: 1rem;
  border-radius: 1rem;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
</style>

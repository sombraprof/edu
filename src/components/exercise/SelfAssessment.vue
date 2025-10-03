<template>
  <article class="self-assessment card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <section class="md-stack md-stack-2" aria-label="Reflexões">
      <div v-for="prompt in data.prompts" :key="prompt.id" class="self-assessment__prompt">
        <label class="text-label-medium text-on-surface" :for="prompt.id">{{ prompt.label }}</label>
        <textarea
          :id="prompt.id"
          v-model="responses[prompt.id]"
          class="self-assessment__textarea"
          :placeholder="prompt.placeholder || 'Escreva sua reflexão'"
          rows="4"
        ></textarea>
      </div>
    </section>

    <p v-if="hasResponses" class="self-assessment__reminder">
      Suas respostas ficam apenas neste dispositivo. Exporte se quiser compartilhar com o professor.
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

export interface SelfAssessmentPrompt {
  id: string;
  label: string;
  placeholder?: string;
}

export interface SelfAssessmentBlockData {
  title?: string;
  description?: string;
  prompts: SelfAssessmentPrompt[];
}

const props = defineProps<{ data: SelfAssessmentBlockData }>();

const responses = reactive<Record<string, string>>({});

props.data.prompts.forEach((prompt) => {
  responses[prompt.id] = '';
});

const hasResponses = computed(() =>
  Object.values(responses).some((value) => value.trim().length > 0)
);
</script>

<style scoped>
.self-assessment {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.self-assessment__prompt {
  display: grid;
  gap: 0.5rem;
}

.self-assessment__textarea {
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  padding: 0.75rem 1rem;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
}

.self-assessment__reminder {
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
}
</style>

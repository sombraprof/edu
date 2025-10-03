<template>
  <article class="code-submission card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p class="text-body-medium text-on-surface">{{ data.prompt }}</p>
    </header>

    <section class="md-stack md-stack-2">
      <label class="code-submission__label">
        <span class="text-label-medium uppercase text-on-surface-variant">Seu código</span>
        <textarea
          v-model="code"
          class="code-submission__editor"
          :placeholder="
            data.language ? `Escreva o código em ${data.language}` : 'Insira sua solução'
          "
          rows="12"
        ></textarea>
      </label>
      <p v-if="data.language" class="text-body-small text-on-surface-variant">
        Linguagem esperada: {{ data.language }}
      </p>
    </section>

    <section v-if="data.tests?.length" class="code-submission__tests" aria-label="Testes unitários">
      <h4 class="text-title-small font-semibold text-on-surface">Casos de teste previstos</h4>
      <ul class="md-stack md-stack-1" role="list">
        <li v-for="(test, index) in data.tests" :key="index" class="code-submission__test">
          <p class="text-body-medium text-on-surface">{{ test.name }}</p>
          <p v-if="test.input" class="text-body-small text-on-surface-variant">
            Entrada: {{ test.input }}
          </p>
          <p v-if="test.expectedOutput" class="text-body-small text-on-surface-variant">
            Saída esperada: {{ test.expectedOutput }}
          </p>
        </li>
      </ul>
    </section>

    <section v-if="data.tips?.length" class="code-submission__tips" aria-label="Dicas">
      <h4 class="text-title-small font-semibold text-on-surface">Dicas</h4>
      <ul class="md-stack md-stack-1" role="list">
        <li
          v-for="(tip, index) in data.tips"
          :key="index"
          class="text-body-small text-on-surface-variant"
        >
          {{ tip }}
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface CodeSubmissionTestCase {
  name: string;
  input?: string;
  expectedOutput?: string;
}

export interface CodeSubmissionBlockData {
  title?: string;
  prompt: string;
  language?: string;
  boilerplate?: string;
  tests?: CodeSubmissionTestCase[];
  tips?: string[];
}

const props = defineProps<{ data: CodeSubmissionBlockData }>();

const code = ref<string>(props.data.boilerplate ?? '');

watch(
  () => props.data.boilerplate,
  (value) => {
    if (value) {
      code.value = value;
    }
  }
);
</script>

<style scoped>
.code-submission {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.code-submission__label {
  display: grid;
  gap: 0.5rem;
}

.code-submission__editor {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  padding: 1rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.95rem;
  min-height: 12rem;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
}

.code-submission__tests,
.code-submission__tips {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
}

.code-submission__test {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
}
</style>

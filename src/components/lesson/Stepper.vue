<template>
  <section class="lesson-stepper">
    <header class="lesson-stepper__header">
      <h3 v-if="data.title" class="lesson-stepper__title">{{ data.title }}</h3>
      <p v-if="data.summary" class="lesson-stepper__summary">{{ data.summary }}</p>
    </header>

    <ol class="lesson-stepper__indicators" role="list">
      <li
        v-for="(s, i) in steps"
        :key="i"
        class="lesson-stepper__indicator"
        :data-active="i === index ? 'true' : 'false'"
        @click="go(i)"
      >
        <span class="lesson-stepper__bullet">{{ i + 1 }}</span>
        <span class="lesson-stepper__label">{{ s.title }}</span>
      </li>
    </ol>

    <div class="lesson-stepper__content">
      <h4 class="lesson-stepper__step-title">{{ current.title }}</h4>
      <div
        v-if="current.description"
        class="lesson-stepper__desc"
        v-html="current.description"
      ></div>
      <div v-if="current.html" class="lesson-stepper__html" v-html="current.html"></div>
      <CodeBlock
        v-if="current.code"
        class="lesson-stepper__code"
        :code="current.code.code"
        :language="current.code.language || 'plaintext'"
        :plainText="isPlainText(current.code.language)"
      />
    </div>

    <div class="lesson-stepper__actions">
      <button
        type="button"
        class="md-button md-button--outlined"
        :disabled="index === 0"
        @click="prev()"
      >
        Anterior
      </button>
      <button
        type="button"
        class="md-button md-button--filled"
        :disabled="index === steps.length - 1"
        @click="next()"
      >
        Próximo
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import CodeBlock from './CodeBlock.vue';

type StepCode = { code: string; language?: string };
type Step = { title: string; description?: string; html?: string; code?: StepCode };

interface StepperData {
  title?: string;
  summary?: string;
  steps: Array<Step | { label?: string; content?: string; code?: string; language?: string }>;
}

const props = defineProps<{ data: StepperData }>();

const steps = computed<Step[]>(() => {
  const raw = Array.isArray(props.data?.steps) ? props.data.steps : [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return undefined;
      const title = String((entry as any).title ?? (entry as any).label ?? '').trim();
      if (!title) return undefined;
      const description = sanitizeHtml((entry as any).description ?? '');
      const html = sanitizeHtml((entry as any).html ?? (entry as any).content ?? '');
      const rawCode = (entry as any).code;
      const language = (entry as any).language;
      const code: StepCode | undefined =
        typeof rawCode === 'string' && rawCode.trim().length
          ? { code: rawCode, language: typeof language === 'string' ? language : undefined }
          : undefined;
      return { title, description, html, code } as Step;
    })
    .filter((s): s is Step => Boolean(s));
});

const index = ref(0);
const current = computed(() => steps.value[index.value] ?? { title: '' });

function prev() {
  index.value = Math.max(0, index.value - 1);
}

function next() {
  index.value = Math.min(steps.value.length - 1, index.value + 1);
}

function go(i: number) {
  index.value = i;
}

function isPlainText(language?: string) {
  if (!language) return true;
  const normalized = language.toLowerCase();
  return normalized === 'plaintext' || normalized === 'pseudocode' || normalized === 'text';
}
</script>

<style scoped>
.lesson-stepper {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-stepper__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-stepper__summary {
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-stepper__indicators {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--md-sys-spacing-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson-stepper__indicator {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-3);
  align-items: center;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
  cursor: pointer;
}

.lesson-stepper__indicator[data-active='true'] {
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
}

.lesson-stepper__bullet {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-primary) 14%, transparent);
  color: var(--md-sys-color-primary);
  font-weight: 700;
}

.lesson-stepper__label {
  color: var(--md-sys-color-on-surface);
  font-weight: 600;
}

.lesson-stepper__desc {
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-stepper__actions {
  display: flex;
  gap: var(--md-sys-spacing-2);
}

@media (max-width: 640px) {
  .lesson-stepper {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

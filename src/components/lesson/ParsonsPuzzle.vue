<template>
  <section class="lesson-parsons">
    <header class="lesson-parsons__header">
      <h3 v-if="data.title" class="lesson-parsons__title">{{ data.title }}</h3>
      <p v-if="data.instructions" class="lesson-parsons__instructions">{{ data.instructions }}</p>
    </header>

    <ol class="lesson-parsons__list" role="list">
      <li v-for="(line, i) in ordered" :key="line.key" class="lesson-parsons__item">
        <code class="lesson-parsons__code" v-html="line.html"></code>
        <div class="lesson-parsons__controls">
          <button
            type="button"
            class="md-button md-button--outlined md-button--sm"
            :disabled="i === 0 || submitted"
            @click="moveUp(i)"
          >
            ↑
          </button>
          <button
            type="button"
            class="md-button md-button--outlined md-button--sm"
            :disabled="i === ordered.length - 1 || submitted"
            @click="moveDown(i)"
          >
            ↓
          </button>
        </div>
      </li>
    </ol>

    <div class="lesson-parsons__actions">
      <button
        v-if="!submitted"
        type="button"
        class="md-button md-button--filled"
        :disabled="ordered.length === 0"
        @click="check()"
      >
        Verificar
      </button>
      <button v-else type="button" class="md-button md-button--tonal" @click="reset()">
        Tentar novamente
      </button>
      <p
        v-if="submitted"
        class="lesson-parsons__feedback"
        :data-result="correct ? 'correct' : 'incorrect'"
      >
        {{
          correct ? data.feedback?.correct || 'Certo!' : data.feedback?.incorrect || 'Ainda não.'
        }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface ParsonsData {
  title?: string;
  instructions?: string;
  shuffle?: boolean;
  lines: Array<string | { text: string; id?: string }>;
  solution?: string[]; // linhas na ordem correta (texto normalizado)
  feedback?: { correct?: string; incorrect?: string };
}

type Line = { key: string; text: string; html: string };

const props = defineProps<{ data: ParsonsData }>();

function normalizeLines(): Line[] {
  const raw = Array.isArray(props.data?.lines) ? props.data.lines : [];
  const mapped = raw
    .map((entry, i) => {
      const text = typeof entry === 'string' ? entry : String(entry?.text ?? '');
      const trimmed = text.replace(/\r?\n/g, '').trim();
      if (!trimmed) return undefined;
      return {
        key: (typeof entry === 'object' && entry?.id) || `line-${i}`,
        text: trimmed,
        html: sanitizeHtml(text),
      } as Line;
    })
    .filter((l): l is Line => Boolean(l));
  if (props.data?.shuffle !== false) return shuffle(mapped);
  return mapped;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const original = normalizeLines();
const ordered = ref<Line[]>([...original]);
const submitted = ref(false);
const correct = ref(false);

function moveUp(i: number) {
  if (i <= 0) return;
  const a = ordered.value;
  const [item] = a.splice(i, 1);
  a.splice(i - 1, 0, item);
}

function moveDown(i: number) {
  const a = ordered.value;
  if (i >= a.length - 1) return;
  const [item] = a.splice(i, 1);
  a.splice(i + 1, 0, item);
}

const normalizedSolution = computed(() => {
  const sol = Array.isArray(props.data?.solution) ? props.data.solution : [];
  return sol.map((s) => s.replace(/\r?\n/g, '').trim());
});

function check() {
  submitted.value = true;
  const current = ordered.value.map((l) => l.text);
  if (normalizedSolution.value.length) {
    correct.value = arraysEqual(current, normalizedSolution.value);
  } else {
    // If no solution provided, assume original input order (unshuffled) is the answer
    const initial = (props.data?.lines || []).map((l: any) =>
      String(l?.text ?? l ?? '')
        .replace(/\r?\n/g, '')
        .trim()
    );
    correct.value = arraysEqual(current, initial);
  }
}

function reset() {
  ordered.value = normalizeLines();
  submitted.value = false;
  correct.value = false;
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
</script>

<style scoped>
.lesson-parsons {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-parsons__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
}

.lesson-parsons__instructions {
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-parsons__list {
  display: grid;
  gap: var(--md-sys-spacing-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson-parsons__item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--md-sys-spacing-3);
  align-items: start;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-3);
}

.lesson-parsons__code {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  color: var(--md-sys-color-on-surface);
}

.lesson-parsons__controls {
  display: inline-flex;
  gap: var(--md-sys-spacing-1);
}

.lesson-parsons__actions {
  display: flex;
  gap: var(--md-sys-spacing-2);
  align-items: center;
}

.lesson-parsons__feedback[data-result='incorrect'] {
  color: var(--md-sys-color-error);
  font-weight: 600;
}
.lesson-parsons__feedback[data-result='correct'] {
  color: var(--md-sys-color-success);
  font-weight: 600;
}

@media (max-width: 640px) {
  .lesson-parsons {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

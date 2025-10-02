<template>
  <section class="lesson-quiz" :data-mode="multiple ? 'multiple' : 'single'">
    <header class="lesson-quiz__header">
      <h3 v-if="data.title" class="lesson-quiz__title">{{ data.title }}</h3>
      <p v-if="sanitizedQuestion" class="lesson-quiz__question" v-html="sanitizedQuestion"></p>
    </header>

    <div class="lesson-quiz__body">
      <fieldset class="lesson-quiz__fieldset" :aria-labelledby="headingId">
        <legend class="sr-only" :id="headingId">{{ data.title || 'Quiz' }}</legend>

        <ul class="lesson-quiz__options" role="list">
          <li
            v-for="(option, index) in options"
            :key="option.key"
            class="lesson-quiz__option"
            :data-selected="isSelected(index) ? 'true' : 'false'"
            :data-correct="submitted ? String(option.correct) : undefined"
          >
            <label class="lesson-quiz__option-label">
              <input
                :type="multiple ? 'checkbox' : 'radio'"
                class="lesson-quiz__control"
                name="quiz-options"
                :value="index"
                :checked="isSelected(index)"
                :disabled="submitted"
                @change="toggleSelection(index)"
              />
              <span class="lesson-quiz__option-text" v-html="option.text"></span>
            </label>

            <p
              v-if="submitted && option.explanation && isSelected(index)"
              class="lesson-quiz__explanation"
              v-html="option.explanation"
            ></p>
          </li>
        </ul>
      </fieldset>

      <div class="lesson-quiz__actions">
        <button
          v-if="!submitted"
          type="button"
          class="md-button md-button--filled"
          :disabled="!hasSelection"
          @click="submit()"
        >
          Verificar
        </button>

        <button
          v-else-if="allowRetry"
          type="button"
          class="md-button md-button--tonal"
          @click="reset()"
        >
          Tentar novamente
        </button>
      </div>

      <p
        v-if="submitted"
        class="lesson-quiz__feedback"
        :data-result="passed ? 'correct' : 'incorrect'"
      >
        {{ feedbackMessage }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

type QuizOption = {
  id?: string;
  text: string;
  correct?: boolean;
  explanation?: string;
};

interface QuizData {
  title?: string;
  question?: string;
  multiple?: boolean;
  shuffle?: boolean;
  allowRetry?: boolean;
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
  options: Array<QuizOption | string>;
}

const props = defineProps<{ data: QuizData }>();

const headingId = `quiz_${Math.random().toString(36).slice(2, 9)}`;

const multiple = computed(() => Boolean(props.data?.multiple));
const allowRetry = computed(() => props.data?.allowRetry !== false);
const sanitizedQuestion = computed(() => sanitizeHtml(props.data?.question ?? ''));

type InternalOption = { key: string; text: string; correct: boolean; explanation?: string };

function normalizeOptions(): InternalOption[] {
  const raw = Array.isArray(props.data?.options) ? props.data.options : [];
  const mapped = raw
    .map((entry, i) => {
      if (typeof entry === 'string') {
        return {
          key: `opt-${i}`,
          text: sanitizeHtml(entry),
          correct: false,
        } as InternalOption;
      }
      const text = sanitizeHtml(entry?.text ?? '');
      if (!text) return undefined;
      return {
        key: entry?.id || `opt-${i}`,
        text,
        correct: Boolean(entry?.correct),
        explanation: sanitizeHtml(entry?.explanation ?? ''),
      } as InternalOption;
    })
    .filter((v): v is InternalOption => Boolean(v));

  const shouldShuffle = props.data?.shuffle !== false;
  return shouldShuffle ? shuffle(mapped) : mapped;
}

const options = ref<InternalOption[]>(normalizeOptions());
onMounted(() => {
  // When hydrated client-side, ensure options are in the expected (maybe shuffled) order
  options.value = normalizeOptions();
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const selected = ref<Set<number>>(new Set());
const submitted = ref(false);

const hasSelection = computed(() => selected.value.size > 0);

function isSelected(index: number) {
  return selected.value.has(index);
}

function toggleSelection(index: number) {
  if (submitted.value) return;

  if (multiple.value) {
    if (selected.value.has(index)) {
      selected.value.delete(index);
    } else {
      selected.value.add(index);
    }
  } else {
    selected.value.clear();
    selected.value.add(index);
  }
}

const passed = computed(() => {
  if (!submitted.value) return false;
  const correctIndexes = new Set<number>();
  options.value.forEach((opt, i) => {
    if (opt.correct) correctIndexes.add(i);
  });
  if (correctIndexes.size === 0) return false;
  if (multiple.value) {
    if (selected.value.size !== correctIndexes.size) return false;
    for (const idx of selected.value) {
      if (!correctIndexes.has(idx)) return false;
    }
    return true;
  }
  const [choice] = Array.from(selected.value);
  return correctIndexes.has(choice);
});

function submit() {
  if (!hasSelection.value) return;
  submitted.value = true;
}

function reset() {
  selected.value.clear();
  submitted.value = false;
}

const feedbackMessage = computed(() => {
  const fb = props.data?.feedback ?? {};
  const ok = fb.correct || 'Correto! 🎉';
  const notOk = fb.incorrect || 'Não é bem isso. Tente novamente!';
  return passed.value ? ok : notOk;
});
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.lesson-quiz {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-quiz__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-quiz__question {
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-quiz__options {
  display: grid;
  gap: var(--md-sys-spacing-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson-quiz__option {
  display: grid;
  gap: var(--md-sys-spacing-2);
  padding: var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-large);
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.lesson-quiz__option[data-selected='true'] {
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent);
}

.lesson-quiz__option[data-correct='true'] {
  background: color-mix(in srgb, var(--md-sys-color-success) 12%, var(--md-sys-color-surface));
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-success) 45%,
    var(--md-sys-color-outline-variant)
  );
}

.lesson-quiz__option[data-correct='false'] {
  background: color-mix(in srgb, var(--md-sys-color-error) 10%, var(--md-sys-color-surface));
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-error) 45%,
    var(--md-sys-color-outline-variant)
  );
}

.lesson-quiz__option-label {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-3);
  align-items: start;
}

.lesson-quiz__control {
  margin-top: calc(var(--md-sys-spacing-1) / 2);
}

.lesson-quiz__option-text {
  color: var(--md-sys-color-on-surface);
}

.lesson-quiz__explanation {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.95rem);
}

.lesson-quiz__actions {
  display: flex;
  gap: var(--md-sys-spacing-2);
}

.lesson-quiz__feedback {
  margin: 0;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-quiz__feedback[data-result='incorrect'] {
  color: var(--md-sys-color-error);
}

.lesson-quiz__feedback[data-result='correct'] {
  color: var(--md-sys-color-success);
}

@media (max-width: 640px) {
  .lesson-quiz {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

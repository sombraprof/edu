<template>
  <section class="md-stack md-stack-4">
    <header class="md-stack md-stack-1">
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Quiz avaliativo</h3>
      <p class="text-sm text-on-surface-variant">
        Configure perguntas objetivas com alternativas corretas para validar o entendimento dos
        estudantes.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-2 md:col-span-2">
        <span class="md-typescale-label-large text-on-surface">Título</span>
        <input
          v-model="state.title"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          autofocus
        />
      </label>
      <label class="flex flex-col gap-2 md:col-span-2">
        <span class="md-typescale-label-large text-on-surface">Enunciado</span>
        <textarea
          v-model="state.question"
          rows="4"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Descreva a pergunta do quiz"
        ></textarea>
      </label>
    </div>

    <fieldset
      class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-3"
    >
      <legend class="md-typescale-title-small font-semibold text-on-surface">Alternativas</legend>
      <p class="text-sm text-on-surface-variant">
        Marque quais respostas devem ser consideradas corretas. Em modo de resposta única, apenas
        uma alternativa pode ficar selecionada.
      </p>

      <div class="flex flex-col gap-4">
        <article
          v-for="(option, index) in state.options"
          :key="option.id"
          class="rounded-3xl border border-outline bg-surface p-3 md-stack md-stack-3"
        >
          <header class="flex items-center justify-between gap-3">
            <h4 class="text-title-small font-semibold text-on-surface">
              Alternativa {{ index + 1 }}
            </h4>
            <Md3Button
              v-if="state.options.length > 2"
              type="button"
              variant="text"
              class="text-error"
              @click="removeOption(index)"
            >
              <template #leading>
                <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Remover
            </Md3Button>
          </header>

          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Texto da alternativa</span>
            <textarea
              v-model="option.text"
              rows="3"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            ></textarea>
          </label>

          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Explicação (opcional)</span>
            <textarea
              v-model="option.explanation"
              rows="2"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="Texto exibido após o envio para justificar a resposta"
            ></textarea>
          </label>

          <label class="flex items-center gap-3 text-on-surface">
            <input v-if="state.multiple" v-model="option.correct" type="checkbox" class="h-4 w-4" />
            <input
              v-else
              type="radio"
              class="h-4 w-4"
              name="quiz-correct-option"
              :value="option.id"
              :checked="option.correct"
              @change="setSingleCorrect(index)"
            />
            <span>Esta alternativa está correta</span>
          </label>
        </article>
      </div>

      <Md3Button type="button" variant="tonal" class="self-start" @click="addOption">
        <template #leading>
          <Plus class="md-icon md-icon--sm" aria-hidden="true" />
        </template>
        Adicionar alternativa
      </Md3Button>
    </fieldset>

    <section
      class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-3"
    >
      <h4 class="text-title-small font-semibold text-on-surface">Configurações</h4>
      <label class="flex items-center gap-3 text-on-surface">
        <input
          v-model="state.multiple"
          type="checkbox"
          class="h-4 w-4"
          @change="handleMultipleChange"
        />
        <span>Permitir múltiplas respostas corretas</span>
      </label>
      <label class="flex items-center gap-3 text-on-surface">
        <input v-model="state.shuffle" type="checkbox" class="h-4 w-4" />
        <span>Embaralhar alternativas ao exibir</span>
      </label>
      <label class="flex items-center gap-3 text-on-surface">
        <input v-model="state.allowRetry" type="checkbox" class="h-4 w-4" />
        <span>Permitir nova tentativa após o envio</span>
      </label>

      <div class="grid gap-3 md:grid-cols-2">
        <label class="flex flex-col gap-2">
          <span class="md-typescale-label-large text-on-surface">Feedback para acerto</span>
          <textarea
            v-model="state.feedback.correct"
            rows="2"
            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="Mensagem exibida quando o estudante acerta"
          ></textarea>
        </label>
        <label class="flex flex-col gap-2">
          <span class="md-typescale-label-large text-on-surface">Feedback para erro</span>
          <textarea
            v-model="state.feedback.incorrect"
            rows="2"
            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="Mensagem exibida quando o estudante erra"
          ></textarea>
        </label>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

interface QuizOptionState {
  id: string;
  text: string;
  correct: boolean;
  explanation: string;
}

interface QuizBlockState {
  type?: string;
  title: string;
  question: string;
  multiple: boolean;
  shuffle: boolean;
  allowRetry: boolean;
  feedback: {
    correct: string;
    incorrect: string;
  };
  options: QuizOptionState[];
}

interface QuizBlockInput {
  type?: string;
  title?: string;
  question?: string;
  multiple?: boolean;
  shuffle?: boolean;
  allowRetry?: boolean;
  feedback?: { correct?: string; incorrect?: string };
  options?: Array<{ id?: string; text?: string; correct?: boolean; explanation?: string }>;
}

const props = defineProps<{ block: QuizBlockInput }>();
const emit = defineEmits<{ (event: 'update:block', value: QuizBlockInput): void }>();

function createKey(prefix = 'option'): string {
  const globalCrypto =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `${prefix}-${globalCrypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeOptions(block: QuizBlockInput): QuizOptionState[] {
  const raw = Array.isArray(block?.options) ? block.options : [];
  if (raw.length >= 2) {
    return raw.map((option, index) => ({
      id: option?.id ? String(option.id) : createKey(`option-${index + 1}`),
      text: typeof option?.text === 'string' ? option.text : '',
      correct: Boolean(option?.correct),
      explanation: typeof option?.explanation === 'string' ? option.explanation : '',
    }));
  }
  return [createOption(true), createOption(false)];
}

function createOption(correct = false): QuizOptionState {
  return {
    id: createKey(),
    text: '',
    correct,
    explanation: '',
  };
}

function normalizeState(block: QuizBlockInput): QuizBlockState {
  return {
    type: typeof block?.type === 'string' ? block.type : 'quiz',
    title: typeof block?.title === 'string' ? block.title : '',
    question: typeof block?.question === 'string' ? block.question : '',
    multiple: Boolean(block?.multiple),
    shuffle: block?.shuffle !== false,
    allowRetry: block?.allowRetry !== false,
    feedback: {
      correct: typeof block?.feedback?.correct === 'string' ? block.feedback!.correct : '',
      incorrect: typeof block?.feedback?.incorrect === 'string' ? block.feedback!.incorrect : '',
    },
    options: normalizeOptions(block),
  };
}

const state = reactive<QuizBlockState>(normalizeState(props.block));

let syncing = false;

watch(
  () => props.block,
  (value) => {
    syncing = true;
    const next = normalizeState(value ?? {});
    state.type = next.type;
    state.title = next.title;
    state.question = next.question;
    state.multiple = next.multiple;
    state.shuffle = next.shuffle;
    state.allowRetry = next.allowRetry;
    state.feedback.correct = next.feedback.correct;
    state.feedback.incorrect = next.feedback.incorrect;
    state.options = next.options;
    syncing = false;
  },
  { deep: true }
);

watch(
  state,
  () => {
    if (syncing) return;
    emit('update:block', {
      type: state.type || 'quiz',
      title: state.title,
      question: state.question,
      multiple: state.multiple || undefined,
      shuffle: state.shuffle,
      allowRetry: state.allowRetry,
      feedback: {
        correct: state.feedback.correct,
        incorrect: state.feedback.incorrect,
      },
      options: state.options.map((option, index) => ({
        id: option.id,
        text: option.text,
        correct: state.multiple ? option.correct : index === getSingleCorrectIndex(),
        explanation: option.explanation || undefined,
      })),
    });
  },
  { deep: true }
);

function getSingleCorrectIndex(): number {
  const index = state.options.findIndex((option) => option.correct);
  return index >= 0 ? index : 0;
}

function addOption() {
  state.options = [...state.options, createOption(false)];
}

function removeOption(index: number) {
  if (state.options.length <= 2) return;
  state.options = state.options.filter((_, i) => i !== index);
}

function setSingleCorrect(index: number) {
  state.options = state.options.map((option, currentIndex) => ({
    ...option,
    correct: currentIndex === index,
  }));
}

function handleMultipleChange() {
  if (!state.multiple) {
    const index = getSingleCorrectIndex();
    setSingleCorrect(index);
  }
}
</script>

<template>
  <section class="md-stack md-stack-4">
    <header class="md-stack md-stack-1">
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Checagem rápida</h3>
      <p class="text-sm text-on-surface-variant">
        Elabore perguntas objetivas para garantir que os participantes compreenderam o tópico
        apresentado.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Título</span>
        <input
          v-model="state.title"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Opcional"
          autofocus
        />
      </label>
      <label class="md:col-span-2 flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Pergunta</span>
        <textarea
          v-model="state.prompt"
          rows="3"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Qual conceito deseja reforçar?"
        ></textarea>
      </label>
    </div>

    <fieldset
      class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-3"
    >
      <legend class="md-typescale-title-small font-semibold text-on-surface">
        Alternativas exibidas
      </legend>
      <p class="text-sm text-on-surface-variant">
        Cadastre opções claras e concisas. A explicação será mostrada após a seleção de qualquer
        alternativa.
      </p>

      <div class="flex flex-col gap-4">
        <article
          v-for="(option, index) in state.options"
          :key="option.id"
          class="rounded-3xl border border-outline bg-surface p-4 md-stack md-stack-3"
        >
          <header class="flex items-center justify-between gap-3">
            <h4 class="text-title-small font-semibold text-on-surface">Opção {{ index + 1 }}</h4>
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
            <span class="md-typescale-label-large text-on-surface">Texto da opção</span>
            <input
              v-model="option.text"
              type="text"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
        </article>
      </div>

      <Md3Button type="button" variant="tonal" class="self-start" @click="addOption">
        <template #leading>
          <Plus class="md-icon md-icon--sm" aria-hidden="true" />
        </template>
        Adicionar opção
      </Md3Button>
    </fieldset>

    <section
      class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-3"
    >
      <h4 class="text-title-small font-semibold text-on-surface">Feedback</h4>
      <label class="flex items-center gap-3 text-on-surface">
        <input v-model="state.allowMultiple" type="checkbox" class="h-4 w-4" />
        <span>Permitir selecionar mais de uma opção</span>
      </label>
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface"
          >Explicação exibida após a resposta</span
        >
        <textarea
          v-model="state.explanation"
          rows="3"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Resumo ou reforço sobre a resposta"
        ></textarea>
      </label>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

interface KnowledgeCheckOptionState {
  id: string;
  text: string;
}

interface KnowledgeCheckInput {
  type?: string;
  title?: string;
  prompt?: string;
  explanation?: string;
  allowMultiple?: boolean;
  options?: Array<{ id?: string; text?: string }>;
}

const props = defineProps<{ block: KnowledgeCheckInput }>();
const emit = defineEmits<{ (event: 'update:block', value: KnowledgeCheckInput): void }>();

function createKey(prefix = 'option'): string {
  const globalCrypto =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `${prefix}-${globalCrypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createOption(): KnowledgeCheckOptionState {
  return {
    id: createKey(),
    text: '',
  };
}

function normalizeOptions(block: KnowledgeCheckInput): KnowledgeCheckOptionState[] {
  const raw = Array.isArray(block?.options) ? block.options : [];
  if (raw.length >= 2) {
    return raw.map((option, index) => ({
      id: option?.id ? String(option.id) : createKey(`option-${index + 1}`),
      text: typeof option?.text === 'string' ? option.text : '',
    }));
  }
  return [createOption(), createOption()];
}

function normalizeState(block: KnowledgeCheckInput) {
  return {
    type: typeof block?.type === 'string' ? block.type : 'knowledgeCheck',
    title: typeof block?.title === 'string' ? block.title : '',
    prompt: typeof block?.prompt === 'string' ? block.prompt : '',
    explanation: typeof block?.explanation === 'string' ? block.explanation : '',
    allowMultiple: Boolean(block?.allowMultiple),
    options: normalizeOptions(block),
  };
}

const state = reactive(normalizeState(props.block));

let syncing = false;

watch(
  () => props.block,
  (value) => {
    syncing = true;
    const next = normalizeState(value ?? {});
    state.type = next.type;
    state.title = next.title;
    state.prompt = next.prompt;
    state.explanation = next.explanation;
    state.allowMultiple = next.allowMultiple;
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
      type: state.type || 'knowledgeCheck',
      title: state.title || undefined,
      prompt: state.prompt,
      explanation: state.explanation || undefined,
      allowMultiple: state.allowMultiple || undefined,
      options: state.options.map((option) => ({
        id: option.id,
        text: option.text,
      })),
    });
  },
  { deep: true }
);

function addOption() {
  state.options = [...state.options, createOption()];
}

function removeOption(index: number) {
  if (state.options.length <= 2) return;
  state.options = state.options.filter((_, i) => i !== index);
}
</script>

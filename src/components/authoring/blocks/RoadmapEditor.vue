<template>
  <section class="md-stack md-stack-4">
    <header class="md-stack md-stack-1">
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Roteiro da aula</h3>
      <p class="text-sm text-on-surface-variant">
        Organize a sequência de etapas que os participantes irão percorrer ao longo da aula.
      </p>
    </header>

    <div class="flex flex-col gap-3">
      <article
        v-for="(step, index) in state.steps"
        :key="step.__key"
        class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-3"
      >
        <header class="flex items-center justify-between">
          <h4 class="text-title-small font-semibold text-on-surface">Passo {{ index + 1 }}</h4>
          <div class="flex gap-2">
            <Md3Button
              v-if="state.steps.length > 1"
              type="button"
              variant="text"
              class="text-error"
              @click="removeStep(index)"
            >
              <template #leading>
                <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Remover
            </Md3Button>
          </div>
        </header>

        <label class="flex flex-col gap-2">
          <span class="md-typescale-label-large text-on-surface">Título</span>
          <input
            v-model="step.title"
            type="text"
            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :autofocus="index === 0"
          />
        </label>

        <label class="flex flex-col gap-2">
          <span class="md-typescale-label-large text-on-surface">Descrição</span>
          <textarea
            v-model="step.description"
            rows="3"
            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="Opcional"
          ></textarea>
        </label>
      </article>
    </div>

    <Md3Button type="button" variant="tonal" class="self-start" @click="addStep">
      <template #leading>
        <Plus class="md-icon md-icon--sm" aria-hidden="true" />
      </template>
      Adicionar passo
    </Md3Button>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

type RoadmapStep = {
  __key: string;
  title: string;
  description: string;
};

interface RoadmapBlock {
  type?: string;
  steps?: Array<{ title?: string; description?: string }>;
}

const props = defineProps<{ block: RoadmapBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: RoadmapBlock): void }>();

function cloneSteps(block: RoadmapBlock, previous: RoadmapStep[] = []): RoadmapStep[] {
  const raw = Array.isArray(block?.steps) ? block.steps : [];
  if (!raw.length) {
    return [createStep()];
  }
  return raw.map((step, index) => ({
    __key: previous[index]?.__key ?? createKey(),
    title: typeof step?.title === 'string' ? step.title : '',
    description: typeof step?.description === 'string' ? step.description : '',
  }));
}

function createKey() {
  const globalCrypto =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return globalCrypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

function createStep(): RoadmapStep {
  return {
    __key: createKey(),
    title: '',
    description: '',
  };
}

const state = reactive({
  type: typeof props.block?.type === 'string' ? props.block.type : 'roadmap',
  steps: cloneSteps(props.block),
});

let syncing = false;

watch(
  () => props.block,
  (value) => {
    syncing = true;
    state.type = typeof value?.type === 'string' ? value.type : 'roadmap';
    state.steps = cloneSteps(value ?? {}, state.steps);
    syncing = false;
  },
  { deep: true }
);

watch(
  state,
  () => {
    if (syncing) return;
    emit('update:block', {
      type: state.type || 'roadmap',
      steps: state.steps.map((step) => ({
        title: step.title ?? '',
        description: step.description ?? '',
      })),
    });
  },
  { deep: true }
);

function addStep() {
  state.steps = [...state.steps, createStep()];
}

function removeStep(index: number) {
  if (state.steps.length <= 1) return;
  state.steps = state.steps.filter((_, i) => i !== index);
}
</script>

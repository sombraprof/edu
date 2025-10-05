<template>
  <aside class="authoring-panel card md3-surface-section md-stack md-stack-4">
    <header class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-col gap-1">
          <span class="chip chip--outlined self-start text-primary">Modo professor</span>
          <h2 class="md-typescale-title-large font-semibold text-on-surface">Editar aula</h2>
          <p class="text-sm text-on-surface-variant">
            Ajuste metadados, reordene blocos e visualize o conteúdo renderizado em tempo real.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 text-sm" :class="statusTone">
            <component :is="statusIcon" :class="statusIconClass" aria-hidden="true" />
            <span>{{ statusLabel }}</span>
          </div>
          <Md3Button
            v-if="showRevertButton"
            type="button"
            variant="text"
            class="text-sm"
            @click="handleRevert"
          >
            Reverter alterações
          </Md3Button>
        </div>
      </div>
    </header>

    <div
      v-if="props.errorMessage"
      class="rounded-lg border border-error/40 bg-error/10 p-3 text-sm text-error"
    >
      {{ props.errorMessage }}
    </div>
    <div
      v-else-if="props.successMessage"
      class="rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success"
    >
      {{ props.successMessage }}
    </div>

    <template v-if="lessonModel.value">
      <section class="md-stack md-stack-3">
        <h3 class="md-typescale-title-medium font-semibold text-on-surface">
          Metadados principais
        </h3>
        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Título</span>
          <input
            v-model="lessonModel.value.title"
            type="text"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Resumo</span>
          <textarea
            v-model="lessonModel.value.summary"
            rows="3"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          ></textarea>
        </label>
        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Objetivo geral</span>
          <textarea
            v-model="lessonModel.value.objective"
            rows="3"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          ></textarea>
        </label>
        <div class="grid gap-3 md:grid-cols-2">
          <label class="flex flex-col gap-1">
            <span class="md-typescale-label-large text-on-surface">Modalidade</span>
            <input
              v-model="lessonModel.value.modality"
              type="text"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="in-person, remoto, híbrido..."
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="md-typescale-label-large text-on-surface">Duração (min)</span>
            <input
              v-model.number="lessonModel.value.duration"
              type="number"
              min="0"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
        </div>
        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Tags</span>
          <textarea
            v-model="tagsFieldProxy"
            rows="2"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="Uma tag por linha"
          ></textarea>
        </label>
        <div class="grid gap-3 md:grid-cols-2">
          <MetadataListEditor label="Objetivos específicos" v-model="objectivesField" />
          <MetadataListEditor label="Competências" v-model="competenciesField" />
          <MetadataListEditor label="Habilidades" v-model="skillsField" />
          <MetadataListEditor label="Resultados esperados" v-model="outcomesField" />
          <MetadataListEditor label="Pré-requisitos" v-model="prerequisitesField" />
        </div>
      </section>

      <section class="md-stack md-stack-3">
        <div class="flex items-center justify-between">
          <h3 class="md-typescale-title-medium font-semibold text-on-surface">
            Blocos de conteúdo
          </h3>
          <div class="flex items-center gap-2">
            <select
              v-model="newBlockType"
              class="md-shape-large border border-outline bg-surface p-2 text-sm"
            >
              <option v-for="type in supportedBlockTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
            <Md3Button type="button" variant="tonal" @click="insertBlock()">
              <template #leading>
                <Plus class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Inserir
            </Md3Button>
          </div>
        </div>

        <div v-if="blocks.length" class="md-stack md-stack-2">
          <article
            v-for="(block, index) in blocks"
            :key="block.__uiKey"
            class="authoring-block-card md-shape-extra-large border border-outline-variant bg-surface-container-high p-3"
            :class="{ 'is-selected': index === selectedBlockIndex }"
            :aria-expanded="index === selectedBlockIndex"
            :aria-controls="editorSectionId"
          >
            <header class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <GripVertical
                  class="md-icon md-icon--sm text-on-surface-variant"
                  aria-hidden="true"
                />
                <div>
                  <p class="md-typescale-label-large text-on-surface">
                    {{ formatBlockTitle(block, index) }}
                  </p>
                  <p class="text-xs text-on-surface-variant">{{ block.type ?? 'bloco' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="icon-button"
                  :disabled="index === 0"
                  @click="moveBlock(index, -1)"
                >
                  <ArrowUp class="md-icon md-icon--sm" aria-hidden="true" />
                  <span class="sr-only">Mover para cima</span>
                </button>
                <button
                  type="button"
                  class="icon-button"
                  :disabled="index === blocks.length - 1"
                  @click="moveBlock(index, 1)"
                >
                  <ArrowDown class="md-icon md-icon--sm" aria-hidden="true" />
                  <span class="sr-only">Mover para baixo</span>
                </button>
                <button type="button" class="icon-button" @click="removeBlock(index)">
                  <Trash2 class="md-icon md-icon--sm text-error" aria-hidden="true" />
                  <span class="sr-only">Remover bloco</span>
                </button>
              </div>
            </header>
            <footer class="mt-3 flex items-center justify-between gap-2">
              <Md3Button type="button" variant="text" @click="selectBlock(index)">
                <template #leading>
                  <PenSquare class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                Editar detalhes
              </Md3Button>
              <Md3Button type="button" variant="outlined" @click="insertBlock(index)">
                Inserir abaixo
              </Md3Button>
            </footer>
          </article>
        </div>
        <p v-else class="text-sm text-on-surface-variant">
          Esta aula ainda não possui blocos. Adicione um tipo acima para começar a montar o roteiro.
        </p>
      </section>

      <section
        v-if="selectedBlock"
        ref="selectedEditorEl"
        :id="editorSectionId"
        class="md-stack md-stack-3"
      >
        <h3 class="md-typescale-title-medium font-semibold text-on-surface">
          Editor do bloco selecionado
        </h3>
        <component
          :is="blockEditorComponent"
          :block="selectedBlock"
          @update:block="replaceSelectedBlock"
        />
      </section>
    </template>
    <p v-else class="text-sm text-on-surface-variant">
      Carregando os dados da aula. Abra uma aula válida para habilitar o painel de edição.
    </p>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch, type ComputedRef, type Ref } from 'vue';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleDashed,
  Clock3,
  GripVertical,
  LoaderCircle,
  PenSquare,
  Plus,
  Trash2,
} from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import { supportedBlockTypes, type LessonBlock } from '@/components/lesson/blockRegistry';
import {
  MetadataListEditor,
  resolveLessonBlockEditor,
  type LessonArrayField,
  type LessonEditorModel,
} from '@/composables/useLessonEditorModel';
import { useAuthoringSaveTracker } from '@/composables/useAuthoringSaveTracker';
import {
  ensureAuthoringBlockKey,
  inheritAuthoringBlockKey,
  type LessonAuthoringBlock,
} from '@/composables/useAuthoringBlockKeys';
import { defaultBlockTemplates } from '@/components/authoring/defaultBlockTemplates';

const props = defineProps<{
  lessonModel: Ref<LessonEditorModel | null>;
  tagsField: ComputedRef<string>;
  createArrayField: (field: LessonArrayField) => ComputedRef<string>;
  saving: Ref<boolean>;
  hasPendingChanges: Ref<boolean>;
  saveError: Ref<string | null>;
  errorMessage?: string | null;
  successMessage?: string | null;
  canRevert?: boolean;
  onRevert?: () => void;
}>();

const tagsFieldProxy = computed({
  get: () => props.tagsField.value,
  set: (value: string) => {
    props.tagsField.value = value;
  },
});

const objectivesField = props.createArrayField('objectives');
const competenciesField = props.createArrayField('competencies');
const skillsField = props.createArrayField('skills');
const outcomesField = props.createArrayField('outcomes');
const prerequisitesField = props.createArrayField('prerequisites');

const blocks = computed<LessonAuthoringBlock[]>(
  () => (props.lessonModel.value?.blocks ?? []) as LessonAuthoringBlock[]
);
const selectedBlockIndex = ref(0);
const selectedEditorEl = ref<HTMLElement | null>(null);
const editorSectionId = `lesson-authoring-selected-block-${useId()}`;
const newBlockType = ref<string>(supportedBlockTypes[0] ?? 'contentBlock');

const showRevertButton = computed(
  () => Boolean(props.canRevert) && typeof props.onRevert === 'function'
);

function handleRevert() {
  props.onRevert?.();
}

watch(blocks, (current) => {
  if (!current.length) {
    selectedBlockIndex.value = 0;
    return;
  }
  if (selectedBlockIndex.value > current.length - 1) {
    selectBlock(current.length - 1);
  }
});

const selectedBlock = computed<LessonAuthoringBlock | null>(
  () => blocks.value[selectedBlockIndex.value] ?? null
);
const blockEditorComponent = computed(() =>
  resolveLessonBlockEditor(selectedBlock.value as LessonBlock | null)
);

const { status, statusLabel, statusTone } = useAuthoringSaveTracker(props.lessonModel, {
  saving: props.saving,
  hasPendingChanges: props.hasPendingChanges,
  saveError: props.saveError,
});

const statusIcon = computed(() => {
  switch (status.value) {
    case 'saving':
      return LoaderCircle;
    case 'error':
      return AlertCircle;
    case 'pending':
      return Clock3;
    case 'saved':
      return CheckCircle2;
    default:
      return CircleDashed;
  }
});

const statusIconClass = computed(() =>
  status.value === 'saving' ? 'md-icon md-icon--sm animate-spin' : 'md-icon md-icon--sm'
);

function createBlockPayload(type: string): LessonAuthoringBlock {
  const template = defaultBlockTemplates[type];
  const baseBlock = template ? structuredClone(template) : ({ type } as LessonBlock);
  return ensureAuthoringBlockKey(baseBlock);
}

function updateBlocks(next: LessonAuthoringBlock[]) {
  if (!props.lessonModel.value) return;
  props.lessonModel.value.blocks = next;
}

function insertBlock(index?: number) {
  if (!props.lessonModel.value) return;
  const targetIndex = typeof index === 'number' ? index + 1 : blocks.value.length;
  const nextBlocks = [...blocks.value];
  nextBlocks.splice(targetIndex, 0, createBlockPayload(newBlockType.value));
  updateBlocks(nextBlocks);
  selectBlock(targetIndex);
}

function moveBlock(index: number, direction: 1 | -1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= blocks.value.length) return;
  const nextBlocks = [...blocks.value];
  const [item] = nextBlocks.splice(index, 1);
  nextBlocks.splice(nextIndex, 0, item);
  updateBlocks(nextBlocks);
  selectBlock(nextIndex);
}

function replaceSelectedBlock(nextBlock: LessonBlock) {
  if (!props.lessonModel.value) return;
  if (!Array.isArray(props.lessonModel.value.blocks)) return;
  const index = selectedBlockIndex.value;
  if (index < 0 || index >= props.lessonModel.value.blocks.length) return;

  const nextBlocks = [...props.lessonModel.value.blocks] as LessonAuthoringBlock[];
  const current = nextBlocks[index];
  nextBlocks.splice(index, 1, inheritAuthoringBlockKey(current, nextBlock));
  updateBlocks(nextBlocks);
}

function removeBlock(index: number) {
  const previousSelection = selectedBlockIndex.value;
  const nextBlocks = blocks.value.filter((_, blockIndex) => blockIndex !== index);
  updateBlocks(nextBlocks);
  if (!nextBlocks.length) {
    selectedBlockIndex.value = 0;
    return;
  }

  if (previousSelection > index) {
    selectBlock(previousSelection - 1);
    return;
  }

  if (previousSelection === index) {
    selectBlock(Math.min(index, nextBlocks.length - 1));
    return;
  }

  if (previousSelection >= nextBlocks.length) {
    selectBlock(nextBlocks.length - 1);
  }
}

function formatBlockTitle(block: LessonAuthoringBlock, index: number) {
  if (typeof block !== 'object' || !block) return `Bloco ${index + 1}`;
  const maybeTitle = (block as Record<string, unknown>).title;
  if (typeof maybeTitle === 'string' && maybeTitle.length) {
    return maybeTitle;
  }
  const unit = (block as Record<string, unknown>).unit as Record<string, unknown> | undefined;
  if (unit && typeof unit.title === 'string' && unit.title.length) {
    return unit.title;
  }
  return `Bloco ${index + 1}`;
}

function selectBlock(index: number) {
  selectedBlockIndex.value = index;
  nextTick(() => {
    const sectionEl = selectedEditorEl.value;
    if (!sectionEl) return;
    sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const focusTarget =
      sectionEl.querySelector<HTMLElement>('[autofocus]') ??
      sectionEl.querySelector<HTMLElement>(
        'input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
      );
    focusTarget?.focus();
  });
}
</script>

<style scoped>
.authoring-panel {
  position: sticky;
  top: 5.5rem;
  max-height: calc(100vh - 6rem);
  overflow: auto;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 9999px;
  color: var(--md-sys-color-on-surface-variant);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.icon-button:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.icon-button:not(:disabled):hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 12%, transparent);
}

.authoring-block-card {
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.authoring-block-card.is-selected {
  border-color: var(--md-sys-color-primary);
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-primary) 12%,
    var(--md-sys-color-surface-container-high)
  );
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent);
}
</style>

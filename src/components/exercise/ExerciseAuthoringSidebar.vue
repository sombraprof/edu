<template>
  <div class="exercise-authoring-sidebar card md3-surface-section md-stack md-stack-4">
    <header class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-col gap-1">
          <span class="chip chip--outlined self-start text-primary">Modo professor</span>
          <h2 class="md-typescale-title-large font-semibold text-on-surface">Editar exercício</h2>
          <p class="text-sm text-on-surface-variant">
            Ajuste rapidamente os metadados e organize o enunciado deste exercício.
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

    <template v-if="hasExerciseModel">
      <section class="md-stack md-stack-3">
        <h3 class="md-typescale-title-medium font-semibold text-on-surface">
          Metadados do exercício
        </h3>
        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Título</span>
          <input
            v-model="currentExercise.title"
            type="text"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Resumo</span>
          <textarea
            v-model="currentExercise.summary"
            rows="3"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          ></textarea>
        </label>
        <MetadataListEditor label="Tags" v-model="tagsFieldProxy" />
      </section>

      <section class="md-stack md-stack-3">
        <div class="flex items-center justify-between">
          <h3 class="md-typescale-title-medium font-semibold text-on-surface">
            Blocos do enunciado
          </h3>
          <div class="flex items-center gap-2">
            <select
              :value="props.newBlockType"
              class="md-shape-large border border-outline bg-surface p-2 text-sm"
              @change="handleNewBlockTypeChange"
            >
              <option v-for="type in supportedBlockTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
            <Md3Button type="button" variant="tonal" @click="props.onInsertBlock()">
              <template #leading>
                <Plus class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Inserir
            </Md3Button>
          </div>
        </div>

        <AuthoringDraggableList
          v-if="blocks.length"
          :model-value="props.draggableBlocks"
          item-key="__uiKey"
          class="md-stack md-stack-2"
          @update:model-value="props.onUpdateDraggableBlocks"
          @end="props.onDragEnd"
        >
          <template #item="{ element: block, index }">
            <article
              :key="block.__uiKey"
              class="authoring-block-card md-shape-extra-large border border-outline-variant bg-surface-container-high p-3"
              :class="{ 'is-selected': index === props.selectedBlockIndex }"
              :aria-expanded="index === props.selectedBlockIndex"
              :aria-controls="props.editorSectionId"
            >
              <header class="flex items-start justify-between gap-2">
                <div class="grabbable flex items-center gap-2">
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
                    @click="props.onMoveBlock(index, -1)"
                  >
                    <ArrowUp class="md-icon md-icon--sm" aria-hidden="true" />
                    <span class="sr-only">Mover para cima</span>
                  </button>
                  <button
                    type="button"
                    class="icon-button"
                    :disabled="index === blocks.length - 1"
                    @click="props.onMoveBlock(index, 1)"
                  >
                    <ArrowDown class="md-icon md-icon--sm" aria-hidden="true" />
                    <span class="sr-only">Mover para baixo</span>
                  </button>
                  <button type="button" class="icon-button" @click="props.onRemoveBlock(index)">
                    <Trash2 class="md-icon md-icon--sm text-error" aria-hidden="true" />
                    <span class="sr-only">Remover bloco</span>
                  </button>
                </div>
              </header>
              <footer class="mt-3 flex items-center justify-between gap-2">
                <Md3Button type="button" variant="text" @click="props.onSelectBlock(index)">
                  <template #leading>
                    <PenSquare class="md-icon md-icon--sm" aria-hidden="true" />
                  </template>
                  Editar detalhes
                </Md3Button>
                <Md3Button type="button" variant="outlined" @click="props.onInsertBlock(index)">
                  Inserir abaixo
                </Md3Button>
              </footer>
            </article>
          </template>
        </AuthoringDraggableList>
        <p v-else class="text-sm text-on-surface-variant">
          Adicione blocos para descrever o passo a passo ou a rubrica deste exercício.
        </p>
      </section>
    </template>
    <p v-else class="text-sm text-on-surface-variant">
      Carregue o JSON correspondente para habilitar o painel de edição.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component, type Ref, type WritableComputedRef } from 'vue';
import { ArrowDown, ArrowUp, GripVertical, PenSquare, Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import AuthoringDraggableList from '@/components/authoring/AuthoringDraggableList.vue';
import { MetadataListEditor, type LessonEditorModel } from '@/composables/useLessonEditorModel';
import type { LessonAuthoringBlock } from '@/composables/useAuthoringBlockKeys';

type DragEndEvent = { oldIndex?: number | null; newIndex?: number | null };

const props = defineProps<{
  exerciseModel: Ref<LessonEditorModel | null>;
  tagsField: WritableComputedRef<string>;
  blocks: LessonAuthoringBlock[];
  draggableBlocks: LessonAuthoringBlock[];
  selectedBlockIndex: number;
  supportedBlockTypes: readonly string[];
  newBlockType: string;
  statusLabel: string;
  statusTone: string;
  statusIcon: Component | string;
  statusIconClass: string;
  errorMessage?: string | null;
  successMessage?: string | null;
  canRevert?: boolean;
  onRevert?: () => void;
  onInsertBlock: (index?: number) => void;
  onSelectBlock: (index: number) => void;
  onMoveBlock: (index: number, direction: 1 | -1) => void;
  onRemoveBlock: (index: number) => void;
  onUpdateNewBlockType: (value: string) => void;
  onUpdateDraggableBlocks: (value: LessonAuthoringBlock[]) => void;
  onDragEnd: (event: DragEndEvent) => void;
  editorSectionId?: string;
}>();

const exerciseModel = props.exerciseModel;
const hasExerciseModel = computed(() => exerciseModel.value !== null);

type NormalizedLessonEditorModel = LessonEditorModel & {
  title: string;
  summary: string;
  tags: string[];
};

const defaultExerciseModel: NormalizedLessonEditorModel = {
  title: '',
  summary: '',
  tags: [],
};

function ensureExerciseModelDefaults(
  model: LessonEditorModel
): asserts model is NormalizedLessonEditorModel {
  if (typeof model.title !== 'string') {
    model.title = '';
  }
  if (typeof model.summary !== 'string') {
    model.summary = '';
  }
  if (!Array.isArray(model.tags)) {
    model.tags = [];
  }
}

const currentExercise = computed<NormalizedLessonEditorModel>(() => {
  const model = exerciseModel.value;
  if (!model) {
    return defaultExerciseModel;
  }
  ensureExerciseModelDefaults(model);
  return model;
});

function useWritableFieldProxy(field: WritableComputedRef<string>) {
  return computed({
    get: () => field.value,
    set: (value: string) => {
      field.value = value;
    },
  });
}

const tagsFieldProxy = useWritableFieldProxy(props.tagsField);

const showRevertButton = computed(
  () => Boolean(props.canRevert) && typeof props.onRevert === 'function'
);

const blocks = computed(() => props.blocks ?? []);

function handleRevert() {
  props.onRevert?.();
}

function handleNewBlockTypeChange(event: Event) {
  const target = event.target as HTMLSelectElement | null;
  const value = target?.value ?? '';
  props.onUpdateNewBlockType(value);
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
</script>

<style scoped>
.exercise-authoring-sidebar {
  width: 100%;
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

.grabbable {
  cursor: grab;
}

.grabbable:active {
  cursor: grabbing;
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

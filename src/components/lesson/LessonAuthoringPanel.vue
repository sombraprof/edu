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
          <div
            class="flex items-center gap-2 text-sm"
            :class="statusTone"
            data-test="authoring-status"
            :data-status="status"
          >
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
            v-model="titleField"
            type="text"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Resumo</span>
          <textarea
            v-model="summaryField"
            rows="3"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          ></textarea>
        </label>
        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Objetivo geral</span>
          <textarea
            v-model="objectiveField"
            rows="3"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          ></textarea>
        </label>
        <div class="grid gap-3 md:grid-cols-2">
          <label class="flex flex-col gap-1">
            <span class="md-typescale-label-large text-on-surface">Modalidade</span>
            <input
              v-model="modalityField"
              type="text"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="in-person, remoto, híbrido..."
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="md-typescale-label-large text-on-surface">Duração (min)</span>
            <input
              v-model.number="durationField"
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
          <MetadataListEditor label="Objetivos específicos" v-model="objectivesFieldProxy" />
          <MetadataListEditor label="Competências" v-model="competenciesFieldProxy" />
          <MetadataListEditor label="Habilidades" v-model="skillsFieldProxy" />
          <MetadataListEditor label="Resultados esperados" v-model="outcomesFieldProxy" />
          <MetadataListEditor label="Pré-requisitos" v-model="prerequisitesFieldProxy" />
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

        <AuthoringDraggableList
          v-if="blocks.length"
          v-model="draggableBlocks"
          item-key="__uiKey"
          class="md-stack md-stack-2"
          @end="handleBlockDragEnd"
        >
          <template #item="{ element: block, index }">
            <article
              :key="block.__uiKey"
              class="authoring-block-card md-shape-extra-large border border-outline-variant bg-surface-container-high p-3"
              :class="{ 'is-selected': index === selectedBlockIndex }"
              :aria-expanded="index === selectedBlockIndex"
              :aria-controls="editorSectionId"
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
          </template>
        </AuthoringDraggableList>
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
import { computed, nextTick, ref, useId, watch, type Ref, type WritableComputedRef } from 'vue';
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
import AuthoringDraggableList from '@/components/authoring/AuthoringDraggableList.vue';
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
  tagsField: WritableComputedRef<string>;
  createArrayField: (field: LessonArrayField) => WritableComputedRef<string>;
  saving: Ref<boolean>;
  hasPendingChanges: Ref<boolean>;
  saveError: Ref<string | null>;
  errorMessage?: string | null;
  successMessage?: string | null;
  canRevert?: boolean;
  onRevert?: () => void;
}>();

const lessonModelRef = props.lessonModel;

function useWritableFieldProxy(field: WritableComputedRef<string>) {
  return computed({
    get: () => field.value,
    set: (value: string) => {
      field.value = value;
    },
  });
}

type NormalizedLessonEditorModel = LessonEditorModel & {
  title: string;
  summary: string;
  objective: string;
  modality: string;
  duration: number | null;
  tags: string[];
  blocks: LessonAuthoringBlock[];
};

const defaultLessonModel: NormalizedLessonEditorModel = {
  title: '',
  summary: '',
  objective: '',
  modality: '',
  duration: null,
  tags: [],
  blocks: [],
};

function cloneLessonModel(model: LessonEditorModel): NormalizedLessonEditorModel {
  let draft: NormalizedLessonEditorModel;
  try {
    draft = structuredClone(model) as NormalizedLessonEditorModel;
  } catch (error) {
    if (error instanceof Error && error.name === 'DataCloneError') {
      draft = JSON.parse(JSON.stringify(model)) as NormalizedLessonEditorModel;
    } else {
      throw error;
    }
  }
  draft.title = typeof draft.title === 'string' ? draft.title : '';
  draft.summary = typeof draft.summary === 'string' ? draft.summary : '';
  draft.objective = typeof draft.objective === 'string' ? draft.objective : '';
  draft.modality = typeof draft.modality === 'string' ? draft.modality : '';
  if (typeof draft.duration !== 'number' || Number.isNaN(draft.duration)) {
    draft.duration = draft.duration === null ? null : 0;
  }
  draft.tags = Array.isArray(draft.tags) ? [...draft.tags] : [];
  draft.blocks = Array.isArray(draft.blocks)
    ? (draft.blocks as LessonAuthoringBlock[])
    : ([] as LessonAuthoringBlock[]);
  return draft;
}

function commitLessonModel(mutator: (draft: NormalizedLessonEditorModel) => void) {
  const source = lessonModelRef.value;
  if (!source) {
    return;
  }
  const draft = cloneLessonModel(source);
  mutator(draft);
  lessonModelRef.value = draft;
}

const currentLesson = computed<NormalizedLessonEditorModel>(() => {
  const model = lessonModelRef.value;
  if (!model) {
    return defaultLessonModel;
  }
  return cloneLessonModel(model);
});

const titleField = computed({
  get: () => currentLesson.value.title,
  set: (value: string) => {
    commitLessonModel((draft) => {
      draft.title = value;
    });
  },
});

const summaryField = computed({
  get: () => currentLesson.value.summary,
  set: (value: string) => {
    commitLessonModel((draft) => {
      draft.summary = value;
    });
  },
});

const objectiveField = computed({
  get: () => currentLesson.value.objective,
  set: (value: string) => {
    commitLessonModel((draft) => {
      draft.objective = value;
    });
  },
});

const modalityField = computed({
  get: () => currentLesson.value.modality,
  set: (value: string) => {
    commitLessonModel((draft) => {
      draft.modality = value;
    });
  },
});

const durationField = computed({
  get: () => currentLesson.value.duration ?? 0,
  set: (value: number) => {
    commitLessonModel((draft) => {
      draft.duration = Number.isFinite(value) ? value : null;
    });
  },
});

const tagsFieldProxy = useWritableFieldProxy(props.tagsField);
const objectivesFieldProxy = useWritableFieldProxy(props.createArrayField('objectives'));
const competenciesFieldProxy = useWritableFieldProxy(props.createArrayField('competencies'));
const skillsFieldProxy = useWritableFieldProxy(props.createArrayField('skills'));
const outcomesFieldProxy = useWritableFieldProxy(props.createArrayField('outcomes'));
const prerequisitesFieldProxy = useWritableFieldProxy(props.createArrayField('prerequisites'));

const blocks = computed<LessonAuthoringBlock[]>(() => currentLesson.value.blocks);
type DragEndEvent = { oldIndex?: number | null; newIndex?: number | null };
const pendingReorder = ref<LessonAuthoringBlock[] | null>(null);
const draggableBlocks = computed<LessonAuthoringBlock[]>({
  get: () => blocks.value,
  set: (next: LessonAuthoringBlock[]) => {
    pendingReorder.value = [...next];
  },
});
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

watch(selectedBlock, (newBlock) => {
  if (newBlock) {
    nextTick(() => {
      nextTick(() => {
        const sectionEl = selectedEditorEl.value;
        if (!sectionEl) return;
        const focusTarget =
          sectionEl.querySelector<HTMLElement>('[autofocus]') ??
          sectionEl.querySelector<HTMLElement>(
            'input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
          );
        focusTarget?.focus();
      });
    });
  }
});

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
  commitLessonModel((draft) => {
    draft.blocks = next;
  });
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
  if (!item) return;
  nextBlocks.splice(nextIndex, 0, item);
  pendingReorder.value = nextBlocks;
  commitPendingBlockOrder({ oldIndex: index, newIndex: nextIndex });
}

function commitPendingBlockOrder(event?: DragEndEvent) {
  if (!props.lessonModel.value) return;
  const current = blocks.value;
  let proposed = pendingReorder.value;

  if (
    !proposed &&
    event &&
    typeof event.oldIndex === 'number' &&
    typeof event.newIndex === 'number'
  ) {
    const copy = [...current];
    const [moved] = copy.splice(event.oldIndex, 1);
    if (moved) {
      copy.splice(event.newIndex, 0, moved);
      proposed = copy;
    }
  }

  if (!proposed) {
    return;
  }

  pendingReorder.value = null;

  const currentByKey = new Map<string, LessonAuthoringBlock>();
  for (const block of current) {
    currentByKey.set(block.__uiKey, block);
  }
  const normalized = proposed.map((block, index) => {
    const key = typeof block?.__uiKey === 'string' ? block.__uiKey : undefined;
    const source = (key ? currentByKey.get(key) : undefined) ?? current[index];
    return inheritAuthoringBlockKey(source, block);
  }) as LessonAuthoringBlock[];

  updateBlocks(normalized);

  if (!event) {
    return;
  }

  const movedKey =
    typeof event.oldIndex === 'number' ? current[event.oldIndex]?.__uiKey : undefined;
  let targetIndex =
    typeof movedKey === 'string' ? normalized.findIndex((block) => block.__uiKey === movedKey) : -1;

  if (targetIndex < 0) {
    if (typeof event.newIndex === 'number') {
      targetIndex = event.newIndex;
    } else if (typeof event.oldIndex === 'number') {
      targetIndex = event.oldIndex;
    }
  }

  if (targetIndex >= 0) {
    selectBlock(targetIndex);
  }
}

function handleBlockDragEnd(event: DragEndEvent) {
  commitPendingBlockOrder(event);
}

function replaceSelectedBlock(nextBlock: LessonBlock) {
  commitLessonModel((draft) => {
    if (!Array.isArray(draft.blocks)) {
      draft.blocks = [] as LessonAuthoringBlock[];
      return;
    }
    const index = selectedBlockIndex.value;
    if (index < 0 || index >= draft.blocks.length) return;

    const nextBlocks = [...draft.blocks];
    const current = nextBlocks[index];
    nextBlocks.splice(index, 1, inheritAuthoringBlockKey(current, nextBlock));
    draft.blocks = nextBlocks;
  });
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
    if (typeof sectionEl.scrollIntoView === 'function') {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const focusTarget =
      sectionEl.querySelector<HTMLElement>('[autofocus]') ??
      sectionEl.querySelector<HTMLElement>(
        'input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
      );
    setTimeout(() => focusTarget?.focus(), 0);
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

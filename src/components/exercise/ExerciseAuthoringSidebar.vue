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
      <section class="exercise-authoring-sidebar__section">
        <header class="exercise-authoring-sidebar__section-header">
          <h3 class="md-typescale-title-medium font-semibold text-on-surface">
            Metadados do exercício
          </h3>
          <Md3Button type="button" variant="text" @click="toggleMetadataEditing">
            <template #leading>
              <PenSquare class="md-icon md-icon--sm" aria-hidden="true" />
            </template>
            {{ metadataActionLabel }}
          </Md3Button>
        </header>

        <div v-if="!isMetadataEditing" class="exercise-authoring-sidebar__metadata-preview">
          <dl v-if="metadataSummaryItems.length" class="exercise-authoring-sidebar__metadata-grid">
            <div
              v-for="item in metadataSummaryItems"
              :key="item.label"
              class="exercise-authoring-sidebar__metadata-item"
            >
              <dt class="metadata-label">{{ item.label }}</dt>
              <dd v-if="item.type === 'chips'" class="metadata-value metadata-value--chips">
                <span v-for="chip in item.values" :key="chip" class="chip chip--outlined">{{
                  chip
                }}</span>
              </dd>
              <dd v-else class="metadata-value">{{ item.value }}</dd>
            </div>
          </dl>
          <p v-else class="text-sm text-on-surface-variant">
            Nenhum metadado preenchido. Clique em “Editar metadados” para adicionar informações
            básicas.
          </p>
        </div>

        <div v-else class="md-stack md-stack-3" :id="metadataSectionId">
          <label class="flex flex-col gap-1">
            <span class="md-typescale-label-large text-on-surface">Título</span>
            <input
              v-model="currentExercise.title"
              type="text"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              autofocus
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
          <div class="flex justify-end">
            <Md3Button type="button" variant="tonal" @click="toggleMetadataEditing">
              Concluir edição
            </Md3Button>
          </div>
        </div>
      </section>

      <section
        v-if="hasManifestEntry"
        class="exercise-authoring-sidebar__section exercise-authoring-sidebar__section--manifest"
      >
        <header class="exercise-authoring-sidebar__section-header">
          <h3 class="md-typescale-title-medium font-semibold text-on-surface">
            Configurações de publicação
          </h3>
        </header>

        <label
          class="flex items-center gap-2 rounded-xl border border-outline/60 bg-surface-container p-3"
        >
          <input
            id="exercise-manifest-available"
            data-testid="exercise-availability-toggle"
            type="checkbox"
            class="h-4 w-4 rounded border border-outline"
            v-model="manifestAvailable"
          />
          <span class="text-sm text-on-surface">Disponibilizar aos estudantes</span>
        </label>

        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Link alternativo</span>
          <input
            v-model="manifestLink"
            type="url"
            inputmode="url"
            autocomplete="off"
            placeholder="https://exemplo.com/exercicio"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="md-typescale-label-large text-on-surface">Tipo do recurso</span>
          <select
            v-model="manifestType"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <option
              v-for="option in exerciseManifestTypeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <fieldset
          class="md-stack md-stack-2 rounded-xl border border-outline/60 bg-surface-container p-3"
        >
          <legend class="px-1 text-sm font-semibold text-on-surface">Metadados de geração</legend>
          <label class="flex flex-col gap-1">
            <span class="md-typescale-label-large text-on-surface">Gerado por</span>
            <input
              v-model="manifestGeneratedBy"
              type="text"
              autocomplete="off"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="md-typescale-label-large text-on-surface">Modelo</span>
            <input
              v-model="manifestModel"
              type="text"
              autocomplete="off"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="md-typescale-label-large text-on-surface">Timestamp</span>
            <input
              v-model="manifestTimestamp"
              type="text"
              autocomplete="off"
              placeholder="2025-01-31T12:00:00Z"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
        </fieldset>
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
              <p
                v-if="formatBlockSummary(block)"
                class="mt-2 text-xs leading-5 text-on-surface-variant"
              >
                {{ formatBlockSummary(block) }}
              </p>
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
import { computed, ref, watch, type Component, type Ref, type WritableComputedRef } from 'vue';
import { ArrowDown, ArrowUp, GripVertical, PenSquare, Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import AuthoringDraggableList from '@/components/authoring/AuthoringDraggableList.vue';
import { MetadataListEditor, type LessonEditorModel } from '@/composables/useLessonEditorModel';
import type { LessonAuthoringBlock } from '@/composables/useAuthoringBlockKeys';

type DragEndEvent = { oldIndex?: number | null; newIndex?: number | null };

type ExerciseManifestEntry = Record<string, unknown> & {
  available?: boolean;
  link?: string;
  type?: string;
  metadata?: Record<string, unknown> | null;
};

const props = defineProps<{
  exerciseModel: Ref<LessonEditorModel | null>;
  manifestEntry?: Ref<ExerciseManifestEntry | null>;
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
const isMetadataEditing = ref(false);
const metadataSectionId = 'exercise-metadata-editor';

const hasManifestEntry = computed(() => Boolean(props.manifestEntry?.value));

watch(exerciseModel, (value) => {
  if (!value) {
    isMetadataEditing.value = false;
  }
});

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

type ExerciseMetadataSummaryItem =
  | { label: string; value: string; type?: 'text' }
  | { label: string; values: string[]; type: 'chips' };

const metadataSummaryItems = computed<ExerciseMetadataSummaryItem[]>(() => {
  const model = exerciseModel.value;
  if (!model) {
    return [];
  }

  ensureExerciseModelDefaults(model);

  const items: ExerciseMetadataSummaryItem[] = [];
  const title = (model.title ?? '').trim();
  items.push({ label: 'Título', value: title || 'Sem título', type: 'text' });

  const summary = (model.summary ?? '').trim();
  if (summary) {
    items.push({ label: 'Resumo', value: summary, type: 'text' });
  }

  if (model.tags.length) {
    items.push({ label: 'Tags', values: [...model.tags], type: 'chips' });
  }

  return items;
});

const metadataActionLabel = computed(() =>
  isMetadataEditing.value ? 'Fechar metadados' : 'Editar metadados'
);

const exerciseManifestTypeOptions = [
  { value: '', label: 'Sem classificação' },
  { value: 'worksheet', label: 'Lista de exercícios' },
  { value: 'project', label: 'Projeto guiado' },
  { value: 'assessment', label: 'Avaliação' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'lab', label: 'Laboratório' },
] as const;

function ensureManifestEntry(): ExerciseManifestEntry | null {
  return props.manifestEntry?.value ?? null;
}

function sanitizeManifestInput(value: string): string {
  return value.trim();
}

function updateManifestMetadataField(key: string, value: string) {
  const entry = ensureManifestEntry();
  if (!entry) return;
  const normalized = sanitizeManifestInput(value);
  const metadata =
    entry.metadata && typeof entry.metadata === 'object'
      ? (entry.metadata as Record<string, unknown>)
      : {};

  if (normalized) {
    metadata[key] = normalized;
    entry.metadata = { ...metadata };
  } else {
    if (metadata[key] !== undefined) {
      delete metadata[key];
    }
    entry.metadata = Object.keys(metadata).length ? { ...metadata } : undefined;
  }
}

function readManifestMetadataField(key: string): string {
  const entry = ensureManifestEntry();
  if (!entry || !entry.metadata || typeof entry.metadata !== 'object') {
    return '';
  }
  const value = (entry.metadata as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

const manifestAvailable = computed({
  get: () => {
    const entry = ensureManifestEntry();
    if (!entry) return true;
    return entry.available !== false;
  },
  set: (value: boolean) => {
    const entry = ensureManifestEntry();
    if (!entry) return;
    entry.available = Boolean(value);
  },
});

const manifestLink = computed({
  get: () => {
    const entry = ensureManifestEntry();
    if (!entry) return '';
    return typeof entry.link === 'string' ? entry.link : '';
  },
  set: (value: string) => {
    const entry = ensureManifestEntry();
    if (!entry) return;
    const normalized = sanitizeManifestInput(value);
    if (normalized) {
      entry.link = normalized;
    } else {
      delete entry.link;
    }
  },
});

const manifestType = computed({
  get: () => {
    const entry = ensureManifestEntry();
    if (!entry) return '';
    return typeof entry.type === 'string' ? entry.type : '';
  },
  set: (value: string) => {
    const entry = ensureManifestEntry();
    if (!entry) return;
    const normalized = sanitizeManifestInput(value);
    if (normalized) {
      entry.type = normalized;
    } else {
      delete entry.type;
    }
  },
});

const manifestGeneratedBy = computed({
  get: () => readManifestMetadataField('generatedBy'),
  set: (value: string) => updateManifestMetadataField('generatedBy', value),
});

const manifestModel = computed({
  get: () => readManifestMetadataField('model'),
  set: (value: string) => updateManifestMetadataField('model', value),
});

const manifestTimestamp = computed({
  get: () => readManifestMetadataField('timestamp'),
  set: (value: string) => updateManifestMetadataField('timestamp', value),
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

function extractFirstText(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = extractFirstText(item);
      if (text) {
        return text;
      }
    }
    return '';
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.text === 'string') {
      return record.text;
    }
    if (typeof record.description === 'string') {
      return record.description;
    }
    if (Array.isArray(record.items)) {
      return extractFirstText(record.items);
    }
    if (typeof record.content === 'string' || Array.isArray(record.content)) {
      return extractFirstText(record.content);
    }
    if (typeof record.prompt === 'string') {
      return record.prompt;
    }
  }
  return '';
}

function formatBlockSummary(block: LessonAuthoringBlock) {
  if (!block || typeof block !== 'object') {
    return '';
  }
  const record = block as Record<string, unknown>;
  if (typeof record.summary === 'string') {
    return record.summary;
  }
  if (typeof record.description === 'string') {
    return record.description;
  }
  if (typeof record.prompt === 'string') {
    return record.prompt;
  }
  const text = extractFirstText(record.content ?? record.richContent ?? record.body);
  if (typeof text === 'string' && text.trim().length) {
    const trimmed = text.trim();
    return trimmed.length > 140 ? `${trimmed.slice(0, 137)}…` : trimmed;
  }
  return '';
}

function toggleMetadataEditing() {
  if (!hasExerciseModel.value) {
    return;
  }
  isMetadataEditing.value = !isMetadataEditing.value;
  if (isMetadataEditing.value && typeof window !== 'undefined') {
    window.requestAnimationFrame(() => {
      const section = document.getElementById(metadataSectionId);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
</script>

<style scoped>
.exercise-authoring-sidebar {
  width: 100%;
}

.exercise-authoring-sidebar__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  background: color-mix(in srgb, var(--md-sys-color-surface) 86%, transparent 14%);
}

.exercise-authoring-sidebar__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.exercise-authoring-sidebar__metadata-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.exercise-authoring-sidebar__metadata-grid {
  display: grid;
  gap: 0.75rem;
}

.exercise-authoring-sidebar__metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
}

.metadata-value {
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--md-sys-color-on-surface);
}

.metadata-value--chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

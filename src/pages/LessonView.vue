<template>
  <section class="page-section">
    <nav class="page-breadcrumb">
      <Md3Button
        class="page-breadcrumb__link"
        variant="text"
        :as="RouterLink"
        :to="{ name: 'course-home', params: { courseId } }"
      >
        <template #leading>
          <ArrowLeft class="md-icon md-icon--sm" aria-hidden="true" />
        </template>
        Voltar para a disciplina
      </Md3Button>
      <ChevronRight class="md-icon md-icon--sm page-breadcrumb__separator" />
      <span class="page-breadcrumb__current">{{ lessonTitle }}</span>
    </nav>

    <TeacherAuthoringWorkspace
      v-if="showTeacherWorkspace"
      v-model:view="workspaceView"
      class="lesson-view__workspace"
      :editor-enabled="showAuthoringPanel"
      :default-view="showAuthoringPanel ? 'editor' : 'preview'"
    >
      <template #sidebar>
        <LessonAuthoringSidebar
          v-if="showAuthoringPanel"
          :lesson-model="lessonEditor.lessonModel"
          v-model:manifest-entry="lessonManifestEntry"
          :tags-field="lessonEditor.tagsField"
          :create-array-field="lessonEditor.useArrayField"
          :blocks="lessonBlocks"
          :draggable-blocks="displayedBlocks"
          :selected-block-index="selectedBlockIndex"
          :supported-block-types="supportedBlockTypes"
          :new-block-type="newBlockType"
          :status-label="statusLabel"
          :status-tone="statusTone"
          :status-icon="statusIcon"
          :status-icon-class="statusIconClass"
          :error-message="lessonAuthoringError"
          :success-message="lessonAuthoringSuccess"
          :can-revert="lessonCanRevert"
          :on-revert="revertLessonAuthoringChanges"
          :on-insert-block="insertBlock"
          :on-select-block="selectBlock"
          :on-move-block="moveBlock"
          :on-remove-block="removeBlock"
          :on-update-new-block-type="updateNewBlockType"
          :on-update-draggable-blocks="updateDraggableBlocks"
          :on-drag-end="handleBlockDragEnd"
          :editor-section-id="editorSectionId"
        />
      </template>

      <template #editor>
        <LessonBlockEditorPanel
          v-if="showAuthoringPanel"
          :selected-block="selectedBlock"
          :block-editor-component="blockEditorComponent"
          :editor-section-id="editorSectionId"
          :on-update-block="replaceSelectedBlock"
        />
      </template>

      <template #preview>
        <div class="teacher-preview-shell">
          <article v-if="lessonContent" class="card max-w-none md-stack md-stack-6 p-8">
            <header class="md-stack md-stack-2">
              <p
                class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant opacity-80"
              >
                Conteúdo da aula
              </p>
              <h2 class="text-headline-medium font-semibold text-on-surface">
                {{ lessonTitle }}
              </h2>
              <p v-if="lessonObjective" class="text-body-large !mt-4">{{ lessonObjective }}</p>
              <LessonOverview
                :summary="lessonSummary"
                :duration="lessonDuration"
                :modality="lessonModality"
                :tags="lessonTags"
              />
            </header>

            <LessonReadiness
              :skills="lessonSkills"
              :outcomes="lessonOutcomes"
              :prerequisites="lessonPrerequisites"
            />

            <div class="divider" role="presentation"></div>

            <div ref="lessonContentRoot" class="lesson-content prose max-w-none dark:prose-invert">
              <LessonRenderer :data="lessonContent" />
            </div>
          </article>

          <article
            v-else
            class="card max-w-none md-stack md-stack-3 p-8 text-center text-body-medium text-on-surface-variant"
          >
            Não foi possível carregar esta aula.
          </article>
        </div>
      </template>
    </TeacherAuthoringWorkspace>

    <div v-else class="teacher-preview-shell">
      <article v-if="lessonContent" class="card max-w-none md-stack md-stack-6 p-8">
        <header class="md-stack md-stack-2">
          <p
            class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant opacity-80"
          >
            Conteúdo da aula
          </p>
          <h2 class="text-headline-medium font-semibold text-on-surface">
            {{ lessonTitle }}
          </h2>
          <p v-if="lessonObjective" class="text-body-large !mt-4">{{ lessonObjective }}</p>
          <LessonOverview
            :summary="lessonSummary"
            :duration="lessonDuration"
            :modality="lessonModality"
            :tags="lessonTags"
          />
        </header>

        <LessonReadiness
          :skills="lessonSkills"
          :outcomes="lessonOutcomes"
          :prerequisites="lessonPrerequisites"
        />

        <div class="divider" role="presentation"></div>

        <div ref="lessonContentRoot" class="lesson-content prose max-w-none dark:prose-invert">
          <LessonRenderer :data="lessonContent" />
        </div>
      </article>

      <article
        v-else
        class="card max-w-none md-stack md-stack-3 p-8 text-center text-body-medium text-on-surface-variant"
      >
        Não foi possível carregar esta aula.
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch, useId } from 'vue';
import { RouterLink } from 'vue-router';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  LoaderCircle,
} from 'lucide-vue-next';
import LessonReadiness from '@/components/lesson/LessonReadiness.vue';
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import LessonOverview from '@/components/lesson/LessonOverview.vue';
import Md3Button from '@/components/Md3Button.vue';
import LessonAuthoringSidebar from '@/components/lesson/LessonAuthoringSidebar.vue';
import LessonBlockEditorPanel from '@/components/lesson/LessonBlockEditorPanel.vue';
import TeacherAuthoringWorkspace from '@/components/teacher/TeacherAuthoringWorkspace.vue';
import {
  useLessonEditorModel,
  resolveLessonBlockEditor,
  type LessonEditorModel,
} from '@/composables/useLessonEditorModel';
import { useTeacherMode } from '@/composables/useTeacherMode';
import { useLessonViewController, type LessonManifest } from './LessonView.logic';
import { useTeacherContentEditor } from '@/services/useTeacherContentEditor';
import { supportedBlockTypes, type LessonBlock } from '@/components/lesson/blockRegistry';
import {
  applyAuthoringBlockKeys,
  stripAuthoringBlockKeys,
  ensureAuthoringBlockKey,
  inheritAuthoringBlockKey,
  type LessonAuthoringBlock,
} from '@/composables/useAuthoringBlockKeys';
import { createPrismHighlightHandler } from '@/utils/prismHighlight';
import { defaultBlockTemplates } from '@/components/authoring/defaultBlockTemplates';
import { useAuthoringSaveTracker } from '@/composables/useAuthoringSaveTracker';
import type { LessonContent as LessonRendererContent } from '@/pages/course/LessonRenderer.logic';

function cloneDeep<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch (_error) {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

type LessonFilePayload = Record<string, unknown> & { content?: LessonBlock[] };

type LessonManifestEntry = LessonManifest & Record<string, unknown>;

type LessonManifestFile = Record<string, unknown> & {
  entries?: LessonManifestEntry[];
};

function toLessonEditorModel(raw: LessonFilePayload): LessonEditorModel {
  const { content, ...rest } = raw;
  return {
    ...(rest as LessonEditorModel),
    blocks: Array.isArray(content) ? applyAuthoringBlockKeys(cloneDeep(content)) : [],
  };
}

function toLessonFilePayload(
  model: LessonEditorModel,
  base: LessonFilePayload | null
): LessonFilePayload {
  const target = base ? cloneDeep(base) : ({} as LessonFilePayload);
  const { blocks, ...rest } = model;
  Object.assign(target, rest);
  if (Array.isArray(blocks)) {
    target.content = cloneDeep(stripAuthoringBlockKeys(blocks));
  } else {
    target.content = [];
  }
  delete (target as LessonFilePayload & { blocks?: unknown }).blocks;
  return target;
}

function extractLessonManifestEntry(
  raw: LessonManifestFile | null,
  lessonId: string
): LessonManifestEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const entries = Array.isArray(raw.entries) ? raw.entries : [];
  const entry = entries.find((item) => item && typeof item === 'object' && item.id === lessonId);
  if (!entry) {
    return null;
  }

  return cloneDeep(entry);
}

function sanitizeManifestString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function sanitizeLessonManifestEntry(
  entry: LessonManifestEntry | null,
  lessonId: string
): LessonManifestEntry | null {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const sanitized: LessonManifestEntry = { id: lessonId };

  for (const [key, value] of Object.entries(entry)) {
    if (key === 'metadata') continue;
    if (key === 'available') {
      sanitized.available = Boolean(value);
      continue;
    }
    if (key === 'link' || key === 'type') {
      const normalized = sanitizeManifestString(value);
      if (normalized) {
        sanitized[key] = normalized;
      }
      continue;
    }
    if (key === 'id') {
      continue;
    }
    sanitized[key] = cloneDeep(value);
  }

  if (entry.metadata && typeof entry.metadata === 'object') {
    const metadata: Record<string, unknown> = {};
    for (const [metaKey, metaValue] of Object.entries(entry.metadata)) {
      const normalized = sanitizeManifestString(metaValue) ?? metaValue;
      if (normalized !== undefined && normalized !== null && normalized !== '') {
        metadata[metaKey] = normalized;
      }
    }
    if (Object.keys(metadata).length > 0) {
      sanitized.metadata = metadata;
    }
  }

  return sanitized;
}

function mergeLessonManifestEntry(
  base: LessonManifestEntry | null,
  update: LessonManifestEntry | null,
  lessonId: string
): LessonManifestEntry {
  const target: LessonManifestEntry = base ? cloneDeep(base) : { id: lessonId };
  const sanitized = sanitizeLessonManifestEntry(update, lessonId);

  if (!sanitized) {
    return target;
  }

  const keysToClear: Array<keyof LessonManifestEntry> = ['link', 'type', 'metadata'];
  for (const key of keysToClear) {
    if (!(key in sanitized)) {
      delete target[key];
    }
  }

  if ('available' in sanitized) {
    target.available = Boolean(sanitized.available);
  }

  for (const [key, value] of Object.entries(sanitized)) {
    if (key === 'available') continue;
    if (key === 'id') {
      target.id = lessonId;
      continue;
    }
    if (value === undefined) {
      delete (target as Record<string, unknown>)[key];
    } else {
      (target as Record<string, unknown>)[key] = cloneDeep(value);
    }
  }

  return target;
}

function toLessonManifestFile(
  entry: LessonManifestEntry | null,
  base: LessonManifestFile | null,
  lessonId: string
): LessonManifestFile {
  const manifest = base ? cloneDeep(base) : ({} as LessonManifestFile);
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
  const index = entries.findIndex(
    (item) => item && typeof item === 'object' && item.id === lessonId
  );
  const current = index >= 0 ? entries[index] : null;
  const merged = mergeLessonManifestEntry(current, entry, lessonId);
  const nextEntries = [...entries];

  if (index >= 0) {
    nextEntries.splice(index, 1, merged);
  } else {
    nextEntries.push(merged);
  }

  manifest.entries = nextEntries;
  return manifest;
}

type WorkspaceView = 'editor' | 'preview';

const workspaceView = ref<WorkspaceView>('editor');
const highlightLessonContent = createPrismHighlightHandler();
const lessonContentRoot = ref<HTMLElement | null>(null);

const HIGHLIGHT_DEBOUNCE_MS = 300;

type BlockSnapshot = {
  key: string | null;
  fingerprint: string;
};

const blockSnapshots = shallowRef<BlockSnapshot[]>([]);
let highlightTimer: ReturnType<typeof setTimeout> | null = null;
let highlightPendingForce = false;
const highlightPendingKeys = new Set<string>();

function sanitizeOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  return value;
}

function sanitizeOptionalNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return value;
}

function sanitizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
}

const lessonBlocks = computed<LessonAuthoringBlock[]>(
  () => (lessonEditor.lessonModel.value?.blocks ?? []) as LessonAuthoringBlock[]
);
const selectedBlockIndex = ref(0);
const editorSectionId = `lesson-authoring-selected-block-${useId()}`;
const newBlockType = ref<string>(supportedBlockTypes[0] ?? 'contentBlock');
const pendingReorder = ref<LessonAuthoringBlock[] | null>(null);
const displayedBlocks = computed<LessonAuthoringBlock[]>(
  () => pendingReorder.value ?? lessonBlocks.value
);

const selectedBlock = computed<LessonAuthoringBlock | null>(
  () => lessonBlocks.value[selectedBlockIndex.value] ?? null
);

const blockEditorComponent = computed(() =>
  resolveLessonBlockEditor(selectedBlock.value as LessonBlock | null)
);

type DragEndEvent = { oldIndex?: number | null; newIndex?: number | null };

function updateNewBlockType(value: string) {
  if (!value) {
    return;
  }
  newBlockType.value = value;
}

function updateDraggableBlocks(value: LessonAuthoringBlock[]) {
  pendingReorder.value = [...value];
}

function createBlockPayload(type: string): LessonAuthoringBlock {
  const template = defaultBlockTemplates[type];
  const baseBlock = template ? structuredClone(template) : ({ type } as LessonBlock);
  return ensureAuthoringBlockKey(baseBlock);
}

function updateBlocks(next: LessonAuthoringBlock[]) {
  if (!lessonEditor.lessonModel.value) return;
  lessonEditor.lessonModel.value.blocks = next;
}

function insertBlock(index?: number) {
  if (!lessonEditor.lessonModel.value) return;
  const targetIndex = typeof index === 'number' ? index + 1 : lessonBlocks.value.length;
  const nextBlocks = [...lessonBlocks.value];
  nextBlocks.splice(targetIndex, 0, createBlockPayload(newBlockType.value));
  updateBlocks(nextBlocks);
  selectBlock(targetIndex);
}

function moveBlock(index: number, direction: 1 | -1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= lessonBlocks.value.length) return;
  const nextBlocks = [...lessonBlocks.value];
  const [item] = nextBlocks.splice(index, 1);
  if (!item) return;
  nextBlocks.splice(nextIndex, 0, item);
  pendingReorder.value = nextBlocks;
  commitPendingBlockOrder({ oldIndex: index, newIndex: nextIndex });
}

function commitPendingBlockOrder(event?: DragEndEvent) {
  if (!lessonEditor.lessonModel.value) return;
  const current = (lessonEditor.lessonModel.value.blocks ?? []) as LessonAuthoringBlock[];
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

  const currentByKey = new Map(current.map((block) => [block.__uiKey, block]));
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
  if (!lessonEditor.lessonModel.value) return;
  if (!Array.isArray(lessonEditor.lessonModel.value.blocks)) return;
  const index = selectedBlockIndex.value;
  if (index < 0 || index >= lessonEditor.lessonModel.value.blocks.length) return;

  const nextBlocks = [...(lessonEditor.lessonModel.value.blocks as LessonAuthoringBlock[])];
  const current = nextBlocks[index];
  nextBlocks.splice(index, 1, inheritAuthoringBlockKey(current, nextBlock));
  updateBlocks(nextBlocks);
}

function removeBlock(index: number) {
  const previousSelection = selectedBlockIndex.value;
  const nextBlocks = lessonBlocks.value.filter((_, blockIndex) => blockIndex !== index);
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

function selectBlock(index: number) {
  if (index < 0) {
    selectedBlockIndex.value = 0;
    return;
  }
  selectedBlockIndex.value = Math.min(index, Math.max(lessonBlocks.value.length - 1, 0));
}

function cancelHighlightTimer() {
  if (highlightTimer) {
    clearTimeout(highlightTimer);
    highlightTimer = null;
  }
}

function escapeSelector(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/['"\\]/g, '\\$&');
}

function fingerprintBlock(block: LessonBlock): string {
  if (!block || typeof block !== 'object') {
    return '';
  }
  const blockRecord = block as Record<string, unknown>;
  const { __uiKey: _removed, ...rest } = blockRecord;
  try {
    return JSON.stringify(rest);
  } catch (_error) {
    return '';
  }
}

function collectBlockChanges(blocks: LessonBlock[]): { keys: string[]; force: boolean } {
  const previousSnapshots = blockSnapshots.value;
  const previousMap = new Map<string, string>();
  const remaining = new Set<string>();

  previousSnapshots.forEach((snapshot) => {
    if (snapshot.key) {
      previousMap.set(snapshot.key, snapshot.fingerprint);
      remaining.add(snapshot.key);
    }
  });

  const nextSnapshots: BlockSnapshot[] = [];
  const changedKeys: string[] = [];
  let force = false;

  blocks.forEach((block) => {
    const blockRecord = block as Record<string, unknown>;
    const key = typeof blockRecord?.__uiKey === 'string' ? (blockRecord.__uiKey as string) : null;
    if (!key) {
      force = true;
    }
    const fingerprint = fingerprintBlock(block);
    nextSnapshots.push({ key, fingerprint });

    if (key) {
      const previousFingerprint = previousMap.get(key);
      if (!previousFingerprint || previousFingerprint !== fingerprint) {
        changedKeys.push(key);
      }
      remaining.delete(key);
    }
  });

  if (remaining.size > 0) {
    force = true;
  }

  blockSnapshots.value = nextSnapshots;
  return { keys: changedKeys, force };
}

function scheduleHighlight(
  options: { force?: boolean; keys?: string[]; immediate?: boolean } = {}
) {
  const { force = false, keys = [], immediate = false } = options;

  if (force) {
    highlightPendingForce = true;
    highlightPendingKeys.clear();
  } else if (!highlightPendingForce) {
    keys.forEach((key) => {
      if (key) {
        highlightPendingKeys.add(key);
      }
    });
  }

  cancelHighlightTimer();

  if (workspaceView.value !== 'preview') {
    return;
  }

  const runHighlight = () => {
    highlightTimer = null;
    void applyHighlight();
  };

  if (immediate) {
    runHighlight();
  } else {
    highlightTimer = setTimeout(runHighlight, HIGHLIGHT_DEBOUNCE_MS);
  }
}

async function applyHighlight() {
  if (workspaceView.value !== 'preview') {
    return;
  }

  const forceFull = highlightPendingForce;
  const pendingKeys = Array.from(highlightPendingKeys);
  highlightPendingForce = false;
  highlightPendingKeys.clear();

  await nextTick();

  const root = lessonContentRoot.value;
  if (!root) {
    return;
  }

  const targetElements = new Set<Element>();

  if (!forceFull) {
    pendingKeys.forEach((key) => {
      if (!key) return;
      const blockSelector = `[data-authoring-block="${escapeSelector(key)}"]`;
      const blockElement = root.querySelector(blockSelector);
      if (!blockElement) return;
      blockElement.querySelectorAll('pre code').forEach((element) => {
        if (element instanceof Element) {
          targetElements.add(element);
        }
      });
    });
  }

  const context: Record<string, unknown> = { root };
  if (!forceFull && targetElements.size > 0) {
    context.targets = Array.from(targetElements);
  }

  await highlightLessonContent(context);
}

const controller = useLessonViewController({
  highlight: async () => {
    scheduleHighlight({ force: true });
  },
});

const lessonEditor = useLessonEditorModel();
const { isAuthoringEnabled } = useTeacherMode();

const lessonContentPath = computed(() => {
  const file = controller.lessonContentFile.value;
  if (!file) {
    return null;
  }
  return `courses/${controller.courseId.value}/lessons/${file}`;
});

const lessonManifestPath = computed(() => `courses/${controller.courseId.value}/lessons.json`);

const lessonManifestEntry = ref<LessonManifestEntry | null>(null);

const lessonManifestSync = useTeacherContentEditor<LessonManifestEntry | null, LessonManifestFile>({
  path: lessonManifestPath,
  model: lessonManifestEntry,
  setModel: (value) => {
    lessonManifestEntry.value = value ? cloneDeep(value) : null;
    controller.setManifestEntry(cloneDeep(value ?? null));
  },
  fromRaw: (raw) => extractLessonManifestEntry(raw ?? null, controller.lessonId.value),
  toRaw: (entry, base) => toLessonManifestFile(entry, base ?? null, controller.lessonId.value),
});

const lessonContentSync = useTeacherContentEditor<LessonEditorModel, LessonFilePayload>({
  path: lessonContentPath,
  model: lessonEditor.lessonModel,
  setModel: lessonEditor.setLessonModel,
  fromRaw: (raw) => toLessonEditorModel(raw),
  toRaw: (model, base) => toLessonFilePayload(model, base ?? null),
});

const authoringState = computed(() => ({
  lesson: lessonEditor.lessonModel.value,
  manifest: lessonManifestEntry.value,
}));

const combinedSaving = computed(
  () => lessonContentSync.saving.value || lessonManifestSync.saving.value
);
const combinedPending = computed(
  () => lessonContentSync.hasPendingChanges.value || lessonManifestSync.hasPendingChanges.value
);
const combinedSaveError = computed(
  () => lessonContentSync.saveError.value ?? lessonManifestSync.saveError.value
);

const lessonAuthoringError = computed(() => {
  return (
    lessonContentSync.loadError.value ??
    lessonManifestSync.loadError.value ??
    lessonContentSync.saveError.value ??
    lessonManifestSync.saveError.value ??
    null
  );
});
const lessonAuthoringSuccess = computed(
  () => lessonContentSync.successMessage.value ?? lessonManifestSync.successMessage.value
);
const lessonCanRevert = computed(() => combinedPending.value);

const { status, statusLabel, statusTone } = useAuthoringSaveTracker(authoringState, {
  saving: combinedSaving,
  hasPendingChanges: combinedPending,
  saveError: combinedSaveError,
});

function revertLessonAuthoringChanges() {
  lessonContentSync.revertChanges();
  lessonManifestSync.revertChanges();
}

let previousManifestStatus = { saving: false, pending: false };
watch(
  () => ({
    saving: Boolean(lessonManifestSync.saving.value),
    pending: Boolean(lessonManifestSync.hasPendingChanges.value),
  }),
  ({ saving, pending }) => {
    if (!saving && !pending && (previousManifestStatus.saving || previousManifestStatus.pending)) {
      controller.setManifestEntry(cloneDeep(lessonManifestEntry.value ?? null));
    }
    previousManifestStatus = { saving, pending };
  },
  { immediate: true }
);

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

const authoringLesson = computed(() => lessonEditor.lessonModel.value);
const lessonContent = computed<LessonRendererContent | null>(() => {
  const base = controller.lessonData.value;
  if (!base) {
    return null;
  }

  const edited = authoringLesson.value;
  const { blocks: editedBlocks, ...editedRest } = edited ?? {};

  const normalizedContent = Array.isArray(editedBlocks) ? editedBlocks : base.content;
  const baseTags = sanitizeStringArray(base.tags) ?? [];
  const baseObjectives = sanitizeStringArray(base.objectives) ?? [];
  const baseCompetencies = sanitizeStringArray(base.competencies) ?? [];
  const baseSkills = sanitizeStringArray(base.skills) ?? [];
  const baseOutcomes = sanitizeStringArray(base.outcomes) ?? [];
  const basePrerequisites = sanitizeStringArray(base.prerequisites) ?? [];

  const normalized: LessonRendererContent = {
    ...base,
    ...editedRest,
    title: sanitizeOptionalString(editedRest.title) ?? base.title,
    summary: sanitizeOptionalString(editedRest.summary) ?? base.summary,
    objective: sanitizeOptionalString(editedRest.objective) ?? base.objective,
    modality: sanitizeOptionalString(editedRest.modality) ?? base.modality,
    duration:
      sanitizeOptionalNumber(editedRest.duration) ??
      sanitizeOptionalNumber(base.duration) ??
      undefined,
    tags: sanitizeStringArray(editedRest.tags) ?? baseTags,
    objectives: sanitizeStringArray(editedRest.objectives) ?? baseObjectives,
    competencies: sanitizeStringArray(editedRest.competencies) ?? baseCompetencies,
    skills: sanitizeStringArray(editedRest.skills) ?? baseSkills,
    outcomes: sanitizeStringArray(editedRest.outcomes) ?? baseOutcomes,
    prerequisites: sanitizeStringArray(editedRest.prerequisites) ?? basePrerequisites,
    content: Array.isArray(normalizedContent) ? normalizedContent : [],
  };

  return normalized;
});

const showTeacherWorkspace = computed(() => isAuthoringEnabled.value);

const showAuthoringPanel = computed(
  () =>
    isAuthoringEnabled.value &&
    lessonContentSync.serviceAvailable &&
    lessonManifestSync.serviceAvailable
);

watch(lessonBlocks, (current) => {
  if (!current.length) {
    selectedBlockIndex.value = 0;
    return;
  }
  if (selectedBlockIndex.value > current.length - 1) {
    selectBlock(current.length - 1);
  }
});

watch(
  showAuthoringPanel,
  (available, previous) => {
    if (!available) {
      workspaceView.value = 'preview';
    } else if (!previous && available) {
      workspaceView.value = 'editor';
    }
  },
  { immediate: true }
);

watch(
  () => workspaceView.value,
  (view) => {
    if (view === 'preview') {
      scheduleHighlight({ force: true, immediate: true });
    } else {
      cancelHighlightTimer();
    }
  },
  { immediate: true }
);

watch(
  () => lessonContent.value?.content ?? null,
  (blocks) => {
    if (!Array.isArray(blocks)) {
      blockSnapshots.value = [];
      highlightPendingKeys.clear();
      highlightPendingForce = false;
      cancelHighlightTimer();
      return;
    }

    const { keys, force } = collectBlockChanges(blocks as LessonBlock[]);
    if (force) {
      scheduleHighlight({ force: true });
    } else if (keys.length) {
      scheduleHighlight({ keys });
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  cancelHighlightTimer();
});

const courseId = computed(() => controller.courseId.value);
const lessonTitle = computed(() => authoringLesson.value?.title ?? controller.lessonTitle.value);
const lessonObjective = computed(
  () => authoringLesson.value?.objective ?? controller.lessonObjective.value
);
const lessonSummary = computed(
  () => authoringLesson.value?.summary ?? controller.lessonSummary.value
);
const lessonDuration = computed(
  () => authoringLesson.value?.duration ?? controller.lessonDuration.value
);
const lessonModality = computed(
  () => authoringLesson.value?.modality ?? controller.lessonModality.value
);
const lessonTags = computed(() => authoringLesson.value?.tags ?? controller.lessonTags.value);
const lessonSkills = computed(() => authoringLesson.value?.skills ?? controller.lessonSkills.value);
const lessonOutcomes = computed(
  () => authoringLesson.value?.outcomes ?? controller.lessonOutcomes.value
);
const lessonPrerequisites = computed(
  () => authoringLesson.value?.prerequisites ?? controller.lessonPrerequisites.value
);
</script>

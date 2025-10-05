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
      <span class="page-breadcrumb__current">{{ exerciseTitle }}</span>
    </nav>

    <TeacherAuthoringWorkspace
      v-model:view="workspaceView"
      class="exercise-view__workspace"
      :editor-enabled="showAuthoringPanel"
      :default-view="showAuthoringPanel ? 'editor' : 'preview'"
    >
      <template #sidebar>
        <ExerciseAuthoringSidebar
          v-if="showAuthoringPanel"
          :exercise-model="exerciseEditor.lessonModel"
          :tags-field="exerciseEditor.tagsField"
          :blocks="exerciseBlocks"
          :draggable-blocks="displayedBlocks"
          :selected-block-index="selectedBlockIndex"
          :supported-block-types="supportedBlockTypes"
          :new-block-type="newBlockType"
          :status-label="statusLabel"
          :status-tone="statusTone"
          :status-icon="statusIcon"
          :status-icon-class="statusIconClass"
          :error-message="exerciseAuthoringError"
          :success-message="exerciseAuthoringSuccess"
          :can-revert="exerciseCanRevert"
          :on-revert="exerciseContentSync.revertChanges"
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
        <ExerciseBlockEditorPanel
          v-if="showAuthoringPanel"
          :selected-block="selectedBlock"
          :block-editor-component="blockEditorComponent"
          :editor-section-id="editorSectionId"
          :on-update-block="replaceSelectedBlock"
        />
      </template>

      <template #preview>
        <div class="teacher-preview-shell">
          <article class="card max-w-none md-stack md-stack-6 p-8">
            <header class="md-stack md-stack-3">
              <div class="md-stack md-stack-2">
                <p
                  class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant opacity-80"
                >
                  Exercício
                </p>
                <h2 class="text-headline-medium font-semibold text-on-surface">
                  {{ exerciseTitle }}
                </h2>
                <p v-if="exerciseSummary" class="text-body-large !mt-4">{{ exerciseSummary }}</p>
              </div>
            </header>
            <div class="divider" role="presentation"></div>

            <component
              v-if="exerciseComponent"
              :is="exerciseComponent"
              class="lesson-content prose max-w-none dark:prose-invert"
            />
            <p v-else class="text-body-medium text-on-surface-variant">
              Conteúdo deste exercício ainda não está disponível.
            </p>
          </article>
        </div>
      </template>
    </TeacherAuthoringWorkspace>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, useId } from 'vue';
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
import Md3Button from '@/components/Md3Button.vue';
import ExerciseAuthoringSidebar from '@/components/exercise/ExerciseAuthoringSidebar.vue';
import ExerciseBlockEditorPanel from '@/components/exercise/ExerciseBlockEditorPanel.vue';
import TeacherAuthoringWorkspace from '@/components/teacher/TeacherAuthoringWorkspace.vue';
import {
  useLessonEditorModel,
  resolveLessonBlockEditor,
  type LessonEditorModel,
} from '@/composables/useLessonEditorModel';
import { useTeacherMode } from '@/composables/useTeacherMode';
import { useExerciseViewController } from './ExerciseView.logic';
import { useTeacherContentEditor } from '@/services/useTeacherContentEditor';
import { supportedBlockTypes, type LessonBlock } from '@/components/lesson/blockRegistry';
import {
  applyAuthoringBlockKeys,
  stripAuthoringBlockKeys,
  ensureAuthoringBlockKey,
  inheritAuthoringBlockKey,
  type LessonAuthoringBlock,
} from '@/composables/useAuthoringBlockKeys';
import { defaultBlockTemplates } from '@/components/authoring/defaultBlockTemplates';
import { useAuthoringSaveTracker } from '@/composables/useAuthoringSaveTracker';

function cloneDeep<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch (_error) {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

type ExerciseFilePayload = Record<string, unknown> & { content?: LessonBlock[] };

function toExerciseEditorModel(raw: ExerciseFilePayload): LessonEditorModel {
  const { content, ...rest } = raw;
  return {
    ...(rest as LessonEditorModel),
    blocks: Array.isArray(content) ? applyAuthoringBlockKeys(cloneDeep(content)) : [],
  };
}

function toExerciseFilePayload(
  model: LessonEditorModel,
  base: ExerciseFilePayload | null
): ExerciseFilePayload {
  const target = base ? cloneDeep(base) : ({} as ExerciseFilePayload);
  const { blocks, ...rest } = model;
  Object.assign(target, rest);
  if (Array.isArray(blocks)) {
    target.content = cloneDeep(stripAuthoringBlockKeys(blocks));
  } else {
    target.content = [];
  }
  delete (target as ExerciseFilePayload & { blocks?: unknown }).blocks;
  return target;
}

type WorkspaceView = 'editor' | 'preview';

const workspaceView = ref<WorkspaceView>('editor');

const controller = useExerciseViewController();

const exerciseEditor = useLessonEditorModel();
const { teacherMode } = useTeacherMode();

const exerciseBlocks = computed<LessonAuthoringBlock[]>(
  () => (exerciseEditor.lessonModel.value?.blocks ?? []) as LessonAuthoringBlock[]
);
const selectedBlockIndex = ref(0);
const editorSectionId = `exercise-authoring-selected-block-${useId()}`;
const newBlockType = ref<string>(supportedBlockTypes[0] ?? 'contentBlock');
const pendingReorder = ref<LessonAuthoringBlock[] | null>(null);
const displayedBlocks = computed<LessonAuthoringBlock[]>(
  () => pendingReorder.value ?? exerciseBlocks.value
);

const selectedBlock = computed<LessonAuthoringBlock | null>(
  () => exerciseBlocks.value[selectedBlockIndex.value] ?? null
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
  if (!exerciseEditor.lessonModel.value) return;
  exerciseEditor.lessonModel.value.blocks = next;
}

function insertBlock(index?: number) {
  if (!exerciseEditor.lessonModel.value) return;
  const targetIndex = typeof index === 'number' ? index + 1 : exerciseBlocks.value.length;
  const nextBlocks = [...exerciseBlocks.value];
  nextBlocks.splice(targetIndex, 0, createBlockPayload(newBlockType.value));
  updateBlocks(nextBlocks);
  selectBlock(targetIndex);
}

function moveBlock(index: number, direction: 1 | -1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= exerciseBlocks.value.length) return;
  const nextBlocks = [...exerciseBlocks.value];
  const [item] = nextBlocks.splice(index, 1);
  if (!item) return;
  nextBlocks.splice(nextIndex, 0, item);
  pendingReorder.value = nextBlocks;
  commitPendingBlockOrder({ oldIndex: index, newIndex: nextIndex });
}

function commitPendingBlockOrder(event?: DragEndEvent) {
  if (!exerciseEditor.lessonModel.value) return;
  const current = (exerciseEditor.lessonModel.value.blocks ?? []) as LessonAuthoringBlock[];
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
  if (!exerciseEditor.lessonModel.value) return;
  if (!Array.isArray(exerciseEditor.lessonModel.value.blocks)) return;
  const index = selectedBlockIndex.value;
  if (index < 0 || index >= exerciseEditor.lessonModel.value.blocks.length) return;

  const nextBlocks = [...(exerciseEditor.lessonModel.value.blocks as LessonAuthoringBlock[])];
  const current = nextBlocks[index];
  nextBlocks.splice(index, 1, inheritAuthoringBlockKey(current, nextBlock));
  updateBlocks(nextBlocks);
}

function removeBlock(index: number) {
  const previousSelection = selectedBlockIndex.value;
  const nextBlocks = exerciseBlocks.value.filter((_, blockIndex) => blockIndex !== index);
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
  selectedBlockIndex.value = Math.min(index, Math.max(exerciseBlocks.value.length - 1, 0));
}

const exerciseContentPath = computed(() => {
  const file = controller.exerciseFile.value;
  if (!file) {
    return null;
  }
  const jsonName = file.replace(/\.vue$/, '.json');
  return `courses/${controller.courseId.value}/exercises/${jsonName}`;
});

const exerciseContentSync = useTeacherContentEditor<LessonEditorModel, ExerciseFilePayload>({
  path: exerciseContentPath,
  model: exerciseEditor.lessonModel,
  setModel: exerciseEditor.setLessonModel,
  fromRaw: (raw) => toExerciseEditorModel(raw),
  toRaw: (model, base) => toExerciseFilePayload(model, base ?? null),
});

const exerciseAuthoringError = computed(
  () => exerciseContentSync.loadError.value ?? exerciseContentSync.saveError.value
);
const exerciseAuthoringSuccess = computed(() => exerciseContentSync.successMessage.value);
const exerciseCanRevert = computed(() => exerciseContentSync.hasPendingChanges.value);

const { status, statusLabel, statusTone } = useAuthoringSaveTracker(exerciseEditor.lessonModel, {
  saving: exerciseContentSync.saving,
  hasPendingChanges: exerciseContentSync.hasPendingChanges,
  saveError: exerciseContentSync.saveError,
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

const authoringExercise = computed(() => exerciseEditor.lessonModel.value);
const showAuthoringPanel = computed(
  () =>
    import.meta.env.DEV &&
    teacherMode.value &&
    exerciseContentSync.serviceAvailable &&
    Boolean(authoringExercise.value)
);

watch(exerciseBlocks, (current) => {
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

const courseId = computed(() => controller.courseId.value);
const exerciseTitle = computed(() => controller.exerciseTitle.value);
const exerciseSummary = computed(
  () => authoringExercise.value?.summary ?? controller.exerciseSummary.value
);
const exerciseComponent = computed(() => controller.exerciseComponent.value);
</script>

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
      v-model:view="workspaceView"
      class="lesson-view__workspace"
      :editor-enabled="showAuthoringPanel"
      :default-view="showAuthoringPanel ? 'editor' : 'preview'"
    >
      <template #editor>
        <LessonAuthoringPanel
          v-if="showAuthoringPanel"
          class="lesson-view__authoring-panel"
          :lesson-model="lessonEditor.lessonModel"
          :tags-field="lessonEditor.tagsField"
          :create-array-field="lessonEditor.useArrayField"
          :saving="lessonContentSync.saving"
          :has-pending-changes="lessonContentSync.hasPendingChanges"
          :save-error="lessonContentSync.saveError"
          :error-message="lessonAuthoringError"
          :success-message="lessonAuthoringSuccess"
          :can-revert="lessonCanRevert"
          :on-revert="lessonContentSync.revertChanges"
        />
      </template>

      <template #preview>
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
      </template>
    </TeacherAuthoringWorkspace>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';
import LessonReadiness from '@/components/lesson/LessonReadiness.vue';
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import LessonOverview from '@/components/lesson/LessonOverview.vue';
import Md3Button from '@/components/Md3Button.vue';
import LessonAuthoringPanel from '@/components/lesson/LessonAuthoringPanel.vue';
import TeacherAuthoringWorkspace from '@/components/teacher/TeacherAuthoringWorkspace.vue';
import { useLessonEditorModel, type LessonEditorModel } from '@/composables/useLessonEditorModel';
import { useTeacherMode } from '@/composables/useTeacherMode';
import { useLessonViewController } from './LessonView.logic';
import { useTeacherContentEditor } from '@/services/useTeacherContentEditor';
import type { LessonBlock } from '@/components/lesson/blockRegistry';
import {
  applyAuthoringBlockKeys,
  stripAuthoringBlockKeys,
} from '@/composables/useAuthoringBlockKeys';
import { createPrismHighlightHandler } from '@/utils/prismHighlight';

function cloneDeep<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch (_error) {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

type LessonFilePayload = Record<string, unknown> & { content?: LessonBlock[] };

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
const { teacherMode } = useTeacherMode();

const lessonContentPath = computed(() => {
  const file = controller.lessonContentFile.value;
  if (!file) {
    return null;
  }
  return `courses/${controller.courseId.value}/lessons/${file}`;
});

const lessonContentSync = useTeacherContentEditor<LessonEditorModel, LessonFilePayload>({
  path: lessonContentPath,
  model: lessonEditor.lessonModel,
  setModel: lessonEditor.setLessonModel,
  fromRaw: (raw) => toLessonEditorModel(raw),
  toRaw: (model, base) => toLessonFilePayload(model, base ?? null),
});

const lessonAuthoringError = computed(
  () => lessonContentSync.loadError.value ?? lessonContentSync.saveError.value
);
const lessonAuthoringSuccess = computed(() => lessonContentSync.successMessage.value);
const lessonCanRevert = computed(() => lessonContentSync.hasPendingChanges.value);

const authoringLesson = computed(() => lessonEditor.lessonModel.value);
const lessonContent = computed(() => {
  const base = controller.lessonData.value;
  if (!base) return null;
  const edited = authoringLesson.value;
  const content = edited?.blocks ?? base.content;
  return {
    ...base,
    ...edited,
    content,
  };
});

const showAuthoringPanel = computed(
  () =>
    import.meta.env.DEV &&
    teacherMode.value &&
    lessonContentSync.serviceAvailable &&
    Boolean(lessonContent.value)
);

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

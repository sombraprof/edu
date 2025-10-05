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

    <div class="layout layout--split">
      <article class="card layout--split__main max-w-none md-stack md-stack-6 p-8">
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

      <ExerciseAuthoringPanel
        v-if="showAuthoringPanel"
        class="layout--split__aside"
        :exercise-model="exerciseEditor.lessonModel"
        :tags-field="exerciseEditor.tagsField"
        :saving="exerciseContentSync.saving"
        :has-pending-changes="exerciseContentSync.hasPendingChanges"
        :save-error="exerciseContentSync.saveError"
        :error-message="exerciseAuthoringError"
        :success-message="exerciseAuthoringSuccess"
        :can-revert="exerciseCanRevert"
        :on-revert="exerciseContentSync.revertChanges"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import ExerciseAuthoringPanel from '@/components/exercise/ExerciseAuthoringPanel.vue';
import { useLessonEditorModel, type LessonEditorModel } from '@/composables/useLessonEditorModel';
import { useTeacherMode } from '@/composables/useTeacherMode';
import { useExerciseViewController } from './ExerciseView.logic';
import { useTeacherContentEditor } from '@/services/useTeacherContentEditor';
import type { LessonBlock } from '@/components/lesson/blockRegistry';

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
    blocks: Array.isArray(content) ? cloneDeep(content) : [],
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
    target.content = cloneDeep(blocks);
  } else {
    target.content = [];
  }
  delete (target as ExerciseFilePayload & { blocks?: unknown }).blocks;
  return target;
}

const controller = useExerciseViewController();

const exerciseEditor = useLessonEditorModel();
const { teacherMode } = useTeacherMode();

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

const authoringExercise = computed(() => exerciseEditor.lessonModel.value);
const showAuthoringPanel = computed(
  () =>
    import.meta.env.DEV &&
    teacherMode.value &&
    exerciseContentSync.serviceAvailable &&
    Boolean(authoringExercise.value)
);

const courseId = computed(() => controller.courseId.value);
const exerciseTitle = computed(() => controller.exerciseTitle.value);
const exerciseSummary = computed(
  () => authoringExercise.value?.summary ?? controller.exerciseSummary.value
);
const exerciseComponent = computed(() => controller.exerciseComponent.value);
</script>

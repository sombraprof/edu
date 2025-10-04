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
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import ExerciseAuthoringPanel from '@/components/exercise/ExerciseAuthoringPanel.vue';
import { useLessonEditorModel, type LessonEditorModel } from '@/composables/useLessonEditorModel';
import { useTeacherMode } from '@/composables/useTeacherMode';
import { useExerciseViewController } from './ExerciseView.logic';

const controller = useExerciseViewController();

const exerciseEditor = useLessonEditorModel();
const { teacherMode } = useTeacherMode();

const exerciseJsonModules = import.meta.glob('../content/courses/*/exercises/*.json');

let currentRequestId = 0;

watch(
  [() => controller.courseId.value, () => controller.exerciseFile.value],
  ([course, file]) => {
    currentRequestId += 1;
    const requestId = currentRequestId;

    if (!file) {
      exerciseEditor.setLessonModel(null);
      return;
    }

    const jsonName = file.replace(/\.vue$/, '.json');
    const jsonPath = `../content/courses/${course}/exercises/${jsonName}`;
    const loader = exerciseJsonModules[jsonPath];
    if (!loader) {
      exerciseEditor.setLessonModel(null);
      return;
    }

    loader()
      .then((mod: any) => {
        if (requestId !== currentRequestId) return;
        const payload = (mod.default ?? mod) as LessonEditorModel;
        const { content, ...rest } = payload;
        exerciseEditor.setLessonModel({
          ...(rest as LessonEditorModel),
          blocks: Array.isArray(content) ? [...content] : [],
        });
      })
      .catch((error) => {
        console.error('[ExerciseView] Failed to load exercise JSON:', error);
        if (requestId !== currentRequestId) return;
        exerciseEditor.setLessonModel(null);
      });
  },
  { immediate: true }
);

const authoringExercise = computed(() => exerciseEditor.lessonModel.value);
const showAuthoringPanel = computed(
  () => import.meta.env.DEV && teacherMode.value && Boolean(authoringExercise.value)
);

const courseId = computed(() => controller.courseId.value);
const exerciseTitle = computed(() => controller.exerciseTitle.value);
const exerciseSummary = computed(
  () => authoringExercise.value?.summary ?? controller.exerciseSummary.value
);
const exerciseComponent = computed(() => controller.exerciseComponent.value);
</script>

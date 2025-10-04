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

    <div class="layout layout--split">
      <article
        v-if="lessonContent"
        class="card layout--split__main max-w-none md-stack md-stack-6 p-8"
      >
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

        <LessonRenderer
          :data="lessonContent"
          class="lesson-content prose max-w-none dark:prose-invert"
        />
      </article>

      <article
        v-else
        class="card layout--split__main max-w-none md-stack md-stack-3 p-8 text-center text-body-medium text-on-surface-variant"
      >
        Não foi possível carregar esta aula.
      </article>

      <LessonAuthoringPanel
        v-if="showAuthoringPanel"
        class="layout--split__aside"
        :lesson-model="lessonEditor.lessonModel"
        :tags-field="lessonEditor.tagsField"
        :create-array-field="lessonEditor.useArrayField"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';
import LessonReadiness from '@/components/lesson/LessonReadiness.vue';
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import LessonOverview from '@/components/lesson/LessonOverview.vue';
import Md3Button from '@/components/Md3Button.vue';
import LessonAuthoringPanel from '@/components/lesson/LessonAuthoringPanel.vue';
import { useLessonEditorModel, type LessonEditorModel } from '@/composables/useLessonEditorModel';
import { useTeacherMode } from '@/composables/useTeacherMode';
import { useLessonViewController } from './LessonView.logic';

const controller = useLessonViewController();

const lessonEditor = useLessonEditorModel();
const { teacherMode } = useTeacherMode();

watch(
  () => controller.lessonData.value,
  (data) => {
    if (!data) {
      lessonEditor.setLessonModel(null);
      return;
    }
    const { content, ...rest } = data;
    lessonEditor.setLessonModel({
      ...(rest as LessonEditorModel),
      blocks: Array.isArray(content) ? [...content] : [],
    });
  },
  { immediate: true }
);

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
  () => import.meta.env.DEV && teacherMode.value && Boolean(lessonContent.value)
);

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

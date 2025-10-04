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

    <article v-if="lessonData" class="card max-w-none md-stack md-stack-6 p-8">
      <header class="md-stack md-stack-2">
        <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant opacity-80">
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
        :data="lessonData"
        class="lesson-content prose max-w-none dark:prose-invert"
      />
    </article>

    <article
      v-else
      class="card max-w-none md-stack md-stack-3 p-8 text-center text-body-medium text-on-surface-variant"
    >
      Não foi possível carregar esta aula.
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';
import LessonReadiness from '@/components/lesson/LessonReadiness.vue';
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import LessonOverview from '@/components/lesson/LessonOverview.vue';
import Md3Button from '@/components/Md3Button.vue';
import { useLessonViewController } from './LessonView.logic';

const controller = useLessonViewController();

const courseId = computed(() => controller.courseId.value);
const lessonTitle = computed(() => controller.lessonTitle.value);
const lessonObjective = computed(() => controller.lessonObjective.value);
const lessonSummary = computed(() => controller.lessonSummary.value);
const lessonDuration = computed(() => controller.lessonDuration.value);
const lessonModality = computed(() => controller.lessonModality.value);
const lessonTags = computed(() => controller.lessonTags.value);
const lessonSkills = computed(() => controller.lessonSkills.value);
const lessonOutcomes = computed(() => controller.lessonOutcomes.value);
const lessonPrerequisites = computed(() => controller.lessonPrerequisites.value);
const lessonData = computed(() => controller.lessonData.value);
</script>

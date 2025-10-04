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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import { useExerciseViewController } from './ExerciseView.logic';

const controller = useExerciseViewController();

const courseId = computed(() => controller.courseId.value);
const exerciseTitle = computed(() => controller.exerciseTitle.value);
const exerciseSummary = computed(() => controller.exerciseSummary.value);
const exerciseComponent = computed(() => controller.exerciseComponent.value);
</script>

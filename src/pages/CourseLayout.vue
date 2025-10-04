<template>
  <section class="course-page page-section" :aria-busy="!metaLoaded">
    <header class="course-page__hero card md-stack md-stack-5 p-6 md:p-8">
      <nav class="course-page__breadcrumbs page-breadcrumb" aria-label="Navegação">
        <Md3Button
          class="page-breadcrumb__link"
          variant="text"
          :as="RouterLink"
          :to="{ name: 'home' }"
        >
          <template #leading>
            <ArrowLeft class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Todas as disciplinas
        </Md3Button>
        <span class="page-breadcrumb__separator" aria-hidden="true">/</span>
        <span class="page-breadcrumb__current">{{ meta?.title ?? 'Disciplina' }}</span>
      </nav>
      <div class="course-page__headline md-stack md-stack-3">
        <span class="chip">Disciplina</span>
        <h1 class="text-headline-medium font-semibold text-[var(--md-sys-color-on-surface)]">
          {{ meta?.title ?? 'Disciplina' }}
        </h1>
        <p v-if="meta?.description" class="supporting-text">{{ meta.description }}</p>
      </div>
      <dl class="course-page__stats" role="presentation">
        <div>
          <dt>Instituição</dt>
          <dd>{{ meta?.institution ?? 'Atualizando dados' }}</dd>
        </div>
        <div>
          <dt>Aulas</dt>
          <dd>{{ lessonsCount }}</dd>
        </div>
        <div>
          <dt>Exercícios</dt>
          <dd>{{ exercisesCount }}</dd>
        </div>
      </dl>
    </header>

    <main>
      <router-view v-if="metaLoaded" :key="$route.fullPath" />
      <div v-else class="course-page__loading" role="status" aria-live="polite">
        Carregando informações da disciplina...
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import { useCourseLayoutController } from './CourseLayout.logic';

const controller = useCourseLayoutController();

const meta = computed(() => controller.meta.value);
const lessonsCount = computed(() => controller.lessonsCount.value);
const exercisesCount = computed(() => controller.exercisesCount.value);
const metaLoaded = computed(() => controller.metaLoaded.value);
</script>

<style scoped>
.course-page__hero {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
}

.course-page__breadcrumbs {
  color: var(--md-sys-color-on-surface-variant);
}

.course-page__headline {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
  align-items: flex-start;
}

.course-page__headline > .chip {
  align-self: flex-start;
}

.course-page__stats {
  display: grid;
  gap: var(--md-sys-spacing-3);
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.course-page__stats dt {
  font-size: var(--md-sys-typescale-label-small-size);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--md-sys-color-on-surface-variant);
}

.course-page__stats dd {
  font-size: var(--md-sys-typescale-title-large-size);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.course-page__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  border-radius: var(--md-sys-border-radius-large);
  background: color-mix(in srgb, var(--md-sys-color-surface) 92%, transparent);
  border: 1px dashed color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
  color: var(--md-sys-color-on-surface-variant);
}
</style>

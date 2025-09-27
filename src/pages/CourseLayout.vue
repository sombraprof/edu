<template>
  <section class="course-page page-section">
    <header class="course-page__hero card md-stack md-stack-5 p-6 md:p-8">
      <nav class="course-page__breadcrumbs page-breadcrumb" aria-label="Navegação">
        <router-link class="btn btn-text" :to="{ name: 'home' }">
          <ArrowLeft class="md-icon md-icon--sm" />
          Todas as disciplinas
        </router-link>
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
      <div v-else class="course-page__loading" role="status">
        Carregando informações da disciplina...
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';

interface CourseMeta {
  id: string;
  title: string;
  institution: string;
  description?: string;
}

interface LessonSummary {
  id: string;
  title: string;
}

interface ExerciseSummary {
  id: string;
  title: string;
}

const route = useRoute();
const courseId = computed(() => String(route.params.courseId ?? ''));

const meta = ref<CourseMeta | null>(null);
const lessons = ref<LessonSummary[]>([]);
const exercises = ref<ExerciseSummary[]>([]);
const metaLoaded = ref(false);

const lessonsCount = computed(() => lessons.value.length);
const exercisesCount = computed(() => exercises.value.length);

async function loadMeta(id: string) {
  try {
    const module = await import(`../content/courses/${id}/meta.json`);
    meta.value = module.default as CourseMeta;
  } catch (error) {
    console.error('[CourseLayout] Failed to load meta', error);
    meta.value = null;
  }
}

async function loadLessons(id: string) {
  try {
    const module = await import(`../content/courses/${id}/lessons.json`);
    lessons.value = (module.default as LessonSummary[]).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
    }));
  } catch (error) {
    console.error('[CourseLayout] Failed to load lessons.json', error);
    lessons.value = [];
  }
}

async function loadExercises(id: string) {
  try {
    const module = await import(`../content/courses/${id}/exercises.json`);
    exercises.value = (module.default as ExerciseSummary[]).map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
    }));
  } catch (error) {
    exercises.value = [];
  }
}

async function refreshCourse(id: string) {
  metaLoaded.value = false;
  await Promise.all([loadMeta(id), loadLessons(id), loadExercises(id)]);
  metaLoaded.value = true;
}

onMounted(() => {
  if (courseId.value) {
    refreshCourse(courseId.value);
  }
});

watch(
  () => courseId.value,
  (id) => {
    if (id) {
      refreshCourse(id);
    }
  }
);
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

<template>
  <Md3AppShell
    :title="meta?.title ?? 'Disciplina'"
    :navigation="navigationItems"
    :breadcrumbs="breadcrumbs"
    :search-value="searchQuery"
    search-placeholder="Buscar conteúdos da disciplina"
    :enable-search="true"
    :top-bar-variant="topBarVariant"
    @update:searchValue="(value) => (searchQuery = value)"
    @submit-search="applySearch"
    @clear-search="clearSearch"
    @select-navigation="handleNavigationSelect"
    @select-breadcrumb="handleBreadcrumbSelect"
  >
    <template #brand>
      <router-link to="/" class="app-brand" aria-label="Voltar para a página inicial">
        <span class="app-brand__mark" aria-hidden="true">
          <GraduationCap class="md-icon md-icon--sm" />
        </span>
        <span class="app-brand__copy">
          <span class="app-brand__subtitle">Disciplinas</span>
          <span class="app-brand__title">Prof. Tiago Sombra</span>
        </span>
        <span class="app-brand__title--mobile">Tiago Sombra</span>
      </router-link>
    </template>

    <template #top-supporting>
      <div class="course-layout__supporting" role="presentation">
        <span class="chip">Disciplina</span>
        <p v-if="meta?.description" class="supporting-text">{{ meta.description }}</p>
      </div>
    </template>

    <template #main>
      <section class="course-layout__summary" aria-labelledby="course-summary-title">
        <div class="course-layout__summary-content">
          <h2
            id="course-summary-title"
            class="text-headline-small font-semibold text-[var(--md-sys-color-on-surface)]"
          >
            Visão geral da disciplina
          </h2>
          <ul class="course-layout__summary-list" role="list">
            <li class="course-layout__summary-item">
              <span class="chip">Plano de estudos</span>
              <span class="supporting-text">Sequenciamento completo de aulas e exercícios</span>
            </li>
            <li class="course-layout__summary-item">
              <span class="chip">Materiais atualizados</span>
              <span class="supporting-text">Conteúdos alinhados ao schema unificado</span>
            </li>
            <li class="course-layout__summary-item">
              <span class="chip">Governança contínua</span>
              <span class="supporting-text">Checklists e revisões docentes recorrentes</span>
            </li>
          </ul>
        </div>
        <div class="course-layout__summary-meta">
          <p
            class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]"
          >
            Instituição
          </p>
          <p class="text-title-large font-semibold text-[var(--md-sys-color-on-surface)]">
            {{ meta?.institution ?? 'Atualizando dados' }}
          </p>
          <dl class="course-layout__summary-stats">
            <div>
              <dt class="text-label-medium text-[var(--md-sys-color-on-surface-variant)]">Aulas</dt>
              <dd class="text-headline-small font-semibold text-[var(--md-sys-color-on-surface)]">
                {{ lessons.length }}
              </dd>
            </div>
            <div>
              <dt class="text-label-medium text-[var(--md-sys-color-on-surface-variant)]">
                Exercícios
              </dt>
              <dd class="text-headline-small font-semibold text-[var(--md-sys-color-on-surface)]">
                {{ exercises.length }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <router-view v-if="metaLoaded" :key="$route.fullPath" />
      <div v-else class="course-layout__loading" role="status">
        Carregando informações da disciplina...
      </div>
    </template>

    <template #secondary>
      <div class="course-layout__panel">
        <h3 class="text-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">
          Próximas ações
        </h3>
        <ul class="course-layout__panel-list" role="list">
          <li>
            <span class="text-label-medium text-[var(--md-sys-color-primary)]">Tokens MD3</span>
            <p class="supporting-text">
              Validar cores e variantes no Storybook com a squad docente.
            </p>
          </li>
          <li>
            <span class="text-label-medium text-[var(--md-sys-color-primary)]"
              >Biblioteca didática</span
            >
            <p class="supporting-text">
              Documentar presets disciplinares para flowcharts e block diagrams.
            </p>
          </li>
          <li>
            <span class="text-label-medium text-[var(--md-sys-color-primary)]">Conteúdo</span>
            <p class="supporting-text">Revisar exercícios pendentes antes da migração técnica.</p>
          </li>
        </ul>
      </div>
    </template>
  </Md3AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
import { GraduationCap } from 'lucide-vue-next';
import Md3AppShell from '../components/layout/Md3AppShell.vue';

type RouteSection = 'overview' | 'lessons' | 'exercises';

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

interface LayoutBreadcrumb {
  id: string;
  label: string;
  icon?: string;
  to?: RouteLocationRaw;
  href?: string;
  disabled?: boolean;
}

const route = useRoute();
const router = useRouter();
const meta = ref<CourseMeta | null>(null);
const lessons = ref<LessonSummary[]>([]);
const exercises = ref<ExerciseSummary[]>([]);
const metaLoaded = ref(false);
const searchQuery = ref('');

const courseId = computed(() => String(route.params.courseId ?? ''));

const navigationItems = computed(() => [
  {
    id: 'overview',
    label: 'Visão geral',
    icon: 'layout-dashboard',
    to: { name: 'course-home', params: { courseId: courseId.value } },
  },
  {
    id: 'lessons',
    label: `Aulas (${lessons.value.length})`,
    icon: 'book-open',
    to: {
      name: 'course-home',
      params: { courseId: courseId.value },
      query: { section: 'lessons' },
    },
  },
  {
    id: 'exercises',
    label: `Exercícios (${exercises.value.length})`,
    icon: 'list-checks',
    to: {
      name: 'course-home',
      params: { courseId: courseId.value },
      query: { section: 'exercises' },
    },
  },
]);

const currentSection = computed<RouteSection>(() => {
  if (route.name === 'lesson') {
    return 'lessons';
  }
  if (route.name === 'exercise') {
    return 'exercises';
  }
  const section = typeof route.query.section === 'string' ? route.query.section : 'overview';
  if (section === 'lessons' || section === 'exercises') {
    return section;
  }
  return 'overview';
});

const breadcrumbs = computed<LayoutBreadcrumb[]>(() => {
  const crumbs: LayoutBreadcrumb[] = [
    { id: 'home', label: 'Início', icon: 'home', to: { name: 'home' } },
    {
      id: 'course',
      label: meta.value?.title ?? 'Disciplina',
      icon: 'graduation-cap',
      to: { name: 'course-home', params: { courseId: courseId.value } },
    },
  ];

  if (route.name === 'lesson' && typeof route.params.lessonId === 'string') {
    const lessonId = route.params.lessonId;
    const lesson = lessons.value.find((item) => item.id === lessonId);
    const toLesson: RouteLocationRaw = {
      name: 'lesson',
      params: { courseId: courseId.value, lessonId },
    };
    crumbs.push({
      id: `lesson-${lessonId}`,
      label: lesson?.title ?? `Aula ${lessonId}`,
      icon: 'bookmark',
      to: toLesson,
    });
  }

  if (route.name === 'exercise' && typeof route.params.exerciseId === 'string') {
    const exerciseId = route.params.exerciseId;
    const exercise = exercises.value.find((item) => item.id === exerciseId);
    const toExercise: RouteLocationRaw = {
      name: 'exercise',
      params: { courseId: courseId.value, exerciseId },
    };
    crumbs.push({
      id: `exercise-${exerciseId}`,
      label: exercise?.title ?? `Exercício ${exerciseId}`,
      icon: 'pencil',
      to: toExercise,
    });
  }

  return crumbs;
});

const topBarVariant = computed(() => (currentSection.value === 'overview' ? 'large' : 'medium'));

async function loadMeta(id: string) {
  metaLoaded.value = false;
  try {
    const module = await import(`../content/courses/${id}/meta.json`);
    meta.value = module.default as CourseMeta;
  } catch (err) {
    console.error('[CourseLayout] Failed to load meta', err);
    meta.value = null;
  } finally {
    metaLoaded.value = true;
  }
}

async function loadLessons(id: string) {
  try {
    const module = await import(`../content/courses/${id}/lessons.json`);
    lessons.value = (module.default as LessonSummary[]).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
    }));
  } catch (err) {
    console.error('[CourseLayout] Failed to load lessons.json', err);
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
  } catch (err) {
    exercises.value = [];
  }
}

function applySearch(value: string) {
  searchQuery.value = value;
  const targetSection = currentSection.value;
  const query: Record<string, string | undefined> = {};
  if (targetSection !== 'overview') {
    query.section = targetSection;
  }
  if (value) {
    query.q = value;
  }
  router
    .push({ name: 'course-home', params: { courseId: courseId.value }, query })
    .catch(() => undefined);
}

function clearSearch() {
  searchQuery.value = '';
  const targetSection = currentSection.value;
  const query: Record<string, string | undefined> = {};
  if (targetSection !== 'overview') {
    query.section = targetSection;
  }
  router
    .push({ name: 'course-home', params: { courseId: courseId.value }, query })
    .catch(() => undefined);
}

function handleNavigationSelect(id: string) {
  if (id === 'overview') {
    router
      .push({ name: 'course-home', params: { courseId: courseId.value } })
      .catch(() => undefined);
  }
  if (id === 'lessons') {
    router
      .push({
        name: 'course-home',
        params: { courseId: courseId.value },
        query: { section: 'lessons', q: searchQuery.value || undefined },
      })
      .catch(() => undefined);
  }
  if (id === 'exercises') {
    router
      .push({
        name: 'course-home',
        params: { courseId: courseId.value },
        query: { section: 'exercises', q: searchQuery.value || undefined },
      })
      .catch(() => undefined);
  }
}

function handleBreadcrumbSelect(id: string) {
  if (id === 'home') {
    router.push({ name: 'home' }).catch(() => undefined);
  }
}

onMounted(() => {
  if (courseId.value) {
    loadMeta(courseId.value);
    loadLessons(courseId.value);
    loadExercises(courseId.value);
  }
});

watch(
  () => courseId.value,
  (id) => {
    if (id) {
      loadMeta(id);
      loadLessons(id);
      loadExercises(id);
    }
  }
);

watch(
  () => route.query.q,
  (value) => {
    searchQuery.value = typeof value === 'string' ? value : '';
  },
  { immediate: true }
);
</script>

<style scoped>
.course-layout__supporting {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
}

.course-layout__summary {
  display: grid;
  gap: var(--md-sys-spacing-6);
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-shape-large);
  background-color: color-mix(in srgb, var(--md-sys-color-surface) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 20%, transparent);
}

.course-layout__summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
}

.course-layout__summary-list {
  display: grid;
  gap: var(--md-sys-spacing-3);
  padding: 0;
  margin: 0;
  list-style: none;
}

.course-layout__summary-item {
  display: grid;
  gap: var(--md-sys-spacing-1);
}

.course-layout__summary-meta {
  display: grid;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-shape-large);
  background-color: color-mix(in srgb, var(--md-sys-color-surface-container) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 14%, transparent);
}

.course-layout__summary-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--md-sys-spacing-4);
  margin: 0;
}

.course-layout__loading {
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-shape-large);
  background-color: color-mix(in srgb, var(--md-sys-color-surface) 92%, transparent);
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
}

.course-layout__panel {
  display: grid;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-shape-large);
  background-color: color-mix(in srgb, var(--md-sys-color-surface-container-high) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 16%, transparent);
}

.course-layout__panel-list {
  display: grid;
  gap: var(--md-sys-spacing-3);
  padding: 0;
  margin: 0;
  list-style: none;
}

@media (min-width: 56rem) {
  .course-layout__summary {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: start;
  }
}
</style>

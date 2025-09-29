<template>
  <section class="md-stack md-stack-8">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="pill-group" role="group" aria-label="Filtro de conteúdo">
        <button
          class="pill-item"
          :class="{ 'pill-item--active': contentFilter === 'all' }"
          :aria-pressed="contentFilter === 'all'"
          type="button"
          @click="updateSection('all')"
        >
          Tudo
        </button>
        <button
          class="pill-item"
          :class="{ 'pill-item--active': contentFilter === 'lesson' }"
          :aria-pressed="contentFilter === 'lesson'"
          type="button"
          @click="updateSection('lesson')"
        >
          Aulas
        </button>
        <button
          class="pill-item"
          :class="{ 'pill-item--active': contentFilter === 'exercise' }"
          :aria-pressed="contentFilter === 'exercise'"
          type="button"
          @click="updateSection('exercise')"
        >
          Exercícios
        </button>
      </div>
      <div class="pill-group" role="group" aria-label="Modo de visualização">
        <button
          class="pill-item"
          :class="{ 'pill-item--active': viewMode === 'grid' }"
          :aria-pressed="viewMode === 'grid'"
          type="button"
          @click="viewMode = 'grid'"
        >
          <Grid3x3 class="md-icon md-icon--sm" />
          Grade
        </button>
        <button
          class="pill-item"
          :class="{ 'pill-item--active': viewMode === 'list' }"
          :aria-pressed="viewMode === 'list'"
          type="button"
          @click="viewMode = 'list'"
        >
          <List class="md-icon md-icon--sm" />
          Lista
        </button>
      </div>
    </header>

    <div
      v-if="displayItems.length"
      :class="[viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'md-stack md-stack-4']"
    >
      <component
        v-for="item in displayItems"
        :key="item.key"
        :is="item.wrapper"
        class="card flex h-full flex-col gap-4 p-5"
        :class="cardClasses(item)"
        v-bind="item.attrs"
      >
        <div class="flex flex-wrap items-center gap-3 md-sys-typescale-body-small">
          <span class="chip" :class="typeChipClass(item)">{{
            item.type === 'lesson' ? 'Aula' : 'Exercício'
          }}</span>
          <span class="chip" :class="statusChipClass(item)">{{
            item.available ? 'Disponível' : 'Em breve'
          }}</span>
        </div>
        <div class="md-stack md-stack-2">
          <h3 class="text-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">
            {{ item.title }}
          </h3>
          <p v-if="item.description" class="supporting-text">
            {{ item.description }}
          </p>
        </div>
        <div class="mt-auto flex items-center justify-end">
          <template v-if="item.available && item.cta">
            <Md3Button
              as="span"
              variant="text"
              class="course-item__cta text-label-medium font-medium"
            >
              {{ item.cta }}
              <template #trailing>
                <ChevronRight class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
            </Md3Button>
          </template>
          <template v-else-if="!item.available">
            <span class="md-sys-typescale-body-small text-on-surface-variant"
              >Conteúdo em preparação.</span
            >
          </template>
        </div>
      </component>
    </div>
    <div v-else class="card p-8 text-center text-body-medium text-on-surface-variant">
      Nenhum conteúdo encontrado para este filtro.
      <Md3Button class="mt-4" variant="text" type="button" @click="resetFilters">
        Limpar filtros
      </Md3Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronRight, Grid3x3, List } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import { extractManifestEntries } from '@/utils/contentManifest';

interface LessonRef {
  id: string;
  title: string;
  file: string;
  available?: boolean;
  description?: string;
}

interface GenerationMetadata {
  generatedBy: string;
  model: string;
  timestamp: string;
}

interface ExerciseRef {
  id: string;
  title: string;
  description?: string;
  file?: string;
  link?: string;
  available?: boolean;
  metadata?: GenerationMetadata;
  type?: string;
}

interface ContentItem {
  key: string;
  type: 'lesson' | 'exercise';
  title: string;
  description?: string;
  available: boolean;
  cta?: string;
  wrapper: 'router-link' | 'a' | 'div';
  attrs: Record<string, unknown>;
}

const lessonIndexModules = import.meta.glob('../content/courses/*/lessons.json');
const exerciseIndexModules = import.meta.glob('../content/courses/*/exercises.json');

const route = useRoute();
const router = useRouter();
const courseId = computed(() => String(route.params.courseId ?? ''));

const lessons = ref<LessonRef[]>([]);
const exercises = ref<ExerciseRef[]>([]);
const contentFilter = ref<'all' | 'lesson' | 'exercise'>('all');
const viewMode = ref<'grid' | 'list'>('grid');

const rawSearchQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''));
const searchTerm = computed(() => rawSearchQuery.value.toLowerCase());

async function loadLessons(id: string) {
  try {
    const path = `../content/courses/${id}/lessons.json`;
    const importer = lessonIndexModules[path];
    if (!importer) throw new Error(`Lessons manifest not found for ${path}`);

    const module = await importer();
    lessons.value = extractManifestEntries<LessonRef>(module);
  } catch (err) {
    console.error('[CourseHome] Failed to load lessons.json', err);
    lessons.value = [];
  }
}

async function loadExercises(id: string) {
  try {
    const path = `../content/courses/${id}/exercises.json`;
    const importer = exerciseIndexModules[path];
    if (!importer) throw new Error(`Exercises manifest not found for ${path}`);

    const module = await importer();
    exercises.value = extractManifestEntries<ExerciseRef>(module);
  } catch (err) {
    console.warn('[CourseHome] Exercises not available', err);
    exercises.value = [];
  }
}

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

const combinedItems = computed<ContentItem[]>(() => {
  const id = courseId.value;
  const items: ContentItem[] = [];

  lessons.value.forEach((lesson) => {
    const available = lesson.available !== false;
    const attrs = available
      ? { to: { name: 'lesson', params: { courseId: id, lessonId: lesson.id } } }
      : {};
    items.push({
      key: `lesson-${lesson.id}`,
      type: 'lesson',
      title: lesson.title,
      description: lesson.description,
      available,
      cta: available ? 'Abrir aula' : undefined,
      wrapper: available ? 'router-link' : 'div',
      attrs,
    });
  });

  exercises.value.forEach((exercise) => {
    const available = exercise.available !== false && (!!exercise.file || !!exercise.link);
    let attrs: Record<string, unknown> = {};
    let wrapper: ContentItem['wrapper'] = 'div';

    if (available && exercise.file) {
      wrapper = 'router-link';
      attrs = { to: { name: 'exercise', params: { courseId: id, exerciseId: exercise.id } } };
    } else if (available && exercise.link) {
      const external = isExternal(exercise.link);
      wrapper = 'a';
      attrs = {
        href: exercise.link,
        target: external ? '_blank' : undefined,
        rel: external ? 'noreferrer' : undefined,
      };
    }

    items.push({
      key: `exercise-${exercise.id}`,
      type: 'exercise',
      title: exercise.title,
      description: exercise.description,
      available,
      cta: available ? 'Abrir material' : undefined,
      wrapper,
      attrs,
    });
  });

  return items;
});

const displayItems = computed(() =>
  combinedItems.value
    .filter((item) => contentFilter.value === 'all' || item.type === contentFilter.value)
    .filter((item) => {
      if (!searchTerm.value) {
        return true;
      }
      const haystack = `${item.title} ${item.description ?? ''}`.toLowerCase();
      return haystack.includes(searchTerm.value);
    })
);

watch(
  courseId,
  (id) => {
    if (!id) {
      lessons.value = [];
      exercises.value = [];
      return;
    }
    loadLessons(id);
    loadExercises(id);
  },
  { immediate: true }
);

watch(
  () => route.query.section,
  (section) => {
    if (section === 'lessons') {
      contentFilter.value = 'lesson';
      return;
    }
    if (section === 'exercises') {
      contentFilter.value = 'exercise';
      return;
    }
    contentFilter.value = 'all';
  },
  { immediate: true }
);

function resetFilters() {
  contentFilter.value = 'all';
  viewMode.value = 'grid';
  router.push({ name: 'course-home', params: { courseId: courseId.value } }).catch(() => undefined);
}

function updateSection(section: 'all' | 'lesson' | 'exercise') {
  contentFilter.value = section;
  const query: Record<string, string> = {};
  if (section === 'lesson') {
    query.section = 'lessons';
  } else if (section === 'exercise') {
    query.section = 'exercises';
  }
  if (rawSearchQuery.value) {
    query.q = rawSearchQuery.value;
  }
  router
    .push({ name: 'course-home', params: { courseId: courseId.value }, query })
    .catch(() => undefined);
}

function typeChipClass(item: ContentItem) {
  return item.type === 'lesson' ? 'chip--lesson' : 'chip--exercise';
}

function statusChipClass(item: ContentItem) {
  return item.available ? 'chip--available' : 'chip--upcoming';
}

function cardClasses(item: ContentItem) {
  const classes: string[] = [];
  const interactive = item.available && item.wrapper !== 'div';
  if (interactive) {
    classes.push('card--interactive', 'group');
  } else if (!item.available) {
    classes.push('card--disabled');
  }
  if (viewMode.value === 'list') {
    classes.push('md:flex-row', 'md:items-center', 'md:justify-between');
  }
  return classes.join(' ');
}
</script>

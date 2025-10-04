import { computed, ref, watch, type ComputedRef } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router';
import { normalizeManifest } from '@/content/loaders';

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

export interface CourseHomeItem {
  key: string;
  type: 'lesson' | 'exercise';
  title: string;
  description?: string;
  available: boolean;
  cta?: string;
  wrapper: 'router-link' | 'a' | 'div';
  attrs: Record<string, unknown>;
}

export interface CourseHomeController {
  lessons: ReturnType<typeof ref<LessonRef[]>>;
  exercises: ReturnType<typeof ref<ExerciseRef[]>>;
  contentFilter: ReturnType<typeof ref<'all' | 'lesson' | 'exercise'>>;
  viewMode: ReturnType<typeof ref<'grid' | 'list'>>;
  isLoading: ReturnType<typeof ref<boolean>>;
  rawSearchQuery: ComputedRef<string>;
  searchTerm: ComputedRef<string>;
  combinedItems: ComputedRef<CourseHomeItem[]>;
  displayItems: ComputedRef<CourseHomeItem[]>;
  refreshCourseContent: (id: string) => Promise<void>;
  resetFilters: () => void;
  updateSection: (section: 'all' | 'lesson' | 'exercise') => void;
  courseId: ComputedRef<string>;
  route: RouteLocationNormalizedLoaded;
}

type ManifestLoaderMap = Record<string, () => Promise<unknown>>;

const defaultLessonModules = import.meta.glob('../content/courses/*/lessons.json');
const defaultExerciseModules = import.meta.glob('../content/courses/*/exercises.json');

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

interface CourseHomeControllerOptions {
  lessonModules?: ManifestLoaderMap;
  exerciseModules?: ManifestLoaderMap;
}

export function useCourseHomeController(
  options: CourseHomeControllerOptions = {}
): CourseHomeController {
  const route = useRoute();
  const router = useRouter();
  const courseId = computed(() => String(route.params.courseId ?? ''));

  const lessonModules = options.lessonModules ?? defaultLessonModules;
  const exerciseModules = options.exerciseModules ?? defaultExerciseModules;

  const lessons = ref<LessonRef[]>([]);
  const exercises = ref<ExerciseRef[]>([]);
  const contentFilter = ref<'all' | 'lesson' | 'exercise'>('all');
  const viewMode = ref<'grid' | 'list'>('grid');
  const isLoading = ref(true);

  const rawSearchQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''));
  const searchTerm = computed(() => rawSearchQuery.value.toLowerCase());

  async function loadLessons(id: string) {
    try {
      const path = `../content/courses/${id}/lessons.json`;
      const importer = lessonModules[path];
      if (!importer) throw new Error(`Lessons manifest not found for ${path}`);
      const module = await importer();
      const { entries } = normalizeManifest<LessonRef>(module, {
        context: `CourseHome:lessons:${id}`,
      });
      lessons.value = entries;
    } catch (error) {
      console.error('[CourseHome] Failed to load lessons.json', error);
      lessons.value = [];
    }
  }

  async function loadExercises(id: string) {
    try {
      const path = `../content/courses/${id}/exercises.json`;
      const importer = exerciseModules[path];
      if (!importer) throw new Error(`Exercises manifest not found for ${path}`);
      const module = await importer();
      const { entries } = normalizeManifest<ExerciseRef>(module, {
        context: `CourseHome:exercises:${id}`,
      });
      exercises.value = entries;
    } catch (error) {
      console.warn('[CourseHome] Exercises not available', error);
      exercises.value = [];
    }
  }

  const combinedItems = computed<CourseHomeItem[]>(() => {
    const id = courseId.value;
    const items: CourseHomeItem[] = [];

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
      let wrapper: CourseHomeItem['wrapper'] = 'div';

      if (available && exercise.file) {
        wrapper = 'router-link';
        attrs = { to: { name: 'exercise', params: { courseId: id, exerciseId: exercise.id } } };
      } else if (available && exercise.link) {
        const external = isExternal(exercise.link);
        wrapper = 'a';
        attrs = {
          href: exercise.link,
          target: external ? '_blank' : undefined,
          rel: external ? 'noopener noreferrer' : undefined,
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

  async function refreshCourseContent(id: string) {
    if (!id) {
      lessons.value = [];
      exercises.value = [];
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    try {
      await Promise.all([loadLessons(id), loadExercises(id)]);
    } finally {
      isLoading.value = false;
    }
  }

  watch(
    courseId,
    (id) => {
      void refreshCourseContent(id);
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
    router
      .push({ name: 'course-home', params: { courseId: courseId.value } })
      .catch(() => undefined);
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

  return {
    lessons,
    exercises,
    contentFilter,
    viewMode,
    isLoading,
    rawSearchQuery,
    searchTerm,
    combinedItems,
    displayItems,
    refreshCourseContent,
    resetFilters,
    updateSection,
    courseId,
    route,
  };
}

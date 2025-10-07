import { computed, ref, watch, type ComputedRef } from 'vue';
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router';
import { normalizeManifest } from '@/content/loaders';

interface CourseMeta {
  id: string;
  title: string;
  institution: string;
  description?: string;
}

interface LessonSummary {
  id: string;
  title: string;
  available?: boolean;
  file?: string;
  link?: string;
}

interface ExerciseSummary {
  id: string;
  title: string;
  available?: boolean;
  file?: string;
  link?: string;
}

export interface CourseLayoutController {
  meta: ReturnType<typeof ref<CourseMeta | null>>;
  lessons: ReturnType<typeof ref<LessonSummary[]>>;
  exercises: ReturnType<typeof ref<ExerciseSummary[]>>;
  metaLoaded: ReturnType<typeof ref<boolean>>;
  lessonsCount: ComputedRef<number>;
  exercisesCount: ComputedRef<number>;
  refreshCourse: (id: string) => Promise<void>;
  courseId: ComputedRef<string>;
  route: RouteLocationNormalizedLoaded;
}

type ManifestLoaderMap = Record<string, () => Promise<unknown>>;

const defaultMetaModules = import.meta.glob('../content/courses/*/meta.json');
const defaultLessonModules = import.meta.glob('../content/courses/*/lessons.json');
const defaultExerciseModules = import.meta.glob('../content/courses/*/exercises.json');

interface CourseLayoutControllerOptions {
  metaModules?: ManifestLoaderMap;
  lessonModules?: ManifestLoaderMap;
  exerciseModules?: ManifestLoaderMap;
}

export function useCourseLayoutController(
  options: CourseLayoutControllerOptions = {}
): CourseLayoutController {
  const route = useRoute();
  const courseId = computed(() => String(route.params.courseId ?? ''));

  const metaModules = options.metaModules ?? defaultMetaModules;
  const lessonModules = options.lessonModules ?? defaultLessonModules;
  const exerciseModules = options.exerciseModules ?? defaultExerciseModules;

  const meta = ref<CourseMeta | null>(null);
  const lessons = ref<LessonSummary[]>([]);
  const exercises = ref<ExerciseSummary[]>([]);
  const metaLoaded = ref(false);

  const lessonsCount = computed(
    () => lessons.value.filter((lesson) => lesson.available !== false).length
  );
  const exercisesCount = computed(
    () =>
      exercises.value.filter(
        (exercise) => exercise.available !== false && Boolean(exercise.file || exercise.link)
      ).length
  );

  async function loadMeta(id: string) {
    try {
      const path = `../content/courses/${id}/meta.json`;
      const importer = metaModules[path];
      if (!importer) throw new Error(`Meta manifest not found for ${path}`);
      const module: any = await importer();
      const payload = module.default ?? module;
      meta.value = payload as CourseMeta;
    } catch (error) {
      console.error('[CourseLayout] Failed to load meta', error);
      meta.value = null;
    }
  }

  async function loadLessons(id: string) {
    try {
      const path = `../content/courses/${id}/lessons.json`;
      const importer = lessonModules[path];
      if (!importer) throw new Error(`Lessons manifest not found for ${path}`);
      const module = await importer();
      const { entries } = normalizeManifest<LessonSummary>(module, {
        context: `CourseLayout:lessons:${id}`,
      });
      lessons.value = entries.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        available: lesson.available,
        file: lesson.file,
        link: lesson.link,
      }));
    } catch (error) {
      console.error('[CourseLayout] Failed to load lessons.json', error);
      lessons.value = [];
    }
  }

  async function loadExercises(id: string) {
    try {
      const path = `../content/courses/${id}/exercises.json`;
      const importer = exerciseModules[path];
      if (!importer) throw new Error(`Exercises manifest not found for ${path}`);
      const module = await importer();
      const { entries } = normalizeManifest<ExerciseSummary>(module, {
        context: `CourseLayout:exercises:${id}`,
      });
      exercises.value = entries.map((exercise) => ({
        id: exercise.id,
        title: exercise.title,
        available: exercise.available,
        file: exercise.file,
        link: exercise.link,
      }));
    } catch (error) {
      exercises.value = [];
    }
  }

  async function refreshCourse(id: string) {
    if (!id) {
      meta.value = null;
      lessons.value = [];
      exercises.value = [];
      metaLoaded.value = false;
      return;
    }

    metaLoaded.value = false;
    await Promise.all([loadMeta(id), loadLessons(id), loadExercises(id)]);
    metaLoaded.value = true;
  }

  watch(
    () => courseId.value,
    (id) => {
      if (id) {
        void refreshCourse(id);
      }
    },
    { immediate: true }
  );

  return {
    meta,
    lessons,
    exercises,
    metaLoaded,
    lessonsCount,
    exercisesCount,
    refreshCourse,
    courseId,
    route,
  };
}

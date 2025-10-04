import { computed, defineAsyncComponent, ref, shallowRef, watch, type ComputedRef } from 'vue';
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router';
import { normalizeManifest } from '@/content/loaders';

type ManifestLoaderMap = Record<string, () => Promise<unknown>>;

type ExerciseWrapperMap = Record<string, () => Promise<unknown>>;

type GenerationMetadata = {
  generatedBy: string;
  model: string;
  timestamp: string;
};

type ExerciseManifest = {
  id: string;
  title: string;
  file?: string;
  link?: string;
  available?: boolean;
  description?: string;
  summary?: string;
  metadata?: GenerationMetadata;
  type?: string;
};

export interface ExerciseViewController {
  courseId: ComputedRef<string>;
  exerciseId: ComputedRef<string>;
  exerciseTitle: ReturnType<typeof ref<string>>;
  exerciseSummary: ReturnType<typeof ref<string>>;
  exerciseComponent: ReturnType<typeof shallowRef<any | null>>;
  exerciseFile: ReturnType<typeof ref<string>>;
  loadExercise: () => Promise<void>;
  route: RouteLocationNormalizedLoaded;
}

const defaultExerciseIndexModules = import.meta.glob('../content/courses/*/exercises.json');
const defaultExerciseModules = import.meta.glob('../content/courses/*/exercises/*.vue');

interface ExerciseViewControllerOptions {
  exerciseIndexModules?: ManifestLoaderMap;
  exerciseModules?: ExerciseWrapperMap;
  redirect?: (url: string) => void;
}

function defaultRedirect(url: string) {
  if (typeof window !== 'undefined' && window?.location) {
    window.location.href = url;
  }
}

export function useExerciseViewController(
  options: ExerciseViewControllerOptions = {}
): ExerciseViewController {
  const route = useRoute();
  const courseId = computed(() => String(route.params.courseId));
  const exerciseId = computed(() => String(route.params.exerciseId));

  const exerciseIndexModules = options.exerciseIndexModules ?? defaultExerciseIndexModules;
  const exerciseModules = options.exerciseModules ?? defaultExerciseModules;
  const redirect = options.redirect ?? defaultRedirect;

  const exerciseTitle = ref('');
  const exerciseSummary = ref('');
  const exerciseComponent = shallowRef<any | null>(null);
  const exerciseFile = ref('');

  async function loadExercise() {
    exerciseComponent.value = null;
    exerciseTitle.value = '';
    exerciseSummary.value = '';
    exerciseFile.value = '';

    try {
      const currentCourse = courseId.value;
      const currentExercise = exerciseId.value;

      const indexPath = `../content/courses/${currentCourse}/exercises.json`;
      const indexImporter = exerciseIndexModules[indexPath];
      if (!indexImporter) throw new Error(`Exercise index not found for path: ${indexPath}`);

      const indexModule: any = await indexImporter();
      const { entries: index } = normalizeManifest<ExerciseManifest>(indexModule, {
        context: `ExerciseView:index:${currentCourse}`,
      });
      const entry = index.find((item) => item.id === currentExercise);
      if (!entry) throw new Error(`Exercise ${currentExercise} not found`);

      exerciseTitle.value = entry.title;
      exerciseSummary.value = entry.summary ?? entry.description ?? '';
      exerciseFile.value = entry.file ?? '';

      if (entry.file) {
        const exercisePath = `../content/courses/${currentCourse}/exercises/${entry.file}`;
        const exerciseImporter = exerciseModules[exercisePath];
        if (!exerciseImporter)
          throw new Error(`Exercise module not found for path: ${exercisePath}`);

        const loader = async () => {
          const mod: any = await exerciseImporter();
          const meta = mod.meta ?? {};
          exerciseTitle.value = meta.title ?? entry.title;
          exerciseSummary.value = meta.summary ?? meta.description ?? exerciseSummary.value;
          return mod.default;
        };

        exerciseComponent.value = defineAsyncComponent(loader);
      } else if (entry.link) {
        redirect(entry.link);
      }
    } catch (error) {
      console.error('[ExerciseView] Failed to load exercise:', error);
      exerciseTitle.value = 'Erro ao carregar exercício';
      exerciseSummary.value = 'Não foi possível localizar o material solicitado.';
      exerciseFile.value = '';
    }
  }

  watch(
    [courseId, exerciseId],
    () => {
      void loadExercise();
    },
    { immediate: true }
  );

  return {
    courseId,
    exerciseId,
    exerciseTitle,
    exerciseSummary,
    exerciseComponent,
    exerciseFile,
    loadExercise,
    route,
  };
}

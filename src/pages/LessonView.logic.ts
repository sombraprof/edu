import { computed, nextTick, ref, shallowRef, watch, type ComputedRef } from 'vue';
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router';
import type { LessonBlock } from '@/components/lesson/blockRegistry';
import type { NormalizedLesson } from '@/content/schema/lesson';
import { normalizeManifest } from '@/content/loaders';
import { createPrismHighlightHandler } from '@/utils/prismHighlight';

type LessonManifest = {
  id: string;
  title: string;
  file: string;
  description?: string;
  available?: boolean;
  link?: string;
  summary?: string;
  duration?: number;
  tags?: string[];
  modality?: string;
  type?: string;
  metadata?: Record<string, unknown> | null;
};

type LessonContent = NormalizedLesson & { content: LessonBlock[] };

type ManifestLoaderMap = Record<string, () => Promise<unknown>>;

type LessonModuleLoaderMap = Record<string, () => Promise<unknown>>;

type HighlightHandler = (lesson: LessonContent) => Promise<void> | void;

export interface LessonViewControllerOptions {
  lessonIndexModules?: ManifestLoaderMap;
  lessonContentModules?: LessonModuleLoaderMap;
  highlight?: HighlightHandler;
}

export interface LessonViewController {
  courseId: ComputedRef<string>;
  lessonId: ComputedRef<string>;
  lessonTitle: ReturnType<typeof ref<string>>;
  lessonObjective: ReturnType<typeof ref<string>>;
  lessonSummary: ReturnType<typeof ref<string>>;
  lessonDuration: ReturnType<typeof ref<number | undefined>>;
  lessonModality: ReturnType<typeof ref<string>>;
  lessonTags: ReturnType<typeof ref<string[]>>;
  lessonSkills: ReturnType<typeof ref<string[]>>;
  lessonOutcomes: ReturnType<typeof ref<string[]>>;
  lessonPrerequisites: ReturnType<typeof ref<string[]>>;
  lessonData: ReturnType<typeof shallowRef<LessonContent | null>>;
  lessonContentFile: ReturnType<typeof ref<string>>;
  lessonAvailable: ReturnType<typeof ref<boolean>>;
  lessonLink: ReturnType<typeof ref<string>>;
  lessonManifestType: ReturnType<typeof ref<string>>;
  lessonManifestMetadata: ReturnType<typeof shallowRef<Record<string, unknown> | null>>;
  loadLesson: () => Promise<void>;
  setManifestEntry: (entry: LessonManifest | null) => void;
  route: RouteLocationNormalizedLoaded;
}

const defaultLessonIndexes = import.meta.glob('../content/courses/*/lessons.json');
const defaultLessonModules = import.meta.glob('../content/courses/*/lessons/*.json');

export function useLessonViewController(
  options: LessonViewControllerOptions = {}
): LessonViewController {
  const route = useRoute();
  const courseId = computed(() => String(route.params.courseId));
  const lessonId = computed(() => String(route.params.lessonId));

  const lessonIndexes = options.lessonIndexModules ?? defaultLessonIndexes;
  const lessonModules = options.lessonContentModules ?? defaultLessonModules;
  const defaultHighlight = createPrismHighlightHandler();
  const highlight = options.highlight ?? defaultHighlight;

  const lessonTitle = ref('');
  const lessonObjective = ref('');
  const lessonSummary = ref('');
  const lessonDuration = ref<number | undefined>(undefined);
  const lessonModality = ref('');
  const lessonTags = ref<string[]>([]);
  const lessonSkills = ref<string[]>([]);
  const lessonOutcomes = ref<string[]>([]);
  const lessonPrerequisites = ref<string[]>([]);
  const lessonData = shallowRef<LessonContent | null>(null);
  const lessonContentFile = ref('');
  const lessonAvailable = ref(true);
  const lessonLink = ref('');
  const lessonManifestType = ref('');
  const lessonManifestMetadata = shallowRef<Record<string, unknown> | null>(null);

  function applyManifestEntry(entry: LessonManifest | null) {
    if (!entry) {
      lessonAvailable.value = true;
      lessonLink.value = '';
      lessonManifestType.value = '';
      lessonManifestMetadata.value = null;
      return;
    }

    lessonAvailable.value = entry.available !== false;
    lessonLink.value = typeof entry.link === 'string' ? entry.link : '';
    lessonManifestType.value = typeof entry.type === 'string' ? entry.type : '';
    lessonManifestMetadata.value =
      entry.metadata && typeof entry.metadata === 'object'
        ? { ...(entry.metadata as Record<string, unknown>) }
        : null;

    if (typeof entry.title === 'string' && entry.title.length) {
      lessonTitle.value = entry.title;
    }
    if (typeof entry.summary === 'string' && entry.summary.length) {
      lessonSummary.value = entry.summary;
    }
    if (typeof entry.duration === 'number' && Number.isFinite(entry.duration)) {
      lessonDuration.value = entry.duration;
    }
    if (typeof entry.modality === 'string' && entry.modality.length) {
      lessonModality.value = entry.modality;
    }
    if (Array.isArray(entry.tags) && entry.tags.length) {
      lessonTags.value = [...entry.tags];
    }
  }

  function setManifestEntry(entry: LessonManifest | null) {
    if (!entry) {
      applyManifestEntry(null);
      return;
    }

    const snapshot: LessonManifest = {
      ...entry,
      metadata:
        entry.metadata && typeof entry.metadata === 'object'
          ? { ...(entry.metadata as Record<string, unknown>) }
          : null,
    };

    applyManifestEntry(snapshot);
  }

  async function loadLesson() {
    lessonData.value = null;
    lessonTitle.value = '';
    lessonObjective.value = '';
    lessonSummary.value = '';
    lessonDuration.value = undefined;
    lessonModality.value = '';
    lessonTags.value = [];
    lessonSkills.value = [];
    lessonOutcomes.value = [];
    lessonPrerequisites.value = [];
    lessonContentFile.value = '';

    try {
      const currentCourse = courseId.value;
      const currentLesson = lessonId.value;

      const indexPath = `../content/courses/${currentCourse}/lessons.json`;
      const indexImporter = lessonIndexes[indexPath];
      if (!indexImporter) throw new Error(`Could not find lesson index for path: ${indexPath}`);

      const indexModule: any = await indexImporter();
      const { entries: index } = normalizeManifest<LessonManifest>(indexModule, {
        context: `LessonView:index:${currentCourse}`,
      });

      const entry = index.find((item) => item.id === currentLesson);
      if (!entry) throw new Error(`Lesson ${currentLesson} not found`);

      const lessonPath = `../content/courses/${currentCourse}/lessons/${entry.file}`;
      const lessonImporter = lessonModules[lessonPath];
      if (!lessonImporter) throw new Error(`Lesson module not found for path: ${lessonPath}`);

      setManifestEntry(entry);

      lessonContentFile.value = entry.file ?? '';

      const mod: any = await lessonImporter();
      const data = (mod.default ?? mod) as LessonContent | null;
      if (!data || typeof data !== 'object') throw new Error('Lesson payload is invalid.');
      if (!Array.isArray(data.content)) {
        throw new Error('Lesson payload is missing a valid "content" array.');
      }

      const summary = pickString(data.summary, entry.summary, entry.description);
      const duration = pickNumber(data.duration, entry.duration);
      const modality = pickString(data.modality, entry.modality);
      const tags = mergeTags(data.tags, entry.tags);
      const skills = pickStringList(data.skills, data.competencies);
      const outcomes = pickStringList(data.outcomes, data.objectives);
      const prerequisites = pickStringList(data.prerequisites);

      lessonTitle.value =
        typeof data.title === 'string' && data.title.length ? data.title : entry.title;
      lessonObjective.value = pickString(data.objective, entry.description);
      lessonSummary.value = summary;
      lessonDuration.value = duration;
      lessonModality.value = modality;
      lessonTags.value = tags;
      lessonSkills.value = skills;
      lessonOutcomes.value = outcomes;
      lessonPrerequisites.value = prerequisites;

      lessonData.value = {
        ...data,
        summary: summary || data.summary,
        duration: typeof duration === 'number' ? duration : data.duration,
        modality: modality || data.modality,
        tags: tags.length ? tags : data.tags,
        skills: skills.length ? skills : data.skills,
        outcomes: outcomes.length ? outcomes : data.outcomes,
        prerequisites: prerequisites.length ? prerequisites : data.prerequisites,
        content: data.content,
      };

      await nextTick();

      try {
        await highlight(lessonData.value);
      } catch (highlightError) {
        console.error('[LessonView] Failed to highlight lesson content:', highlightError);

        if (highlight !== defaultHighlight) {
          try {
            await defaultHighlight(lessonData.value);
          } catch (fallbackError) {
            console.error(
              '[LessonView] Failed to apply fallback highlight handler:',
              fallbackError
            );
          }
        }
      }
    } catch (error) {
      console.error('[LessonView] Failed to load lesson:', error);
      lessonTitle.value = 'Erro ao carregar aula';
      lessonObjective.value = 'Não foi possível localizar o material solicitado.';
      lessonSkills.value = [];
      lessonOutcomes.value = [];
      lessonPrerequisites.value = [];
      lessonContentFile.value = '';
      setManifestEntry(null);
    }
  }

  watch(
    [courseId, lessonId],
    () => {
      void loadLesson();
    },
    { immediate: true }
  );

  return {
    courseId,
    lessonId,
    lessonTitle,
    lessonObjective,
    lessonSummary,
    lessonDuration,
    lessonModality,
    lessonTags,
    lessonSkills,
    lessonOutcomes,
    lessonPrerequisites,
    lessonData,
    lessonContentFile,
    lessonAvailable,
    lessonLink,
    lessonManifestType,
    lessonManifestMetadata,
    loadLesson,
    setManifestEntry,
    route,
  };
}

function pickString(...candidates: Array<unknown>): string {
  for (const candidate of candidates) {
    const value = normalizeString(candidate);
    if (value) {
      return value;
    }
  }
  return '';
}

function pickNumber(...candidates: Array<unknown>): number | undefined {
  for (const candidate of candidates) {
    const value = normalizePositiveNumber(candidate);
    if (typeof value === 'number') {
      return value;
    }
  }
  return undefined;
}

function pickStringList(...candidates: Array<unknown>): string[] {
  for (const candidate of candidates) {
    const value = normalizeStringList(candidate);
    if (value.length > 0) {
      return value;
    }
  }
  return [];
}

function mergeTags(...sources: Array<unknown>): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const source of sources) {
    if (!Array.isArray(source)) {
      continue;
    }

    for (const raw of source) {
      const value = normalizeString(raw);
      if (!value) {
        continue;
      }
      const key = value.toLocaleLowerCase('pt-BR');
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      tags.push(value);
    }
  }

  return tags;
}

function normalizeString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : '';
}

function normalizePositiveNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry): entry is string => entry.length > 0);
}

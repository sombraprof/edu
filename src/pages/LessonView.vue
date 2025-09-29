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
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';
import Prism from 'prismjs';
import LessonReadiness from '@/components/lesson/LessonReadiness.vue';
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';
import LessonOverview from '@/components/lesson/LessonOverview.vue';
import type { LessonBlock } from '@/components/lesson/blockRegistry';
import type { NormalizedLesson } from '@/content/schema/lesson';
import Md3Button from '@/components/Md3Button.vue';
import { normalizeManifest } from '@/content/loaders';

import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-kotlin';

interface LessonRef {
  id: string;
  title: string;
  file: string;
  description?: string;
  available?: boolean;
  summary?: string;
  duration?: number;
  tags?: string[];
  modality?: string;
}

const lessonIndexes = import.meta.glob('../content/courses/*/lessons.json');
const lessonModules = import.meta.glob('../content/courses/*/lessons/*.json');

const route = useRoute();
const courseId = computed(() => String(route.params.courseId));
const lessonId = computed(() => String(route.params.lessonId));

const lessonTitle = ref<string>('');
const lessonObjective = ref<string>('');
const lessonSummary = ref<string>('');
const lessonDuration = ref<number | undefined>(undefined);
const lessonModality = ref<string>('');
const lessonTags = ref<string[]>([]);

type LessonContent = NormalizedLesson & { content: LessonBlock[] };

const lessonData = shallowRef<LessonContent | null>(null);

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry): entry is string => entry.length > 0);
}

function highlight() {
  requestAnimationFrame(() => {
    Prism.highlightAll();
  });
}

async function loadLesson() {
  lessonData.value = null;
  lessonTitle.value = '';
  lessonObjective.value = '';
  lessonSummary.value = '';
  lessonDuration.value = undefined;
  lessonModality.value = '';
  lessonTags.value = [];

  try {
    const currentCourse = courseId.value;
    const currentLesson = lessonId.value;

    const indexPath = `../content/courses/${currentCourse}/lessons.json`;
    const indexImporter = lessonIndexes[indexPath];
    if (!indexImporter) throw new Error(`Could not find lesson index for path: ${indexPath}`);

    const indexModule: any = await indexImporter();
    const { entries: index } = normalizeManifest<LessonRef>(indexModule, {
      context: `LessonView:index:${currentCourse}`,
    });

    const entry = index.find((item) => item.id === currentLesson);
    if (!entry) throw new Error(`Lesson ${currentLesson} not found`);

    const lessonPath = `../content/courses/${currentCourse}/lessons/${entry.file}`;
    const lessonImporter = lessonModules[lessonPath];
    if (!lessonImporter) throw new Error(`Lesson module not found for path: ${lessonPath}`);

    const mod: any = await lessonImporter();
    const data = (mod.default ?? mod) as LessonContent | null;
    if (!data || typeof data !== 'object') throw new Error('Lesson payload is invalid.');
    if (!Array.isArray(data.content))
      throw new Error('Lesson payload is missing a valid "content" array.');

    lessonTitle.value =
      typeof data.title === 'string' && data.title.length ? data.title : entry.title;
    lessonObjective.value =
      typeof data.objective === 'string' && data.objective.length
        ? data.objective
        : typeof entry.description === 'string'
          ? entry.description
          : '';

    const summary = pickString(data.summary, entry.summary, entry.description);
    const duration = pickNumber(data.duration, entry.duration);
    const modality = pickString(data.modality, entry.modality);
    const tags = mergeTags(data.tags, entry.tags);

    lessonSummary.value = summary;
    lessonDuration.value = duration;
    lessonModality.value = modality;
    lessonTags.value = tags;

    lessonData.value = {
      ...data,
      summary: summary || data.summary,
      duration: typeof duration === 'number' ? duration : data.duration,
      modality: modality || data.modality,
      tags: tags.length ? tags : data.tags,
      content: data.content,
    };

    await nextTick();
    highlight();
  } catch (error) {
    console.error('[LessonView] Failed to load lesson:', error);
    lessonTitle.value = 'Erro ao carregar aula';
    lessonObjective.value = 'Não foi possível localizar o material solicitado.';
    lessonSkills.value = [];
    lessonOutcomes.value = [];
    lessonPrerequisites.value = [];
  }
}

onMounted(() => {
  loadLesson();
});

watch([courseId, lessonId], () => {
  loadLesson();
});

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
</script>

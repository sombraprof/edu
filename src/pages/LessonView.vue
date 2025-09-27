<template>
  <section :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-6)' }">
    <nav class="flex items-center gap-2 md-sys-typescale-body-small">
      <router-link class="btn btn-text" :to="{ name: 'course-home', params: { courseId } }"
        >Voltar para a disciplina</router-link
      >
      <ChevronRight
        :style="{ height: 'var(--md-sys-icon-size-small)', width: 'var(--md-sys-icon-size-small)' }"
        class="text-[var(--md-sys-color-on-surface-variant)]"
      />
      <span class="text-[var(--md-sys-color-on-surface-variant)]">{{ lessonTitle }}</span>
    </nav>

    <article
      v-if="lessonData"
      class="card max-w-none p-8"
      :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-6)' }"
    >
      <header :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-2)' }">
        <p
          class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]/80"
        >
          Conteúdo da aula
        </p>
        <h2 class="text-headline-medium font-semibold text-[var(--md-sys-color-on-surface)]">
          {{ lessonTitle }}
        </h2>
        <p v-if="lessonObjective" class="text-body-large !mt-4">{{ lessonObjective }}</p>
      </header>

      <div class="divider" role="presentation"></div>

      <LessonRenderer
        :data="lessonData"
        class="lesson-content prose max-w-none dark:prose-invert"
      />
    </article>

    <article
      v-else
      class="card max-w-none p-8 text-center text-body-medium text-[var(--md-sys-color-on-surface-variant)]"
    >
      Não foi possível carregar esta aula.
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import Prism from 'prismjs';
import LessonRenderer from '@/components/lesson/LessonRenderer.vue';

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
}

const lessonIndexes = import.meta.glob('../content/courses/*/lessons.json');
const lessonModules = import.meta.glob('../content/courses/*/lessons/*.json');

const route = useRoute();
const courseId = computed(() => String(route.params.courseId));
const lessonId = computed(() => String(route.params.lessonId));

const lessonTitle = ref<string>('');
const lessonObjective = ref<string>('');
interface LessonContent {
  id: string;
  title: string;
  objective?: string;
  content: unknown[];
}

const lessonData = shallowRef<LessonContent | null>(null);

function highlight() {
  requestAnimationFrame(() => {
    Prism.highlightAll();
  });
}

async function loadLesson() {
  lessonData.value = null;
  lessonTitle.value = '';
  lessonObjective.value = '';

  try {
    const currentCourse = courseId.value;
    const currentLesson = lessonId.value;

    const indexPath = `../content/courses/${currentCourse}/lessons.json`;
    const indexImporter = lessonIndexes[indexPath];
    if (!indexImporter) throw new Error(`Could not find lesson index for path: ${indexPath}`);

    const indexModule: any = await indexImporter();
    const index: LessonRef[] = indexModule.default || indexModule;
    if (!Array.isArray(index)) throw new Error('Lesson index is not an array.');

    const entry = index.find((item) => item.id === currentLesson);
    if (!entry) throw new Error(`Lesson ${currentLesson} not found`);

    const lessonPath = `../content/courses/${currentCourse}/lessons/${entry.file}`;
    const lessonImporter = lessonModules[lessonPath];
    if (!lessonImporter) throw new Error(`Lesson module not found for path: ${lessonPath}`);

    const mod: any = await lessonImporter();
    const data: LessonContent = mod.default ?? mod;
    if (!data || typeof data !== 'object') throw new Error('Lesson payload is invalid.');

    lessonTitle.value = data.title ?? entry.title;
    lessonObjective.value = data.objective ?? entry.description ?? '';
    lessonData.value = data;

    await nextTick();
    highlight();
  } catch (error) {
    console.error('[LessonView] Failed to load lesson:', error);
    lessonTitle.value = 'Erro ao carregar aula';
    lessonObjective.value = 'Não foi possível localizar o material solicitado.';
  }
}

onMounted(() => {
  loadLesson();
});

watch([courseId, lessonId], () => {
  loadLesson();
});
</script>

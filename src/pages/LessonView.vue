
<template>
  <section class="space-y-6">
    <nav class="flex items-center gap-2 text-sm">
      <router-link class="nav-link" :to="{ name: 'course-home', params: { courseId } }">Voltar para a disciplina</router-link>
      <ChevronRight class="h-4 w-4 text-[var(--md-sys-color-on-surface-variant)]" />
      <span class="text-[var(--md-sys-color-on-surface-variant)]">{{ lessonTitle }}</span>
    </nav>


    <!-- New JSON-based rendering -->
    <article v-if="lessonContent" class="card max-w-none space-y-6 p-8">
       <header class="space-y-2">
        <p class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]/80">Conteúdo da aula</p>
        <h2 class="text-headline-medium font-semibold text-[var(--md-sys-color-on-surface)]">{{ lessonTitle }}</h2>
        <p v-if="lessonContent.objective" class="text-body-large !mt-4">{{ lessonContent.objective }}</p>
      </header>

      <div class="divider"></div>

      <template v-for="(block, index) in lessonContent.content" :key="index">
        <div v-if="block.type === 'html'" class="prose max-w-none lesson-content" v-html="block.html"></div>
        <CodeBlock v-if="block.type === 'code'" :code="block.code" :language="block.language" />
        <LessonPlan v-if="block.type === 'lessonPlan'" :data="block" />
        <ContentBlock v-if="block.type === 'contentBlock'" :data="block" />
        <VideosBlock v-if="block.type === 'videos'" :data="block" />
        <ChecklistBlock v-if="block.type === 'checklist'" :data="block" />
        <BibliographyBlock v-if="block.type === 'bibliography'" :data="block" />
        <Callout 
          v-if="block.type === 'callout'" 
          :variant="block.variant" 
          :title="block.title" 
          :content="block.content" 
        />
        <Timeline v-if="block.type === 'timeline'" :data="block" />
        <FlightPlan v-if="block.type === 'flightPlan'" :data="block" />
        <Accordion v-if="block.type === 'accordion'" :data="block" />
        <Representations v-if="block.type === 'representations'" :data="block" />
        <!-- Other components will be added here -->
      </template>
    </article>

  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import Prism from 'prismjs';
// Import themes and languages for Prism
// import 'prismjs/themes/prism-tomorrow.css';
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

// Import the new lesson components
import Callout from '@/components/lesson/Callout.vue';
import Timeline from '@/components/lesson/Timeline.vue';
import FlightPlan from '@/components/lesson/FlightPlan.vue';
import Accordion from '@/components/lesson/Accordion.vue';
import Representations from '@/components/lesson/Representations.vue';
import CodeBlock from '@/components/lesson/CodeBlock.vue';
import LessonPlan from '@/components/lesson/LessonPlan.vue';
import ContentBlock from '@/components/lesson/ContentBlock.vue';
import VideosBlock from '@/components/lesson/VideosBlock.vue';
import ChecklistBlock from '@/components/lesson/ChecklistBlock.vue';
import BibliographyBlock from '@/components/lesson/BibliographyBlock.vue';

interface LessonRef { id: string; title: string; file: string }
interface LessonContent {
  id: string;
  title: string;
  objective: string;
  content: any[];
}

const route = useRoute();
const base = import.meta.env.BASE_URL;
const courseId = computed(() => String(route.params.courseId));
const lessonId = computed(() => String(route.params.lessonId));

const lessonTitle = ref<string>('');
const contentRef = ref<HTMLElement | null>(null);

// --- State Management ---
const lessonContent = ref<LessonContent | null>(null);


async function loadLesson() {
  // Reset states
  lessonContent.value = null;

  try {
    const currentCourse = courseId.value;
    const currentLesson = lessonId.value;

    // 1. Fetch lesson metadata from the index
    const indexRes = await fetch(`${base}courses/${currentCourse}/lessons.json`);
    if (!indexRes.ok) throw new Error('lessons.json not found');
    const index: LessonRef[] = await indexRes.json();
    const entry = index.find((l) => l.id === currentLesson);
    if (!entry) throw new Error('Lesson not found in index');
    lessonTitle.value = entry.title;

    // 2. Fetch the lesson content file (HTML or JSON)
    const fileRes = await fetch(`${base}courses/${currentCourse}/lessons/${entry.file}`);
    if (!fileRes.ok) throw new Error(`Lesson file not found: ${entry.file}`);

    // 3. Process content based on file type
    if (entry.file.endsWith('.json')) {
      lessonContent.value = await fileRes.json();
    }

    // 4. Highlight code blocks after content is rendered
    await nextTick();
    const container = contentRef.value || document; // Fallback to document for JSON content
    Prism.highlightAllUnder(container);

  } catch (err) {
    console.error('[LessonView] Failed to load lesson:', err);
    lessonContent.value = { id: '', title: lessonTitle.value, objective: '', content: [{ type: 'html', html: '<p class="text-error-500">Não foi possível carregar esta aula no momento.</p>' }] };
  }
}

onMounted(loadLesson);
watch([courseId, lessonId], loadLesson);

</script>


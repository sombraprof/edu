<template>
  <section class="page-section">
    <nav class="page-breadcrumb">
      <router-link class="btn btn-text" :to="{ name: 'course-home', params: { courseId } }">
        <ArrowLeft class="md-icon md-icon--sm" />
        <span>Voltar para a disciplina</span>
      </router-link>
      <ChevronRight class="md-icon md-icon--sm page-breadcrumb__separator" />
      <span class="page-breadcrumb__current">{{ exerciseTitle }}</span>
    </nav>

    <article class="card max-w-none md-stack md-stack-6 p-8">
      <header class="md-stack md-stack-3">
        <div class="md-stack md-stack-2">
          <p
            class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]/80"
          >
            Exercício
          </p>
          <h2 class="text-headline-medium font-semibold text-[var(--md-sys-color-on-surface)]">
            {{ exerciseTitle }}
          </h2>
          <p v-if="exerciseSummary" class="text-body-large !mt-4">{{ exerciseSummary }}</p>
        </div>
      </header>
      <div class="divider" role="presentation"></div>

      <component
        v-if="exerciseComponent"
        :is="exerciseComponent"
        class="lesson-content prose max-w-none dark:prose-invert"
      />
      <p v-else class="text-body-medium text-[var(--md-sys-color-on-surface-variant)]">
        Conteúdo deste exercício ainda não está disponível.
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';

interface GenerationMetadata {
  generatedBy: string;
  model: string;
  timestamp: string;
}

interface ExerciseRef {
  id: string;
  title: string;
  file?: string;
  link?: string;
  available?: boolean;
  description?: string;
  summary?: string;
  metadata?: GenerationMetadata;
  type?: string;
}

const exerciseModules = import.meta.glob('../content/courses/*/exercises/*.vue');

const route = useRoute();
const courseId = computed(() => String(route.params.courseId));
const exerciseId = computed(() => String(route.params.exerciseId));

const exerciseTitle = ref<string>('');
const exerciseSummary = ref<string>('');
const exerciseComponent = shallowRef<any | null>(null);

async function loadExercise() {
  exerciseComponent.value = null;
  exerciseTitle.value = '';
  exerciseSummary.value = '';

  try {
    const currentCourse = courseId.value;
    const currentExercise = exerciseId.value;

    const indexModule = await import(`../content/courses/${currentCourse}/exercises.json`);
    const index: ExerciseRef[] = indexModule.default;
    const entry = index.find((item) => item.id === currentExercise);
    if (!entry) throw new Error(`Exercise ${currentExercise} not found`);

    exerciseTitle.value = entry.title;
    exerciseSummary.value = entry.summary ?? entry.description ?? '';

    if (entry.file) {
      const exercisePath = `../content/courses/${currentCourse}/exercises/${entry.file}`;
      const exerciseImporter = exerciseModules[exercisePath];
      if (!exerciseImporter) throw new Error(`Exercise module not found for path: ${exercisePath}`);

      const loader = async () => {
        const mod: any = await exerciseImporter();
        const meta = mod.meta ?? {};
        exerciseTitle.value = meta.title ?? entry.title;
        exerciseSummary.value =
          meta.summary ?? meta.description ?? entry.summary ?? entry.description ?? '';
        return mod.default;
      };

      exerciseComponent.value = defineAsyncComponent(loader);
    } else if (entry.link) {
      window.location.href = entry.link;
    }
  } catch (error) {
    console.error('[ExerciseView] Failed to load exercise:', error);
    exerciseTitle.value = 'Erro ao carregar exercício';
    exerciseSummary.value = 'Não foi possível localizar o material solicitado.';
  }
}

onMounted(loadExercise);
watch([courseId, exerciseId], loadExercise);
</script>

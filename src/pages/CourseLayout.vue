<template>
  <section :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-10)' }">
    <div class="card p-8 md:p-10" :style="{ borderRadius: 'var(--md-sys-border-radius-large)' }">
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-4)' }">
          <span class="chip w-fit">Disciplina</span>
          <div>
            <h1 class="text-display-small font-semibold text-[var(--md-sys-color-on-surface)]">
              {{ meta?.title || 'Disciplina' }}
            </h1>
            <p v-if="meta?.description" class="mt-3 supporting-text text-body-large">
              {{ meta.description }}
            </p>
          </div>
          <router-link class="btn btn-text" to="/">Voltar para a página inicial</router-link>
        </div>
        <div
          class="surface-tonal p-5 shadow-elevation-1 md:w-64"
          :style="{ borderRadius: 'var(--md-sys-border-radius-large)' }"
        >
          <p
            class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]"
          >
            Instituição
          </p>
          <p class="mt-2 text-title-large font-semibold text-[var(--md-sys-color-on-surface)]">
            {{ meta?.institution }}
          </p>
        </div>
      </div>
      <div class="mt-6 flex flex-wrap gap-3 text-[var(--md-sys-color-on-surface-variant)]">
        <span class="chip">Plano de estudos</span>
        <span class="chip">Materiais e exercícios</span>
        <span class="chip">Atualização contínua</span>
      </div>
    </div>

    <router-view v-if="loaded" :key="$route.fullPath" />
    <div
      v-else
      class="card p-8 text-center text-body-medium text-[var(--md-sys-color-on-surface-variant)]"
    >
      Carregando informações da disciplina...
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

interface CourseMeta {
  id: string;
  title: string;
  institution: string;
  description?: string;
}

const route = useRoute();
const meta = ref<CourseMeta | null>(null);
const loaded = ref(false);

async function loadMeta(courseId: string) {
  loaded.value = false;
  meta.value = null;
  try {
    const module = await import(`../content/courses/${courseId}/meta.json`);
    meta.value = module.default as CourseMeta;
  } catch (err) {
    console.error('[CourseLayout] Failed to load meta', err);
  } finally {
    loaded.value = true;
  }
}

onMounted(() => {
  if (route.params.courseId) {
    loadMeta(String(route.params.courseId));
  }
});

watch(
  () => route.params.courseId,
  (id) => {
    if (id) {
      loadMeta(String(id));
    }
  }
);
</script>

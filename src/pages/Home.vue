<template>
  <section class="page-section page-section--roomy">
    <header class="card p-6 md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="max-w-2xl md-stack md-stack-3">
          <span class="chip w-fit">Disciplinas</span>
          <h1 class="text-display-small font-semibold text-on-surface">Escolha sua disciplina</h1>
          <p class="supporting-text text-body-large">
            Materiais, exercícios e referências de todas as turmas do professor Tiago Sombra em um
            único lugar. Use a busca para encontrar rapidamente a disciplina desejada.
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 md:w-64 md:grid-cols-1">
          <div class="surface-tonal md-shape-large p-4 md-elevation-1">
            <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
              Disciplinas
            </p>
            <p class="text-display-small font-semibold text-on-surface">
              {{ courses.length }}
            </p>
          </div>
          <div
            class="card card--compact border-none bg-[var(--md-sys-color-surface-container-high)] p-4"
          >
            <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
              Resultados
            </p>
            <p class="text-display-small font-semibold text-on-surface">
              {{ filtered.length }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <Md3Button
          type="button"
          :variant="filtersOpen ? 'tonal' : 'text'"
          :aria-expanded="filtersOpen"
          aria-controls="course-filter-panel"
          @click="toggleFilters"
        >
          <template #leading>
            <component :is="filtersOpen ? ChevronUp : ChevronDown" class="md-icon md-icon--sm" />
          </template>
          {{ filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros' }}
        </Md3Button>

        <transition name="fade-expand">
          <div v-show="filtersOpen" id="course-filter-panel" class="mt-6 md-stack md-stack-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="flex flex-col gap-2">
                <span class="text-label-medium text-on-surface-variant">Buscar disciplina</span>
                <div class="relative">
                  <Search
                    class="md-icon md-icon--sm pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                  <input
                    class="input pl-12"
                    v-model="q"
                    type="search"
                    placeholder="Digite nome, instituição ou descrição"
                    @focus="filtersOpen = true"
                  />
                </div>
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-label-medium text-on-surface-variant"
                  >Filtrar por instituição</span
                >
                <div class="relative">
                  <select class="input appearance-none pr-12" v-model="inst">
                    <option value="">Todas as instituições</option>
                    <option v-for="option in institutions" :key="option">{{ option }}</option>
                  </select>
                  <ChevronDown
                    class="md-icon md-icon--sm pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                </div>
              </label>
            </div>
            <div
              class="flex flex-wrap items-center gap-3 md-sys-typescale-body-small text-on-surface-variant"
            >
              <span class="chip">Busca ativa: {{ q || '-' }}</span>
              <span class="chip">instituição: {{ inst || 'Todas' }}</span>
              <Md3Button variant="text" type="button" @click="clearFilters">
                Limpar filtros
              </Md3Button>
            </div>
          </div>
        </transition>
      </div>
    </header>

    <section class="md-stack md-stack-4">
      <div class="md-stack md-stack-2">
        <h2 class="text-title-large font-semibold text-on-surface">Disciplinas disponíveis</h2>
        <p class="supporting-text">
          Mostrando {{ filtered.length }} de {{ courses.length }} disciplinas cadastrados.
        </p>
      </div>

      <div v-if="filtered.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CourseCard v-for="c in filtered" :key="c.id" :meta="c" />
      </div>
      <div v-else class="card p-8 text-center">
        <h3 class="text-title-medium font-semibold">Nenhuma disciplina encontrada</h3>
        <p class="mt-2 supporting-text">
          Ajuste os filtros ou limpe a busca para visualizar todas as opções disponíveis.
        </p>
        <Md3Button class="mt-4" variant="text" type="button" @click="clearFilters">
          Limpar filtros
        </Md3Button>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
// Home lists all available courses with Material 3 styling and Portuguese copy
import { computed, ref, watch } from 'vue';
import { Search, ChevronDown, ChevronUp } from 'lucide-vue-next';
import { courses } from '../data/courses';
import CourseCard from '../components/CourseCard.vue';
import Md3Button from '@/components/Md3Button.vue';

const q = ref('');
const inst = ref('');
const filtersOpen = ref(false);

const institutions = computed(() => {
  const unique = new Set<string>();
  courses.forEach((c) => unique.add(c.institution));
  return Array.from(unique);
});

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase();
  return courses.filter((course) => {
    const matchesInst = !inst.value || course.institution === inst.value;
    const haystack =
      `${course.title} ${course.institution} ${course.description ?? ''}`.toLowerCase();
    const matchesQuery = !term || haystack.includes(term);
    return matchesInst && matchesQuery;
  });
});

watch([q, inst], ([query, institution]) => {
  if (query || institution) {
    filtersOpen.value = true;
  }
});

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value;
}

function clearFilters() {
  q.value = '';
  inst.value = '';
  filtersOpen.value = false;
}
</script>

<style scoped>
.fade-expand-enter-active,
.fade-expand-leave-active {
  transition: all 180ms ease;
}

.fade-expand-enter-from,
.fade-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  height: 0;
}
</style>

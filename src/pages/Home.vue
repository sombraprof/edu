<template>
  <section class="space-y-10">
    <header class="card rounded-5xl p-6 md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="max-w-2xl space-y-3">
          <span class="chip w-fit">Trilhas universitárias</span>
          <h1 class="text-display-small font-semibold text-[var(--md-sys-color-on-surface)]">Escolha sua disciplina</h1>
          <p class="supporting-text text-body-large">
            Materiais, exercícios e referências de todas as turmas do professor Tiago Sombra em um único lugar. Use a busca para encontrar rapidamente a disciplina desejada.
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 md:w-64 md:grid-cols-1">
          <div class="surface-tonal rounded-4xl p-4 shadow-elevation-1">
            <p class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]">Disciplinas</p>
            <p class="text-display-small font-semibold text-[var(--md-sys-color-on-surface)]">{{ courses.length }}</p>
          </div>
          <div class="card rounded-4xl border-none bg-[var(--md-sys-color-surface-container-high)] p-4">
            <p class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]">Resultados</p>
            <p class="text-display-small font-semibold text-[var(--md-sys-color-on-surface)]">{{ filtered.length }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          class="btn btn-tonal inline-flex items-center gap-2"
          type="button"
          @click="toggleFilters"
        >
          <component :is="filtersOpen ? ChevronUp : ChevronDown" class="h-4 w-4" />
          <span>{{ filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros' }}</span>
        </button>

        <transition name="fade-expand">
          <div v-show="filtersOpen" class="mt-6 space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="flex flex-col gap-2">
                <span class="text-label-medium text-[var(--md-sys-color-on-surface-variant)]">Buscar disciplina</span>
                <div class="relative">
                  <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
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
                <span class="text-label-medium text-[var(--md-sys-color-on-surface-variant)]">Filtrar por instituição</span>
                <div class="relative">
                  <select class="input appearance-none pr-12" v-model="inst">
                    <option value="">Todas as instituições</option>
                    <option v-for="option in institutions" :key="option">{{ option }}</option>
                  </select>
                  <ChevronDown class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
                </div>
              </label>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">
              <span class="chip">Busca ativa: {{ q || '—' }}</span>
              <span class="chip">Instituição: {{ inst || 'Todas' }}</span>
              <button class="btn btn-text" type="button" @click="clearFilters">Limpar filtros</button>
            </div>
          </div>
        </transition>
      </div>
    </header>

    <section class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-title-large font-semibold text-[var(--md-sys-color-on-surface)]">Disciplinas disponíveis</h2>
        <p class="supporting-text">
          Mostrando {{ filtered.length }} de {{ courses.length }} cursos cadastrados.
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
        <button class="btn btn-text mt-4" type="button" @click="clearFilters">Limpar filtros</button>
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
    const haystack = `${course.title} ${course.institution} ${course.description ?? ''}`.toLowerCase();
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

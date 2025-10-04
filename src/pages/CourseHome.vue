<template>
  <section class="md-stack md-stack-8" :aria-busy="isLoading">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="pill-group" role="group" aria-label="Filtro de conteúdo">
        <button
          class="pill-item"
          :class="{ 'pill-item--active': contentFilter === 'all' }"
          :aria-pressed="contentFilter === 'all'"
          type="button"
          @click="updateSection('all')"
        >
          Tudo
        </button>
        <button
          class="pill-item"
          :class="{ 'pill-item--active': contentFilter === 'lesson' }"
          :aria-pressed="contentFilter === 'lesson'"
          type="button"
          @click="updateSection('lesson')"
        >
          Aulas
        </button>
        <button
          class="pill-item"
          :class="{ 'pill-item--active': contentFilter === 'exercise' }"
          :aria-pressed="contentFilter === 'exercise'"
          type="button"
          @click="updateSection('exercise')"
        >
          Exercícios
        </button>
      </div>
      <div class="pill-group" role="group" aria-label="Modo de visualização">
        <button
          class="pill-item"
          :class="{ 'pill-item--active': viewMode === 'grid' }"
          :aria-pressed="viewMode === 'grid'"
          type="button"
          @click="viewMode = 'grid'"
        >
          <Grid3x3 class="md-icon md-icon--sm" />
          Grade
        </button>
        <button
          class="pill-item"
          :class="{ 'pill-item--active': viewMode === 'list' }"
          :aria-pressed="viewMode === 'list'"
          type="button"
          @click="viewMode = 'list'"
        >
          <List class="md-icon md-icon--sm" />
          Lista
        </button>
      </div>
    </header>

    <div
      v-if="isLoading"
      class="card p-8 text-center text-body-medium text-on-surface-variant"
      role="status"
    >
      Carregando conteúdos da disciplina...
    </div>
    <div
      v-else-if="displayItems.length"
      :class="[viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'md-stack md-stack-4']"
    >
      <component
        v-for="item in displayItems"
        :key="item.key"
        :is="item.wrapper"
        class="card flex h-full flex-col gap-4 p-5"
        :class="cardClasses(item)"
        v-bind="item.attrs"
      >
        <div class="flex flex-wrap items-center gap-3 md-sys-typescale-body-small">
          <span class="chip" :class="typeChipClass(item)">{{
            item.type === 'lesson' ? 'Aula' : 'Exercício'
          }}</span>
          <span class="chip" :class="statusChipClass(item)">{{
            item.available ? 'Disponível' : 'Em breve'
          }}</span>
        </div>
        <div class="md-stack md-stack-2">
          <h3 class="text-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">
            {{ item.title }}
          </h3>
          <p v-if="item.description" class="supporting-text">
            {{ item.description }}
          </p>
        </div>
        <div class="mt-auto flex items-center justify-end">
          <template v-if="item.available && item.cta">
            <Md3Button
              as="span"
              variant="text"
              class="course-item__cta text-label-medium font-medium"
            >
              {{ item.cta }}
              <template #trailing>
                <ChevronRight class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
            </Md3Button>
          </template>
          <template v-else-if="!item.available">
            <span class="md-sys-typescale-body-small text-on-surface-variant"
              >Conteúdo em preparação.</span
            >
          </template>
        </div>
      </component>
    </div>
    <div v-else class="card p-8 text-center text-body-medium text-on-surface-variant">
      Nenhum conteúdo encontrado para este filtro.
      <Md3Button class="mt-4" variant="text" type="button" @click="resetFilters">
        Limpar filtros
      </Md3Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronRight, Grid3x3, List } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import { useCourseHomeController, type CourseHomeItem } from './CourseHome.logic';

const controller = useCourseHomeController();

const { contentFilter, viewMode, isLoading, displayItems, resetFilters, updateSection } =
  controller;

const typeChipClass = (item: CourseHomeItem) =>
  item.type === 'lesson' ? 'chip--lesson' : 'chip--exercise';

const statusChipClass = (item: CourseHomeItem) =>
  item.available ? 'chip--available' : 'chip--upcoming';

const cardClasses = (item: CourseHomeItem) => {
  const classes: string[] = [];
  const interactive = item.available && item.wrapper !== 'div';
  if (interactive) {
    classes.push('card--interactive', 'group');
  } else if (!item.available) {
    classes.push('card--disabled');
  }
  classes.push(
    item.type === 'lesson' ? 'course-home__card--lesson' : 'course-home__card--exercise'
  );
  if (viewMode.value === 'list') {
    classes.push('md:flex-row', 'md:items-center', 'md:justify-between');
  }
  return classes.join(' ');
};
</script>

<style scoped>
:global(.course-home__card--lesson) {
  --card-focus-color: var(--md-sys-color-primary);
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface) 88%,
    var(--md-sys-color-primary-container) 12%
  );
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-primary) 26%,
    var(--md-sys-color-outline) 74%
  );
}

:global(.course-home__card--exercise) {
  --card-focus-color: var(--md-sys-color-tertiary);
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface) 84%,
    var(--md-sys-color-tertiary-container) 16%
  );
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-tertiary) 28%,
    var(--md-sys-color-outline) 72%
  );
}

:global(.card--interactive.course-home__card--lesson:hover),
:global(.card--interactive.course-home__card--lesson:focus-visible) {
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-primary) 42%,
    var(--md-sys-color-outline) 58%
  );
}

:global(.card--interactive.course-home__card--exercise:hover),
:global(.card--interactive.course-home__card--exercise:focus-visible) {
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-tertiary) 45%,
    var(--md-sys-color-outline) 55%
  );
}

:global(html[data-theme='dark'] .course-home__card--lesson) {
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-highest) 58%,
    rgba(59, 130, 246, 0.28) 42%
  );
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-primary) 36%,
    var(--md-sys-color-outline-variant) 64%
  );
}

:global(html[data-theme='dark'] .course-home__card--exercise) {
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-highest) 54%,
    rgba(16, 185, 129, 0.32) 46%
  );
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-tertiary) 38%,
    var(--md-sys-color-outline-variant) 62%
  );
}

:global(html[data-theme='dark'] .card--interactive.course-home__card--lesson:hover),
:global(html[data-theme='dark'] .card--interactive.course-home__card--lesson:focus-visible) {
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-primary) 50%,
    var(--md-sys-color-outline-variant) 50%
  );
}

:global(html[data-theme='dark'] .card--interactive.course-home__card--exercise:hover),
:global(html[data-theme='dark'] .card--interactive.course-home__card--exercise:focus-visible) {
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-tertiary) 54%,
    var(--md-sys-color-outline-variant) 46%
  );
}
</style>

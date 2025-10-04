<template>
  <section class="page flow">
    <header class="card md3-surface-section">
      <div class="flex flex-col md3-gap-lg md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col md3-gap-sm">
          <span class="chip chip--outlined self-start text-primary">Iteração 5</span>
          <h1 class="md-typescale-headline-small font-semibold text-on-surface">
            Hub administrativo do professor
          </h1>
          <p class="supporting-text text-on-surface-variant">
            Esta área centraliza recursos de autoria, revisão e publicação. Depois da ingestão, do
            editor visual e do painel de validações, a iteração atual acrescenta o pacote de
            publicação para guiar criação de branches, commits e PRs consistentes.
          </p>
        </div>
        <div class="md3-surface-callout">
          <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
            Próxima entrega
          </p>
          <p class="md-typescale-title-large font-semibold text-on-surface">Backend de automação</p>
          <p class="md3-stack-xs text-sm text-on-surface-variant">
            Objetivo: orquestrar scripts e operações de Git a partir da própria SPA, incluindo
            abertura de PRs.
          </p>
        </div>
      </div>
    </header>

    <TeacherModeGate>
      <section class="card md3-surface-section">
        <div class="flex flex-col md3-gap-sm">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Próximos passos do módulo
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Cada bloco abaixo consolida ações previstas no <em>roadmap</em> e aponta referências
            úteis para começar a execução.
          </p>
        </div>
        <div class="md3-stack-lg grid md3-gap-md md:grid-cols-2">
          <article v-for="item in planSections" :key="item.title" class="md3-surface-tile">
            <header class="flex items-center md3-gap-sm">
              <component :is="item.icon" class="md-icon" aria-hidden="true" />
              <div>
                <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                  {{ item.title }}
                </h3>
                <p class="md-typescale-body-small text-on-surface-variant">
                  {{ item.subtitle }}
                </p>
              </div>
            </header>
            <ul class="md3-stack-md list-disc md3-space-y-xs pl-5 text-sm text-on-surface">
              <li v-for="action in item.actions" :key="action">{{ action }}</li>
            </ul>
            <footer class="md3-stack-md flex flex-wrap md3-gap-sm">
              <template v-for="link in item.links" :key="link.label">
                <Md3Button v-if="'to' in link" variant="tonal" :as="RouterLink" :to="link.to">
                  {{ link.label }}
                </Md3Button>
                <Md3Button
                  v-else
                  variant="tonal"
                  as="a"
                  :href="link.href"
                  :target="link.external ? '_blank' : undefined"
                  :rel="link.external ? 'noreferrer' : undefined"
                >
                  {{ link.label }}
                </Md3Button>
              </template>
            </footer>
          </article>
        </div>
      </section>

      <section class="card md3-surface-section">
        <div class="flex flex-col md3-gap-sm">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Disciplinas disponíveis para autoria
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Acesse a visão atual de cada disciplina para mapear gaps e identificar conteúdos prontos
            para revisão ou publicação.
          </p>
        </div>
        <p v-if="dashboardError" class="rounded-xl border border-error text-sm text-error">
          {{ dashboardError }}
        </p>
        <p v-else-if="dashboardLoading" class="text-sm text-on-surface-variant">
          Carregando disciplinas…
        </p>
        <div v-else class="md3-stack-lg grid md3-gap-md md:grid-cols-2 xl:grid-cols-3">
          <RouterLink
            v-for="course in courses"
            :key="course.id"
            :to="{ name: 'course-home', params: { courseId: course.id } }"
            class="md3-surface-tile transition hover:border-primary hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span class="chip chip--filled mb-3 inline-flex">{{ course.institution }}</span>
            <h3 class="md-typescale-title-medium font-semibold text-on-surface">
              {{ course.title }}
            </h3>
            <p class="md3-stack-xs text-sm text-on-surface-variant">{{ course.description }}</p>
            <p class="md3-stack-md text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              Abrir disciplina
            </p>
          </RouterLink>
        </div>
      </section>

      <section class="card md3-surface-section">
        <div class="flex flex-col md3-gap-sm">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Documentação de apoio
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Consulte os materiais abaixo antes de iniciar uma nova rodada de ingestão ou revisão.
          </p>
        </div>
        <ul class="md3-stack-lg grid md3-gap-md md:grid-cols-2">
          <li v-for="resource in resources" :key="resource.href" class="md3-surface-tile">
            <h3 class="md-typescale-title-medium font-semibold text-on-surface">
              {{ resource.title }}
            </h3>
            <p class="md3-stack-xs text-sm text-on-surface-variant">{{ resource.description }}</p>
            <Md3Button
              class="md3-stack-md"
              variant="text"
              as="a"
              :href="resource.href"
              target="_blank"
              rel="noreferrer"
            >
              Abrir documento
              <template #trailing>
                <ExternalLink class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
            </Md3Button>
          </li>
        </ul>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ExternalLink } from 'lucide-vue-next';

import TeacherModeGate from '../../components/TeacherModeGate.vue';
import Md3Button from '@/components/Md3Button.vue';

import { useFacultyDashboard } from './controllers/useFacultyDashboard';

const {
  filteredCourses,
  planSections,
  resources,
  loading: dashboardLoading,
  error: dashboardError,
} = useFacultyDashboard();

const courses = filteredCourses;
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chip--outlined {
  border: 1px solid currentColor;
}
</style>

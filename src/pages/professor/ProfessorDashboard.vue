<template>
  <section class="page flow">
    <header class="card p-6 md:p-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col gap-3">
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
        <div class="rounded-3xl bg-[var(--md-sys-color-surface-container-high)] p-4">
          <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
            Próxima entrega
          </p>
          <p class="md-typescale-title-large font-semibold text-on-surface">Backend de automação</p>
          <p class="mt-2 text-sm text-on-surface-variant">
            Objetivo: orquestrar scripts e operações de Git a partir da própria SPA, incluindo
            abertura de PRs.
          </p>
        </div>
      </div>
    </header>

    <TeacherModeGate>
      <section class="card p-6 md:p-8">
        <div class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Próximos passos do módulo
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Cada bloco abaixo consolida ações previstas no <em>roadmap</em> e aponta referências
            úteis para começar a execução.
          </p>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <article
            v-for="item in planSections"
            :key="item.title"
            class="rounded-3xl border border-transparent bg-[var(--md-sys-color-surface-container-high)] p-5"
          >
            <header class="flex items-center gap-3">
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
            <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-on-surface">
              <li v-for="action in item.actions" :key="action">{{ action }}</li>
            </ul>
            <footer class="mt-4 flex flex-wrap gap-3">
              <template v-for="link in item.links" :key="link.label">
                <RouterLink v-if="'to' in link" :to="link.to" class="btn btn-tonal">
                  {{ link.label }}
                </RouterLink>
                <a v-else class="btn btn-tonal" :href="link.href" target="_blank" rel="noreferrer">
                  {{ link.label }}
                </a>
              </template>
            </footer>
          </article>
        </div>
      </section>

      <section class="card p-6 md:p-8">
        <div class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Disciplinas disponíveis para autoria
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Acesse a visão atual de cada disciplina para mapear gaps e identificar conteúdos prontos
            para revisão ou publicação.
          </p>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <RouterLink
            v-for="course in courses"
            :key="course.id"
            :to="{ name: 'course-home', params: { courseId: course.id } }"
            class="rounded-3xl border border-transparent bg-[var(--md-sys-color-surface-container-high)] p-5 transition hover:border-primary hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span class="chip chip--filled mb-3 inline-flex">{{ course.institution }}</span>
            <h3 class="md-typescale-title-medium font-semibold text-on-surface">
              {{ course.title }}
            </h3>
            <p class="mt-2 text-sm text-on-surface-variant">{{ course.description }}</p>
            <p class="mt-4 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
              Abrir disciplina
            </p>
          </RouterLink>
        </div>
      </section>

      <section class="card p-6 md:p-8">
        <div class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Documentação de apoio
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Consulte os materiais abaixo antes de iniciar uma nova rodada de ingestão ou revisão.
          </p>
        </div>
        <ul class="mt-6 grid gap-4 md:grid-cols-2">
          <li
            v-for="resource in resources"
            :key="resource.href"
            class="rounded-3xl border border-transparent bg-[var(--md-sys-color-surface-container-high)] p-5"
          >
            <h3 class="md-typescale-title-medium font-semibold text-on-surface">
              {{ resource.title }}
            </h3>
            <p class="mt-2 text-sm text-on-surface-variant">{{ resource.description }}</p>
            <a
              class="btn btn-text mt-4 inline-flex items-center gap-2"
              :href="resource.href"
              target="_blank"
              rel="noreferrer"
            >
              Abrir documento
              <ExternalLink class="md-icon md-icon--sm" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router';
import {
  ClipboardList,
  FileJson,
  GitBranch,
  ListChecks,
  PenSquare,
  Workflow,
  ExternalLink,
} from 'lucide-vue-next';
import { courses as courseCatalog } from '../../data/courses';
import TeacherModeGate from '../../components/TeacherModeGate.vue';

const courses = courseCatalog;

type PlanLink =
  | { label: string; to: RouteLocationRaw }
  | { label: string; href: string; external?: boolean };

const planSections: Array<{
  title: string;
  subtitle: string;
  icon: unknown;
  actions: string[];
  links: PlanLink[];
}> = [
  {
    title: 'Mapear requisitos e workflows',
    subtitle: 'Inventariar schemas, papéis e validações obrigatórias.',
    icon: Workflow,
    actions: [
      'Listar blocos suportados e campos obrigatórios do schema.',
      'Identificar papéis (autor, revisor) e permissões necessárias.',
      'Consolidar checklist de validação antes do commit.',
    ],
    links: [
      {
        label: 'Guia de autoria',
        href: 'https://github.com/tiagosombra/edu/blob/main/docs/CONTENT_AUTHORING_GUIDE.md',
      },
      {
        label: 'Playbook de prompts',
        href: 'https://github.com/tiagosombra/edu/blob/main/docs/LLM_PROMPT_PLAYBOOK.md',
      },
    ],
  },
  {
    title: 'Desenhar arquitetura do módulo',
    subtitle: 'Planejar SPA, backend auxiliar e integrações CLI.',
    icon: ClipboardList,
    actions: [
      'Definir sub-rotas e componentes principais do hub.',
      'Mapear chamadas aos scripts de validação existentes.',
      'Esboçar estratégia de workspace para edição antes do commit.',
    ],
    links: [
      {
        label: 'Plano detalhado',
        href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/README.md',
      },
    ],
  },
  {
    title: 'Ferramentas de ingestão',
    subtitle: 'Validar JSONs e manter o checklist de governança atualizado.',
    icon: FileJson,
    actions: [
      'Testar uploads reais e registrar feedbacks na documentação viva.',
      'Comparar validação via AJV (SPA) e via CLI (`npm run validate:content`).',
      'Sincronizar checklist operacional com o time de conteúdo.',
    ],
    links: [
      { label: 'Abrir ferramenta de ingestão', to: { name: 'professor-ingestion' } },
      {
        label: 'Registro da Iteração 2',
        href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-02.md',
      },
    ],
  },
  {
    title: 'Editor visual de blocos',
    subtitle: 'Revisar lessonPlan, callouts, cardGrid e contentBlock pela SPA.',
    icon: PenSquare,
    actions: [
      'Carregar JSON validado e revisar metadados principais.',
      'Editar blocos suportados e acompanhar pré-visualização textual.',
      'Exportar o pacote revisado para commit ou nova rodada de ingestão.',
    ],
    links: [
      { label: 'Abrir editor visual', to: { name: 'professor-editor' } },
      {
        label: 'Registro da Iteração 3',
        href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-03.md',
      },
    ],
  },
  {
    title: 'Validações automatizadas',
    subtitle: 'Centralizar execuções dos scripts e métricas de publicação.',
    icon: ListChecks,
    actions: [
      'Registrar execuções dos comandos oficiais diretamente no painel.',
      'Importar relatórios gerados para revisar métricas críticas antes do commit.',
      'Mapear requisitos do backend para acionar scripts remotamente.',
    ],
    links: [
      { label: 'Abrir painel de validações', to: { name: 'professor-validation' } },
      {
        label: 'Registro da Iteração 4',
        href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-04.md',
      },
    ],
  },
  {
    title: 'Pacote de publicação',
    subtitle: 'Organizar branches, commits, validações e PRs.',
    icon: GitBranch,
    actions: [
      'Planejar branch, mensagem de commit e descrição do PR.',
      'Listar conteúdos incluídos na rodada para revisão cruzada.',
      'Gerar comandos padronizados com checklist de validações.',
    ],
    links: [
      { label: 'Abrir pacote de publicação', to: { name: 'professor-publication' } },
      {
        label: 'Registro da Iteração 5',
        href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-05.md',
      },
    ],
  },
];

const resources = [
  {
    title: 'Plano de implementação do módulo',
    description: 'Documento vivo com decisões, iterações e governança do painel administrativo.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/README.md',
  },
  {
    title: 'Guia de autoria de conteúdo',
    description:
      'Passo a passo para criar lições, exercícios e suplementos alinhados ao schema oficial.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/CONTENT_AUTHORING_GUIDE.md',
  },
  {
    title: 'Playbook de prompts para LLM',
    description: 'Sugestões de prompts e checklist de revisão para conteúdos assistidos por IA.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/LLM_PROMPT_PLAYBOOK.md',
  },
  {
    title: 'Relatório de validação mais recente',
    description: 'Painel público com status dos cursos, problemas e avisos em aberto.',
    href: 'https://github.com/tiagosombra/edu/blob/main/reports/validation-report.md',
  },
  {
    title: 'Registro vivo da Iteração 5',
    description: 'Planejamento do pacote de publicação e integração com Git.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-05.md',
  },
  {
    title: 'Registro vivo da Iteração 3',
    description: 'Diário da construção do editor visual e próximos aprimoramentos.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-03.md',
  },
  {
    title: 'Registro vivo da Iteração 4',
    description: 'Acompanhamento da centralização dos scripts e importação de relatórios.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-04.md',
  },
  {
    title: 'Registro vivo da Iteração 2',
    description: 'Atualizações contínuas sobre ingestão de JSON, feedbacks e próximos ajustes.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-02.md',
  },
] as const;
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

import { computed, onMounted, reactive, ref } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import {
  ClipboardList,
  FileJson,
  GitBranch,
  ListChecks,
  PenSquare,
  Workflow,
} from 'lucide-vue-next';

import { courses as courseCatalog, type CourseMeta } from '@/data/courses';

export type FacultyDashboardPlanLink =
  | { label: string; to: RouteLocationRaw }
  | { label: string; href: string; external?: boolean };

export interface FacultyDashboardPlanSection {
  title: string;
  subtitle: string;
  icon: unknown;
  actions: string[];
  links: FacultyDashboardPlanLink[];
}

export interface FacultyDashboardResource {
  title: string;
  description: string;
  href: string;
}

const planSectionsCatalog: FacultyDashboardPlanSection[] = [
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
      { label: 'Abrir ferramenta de ingestão', to: { name: 'faculty-ingestion' } },
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
      { label: 'Abrir editor visual', to: { name: 'faculty-editor' } },
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
      { label: 'Abrir painel de validações', to: { name: 'faculty-validation' } },
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
      { label: 'Abrir pacote de publicação', to: { name: 'faculty-publication' } },
      {
        label: 'Registro da Iteração 5',
        href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-05.md',
      },
    ],
  },
];

const resourceCatalog: FacultyDashboardResource[] = [
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
];

export interface UseFacultyDashboardOptions {
  fetchCourses?: () => Promise<CourseMeta[]>;
  fetchPlanSections?: () => Promise<FacultyDashboardPlanSection[]>;
  fetchResources?: () => Promise<FacultyDashboardResource[]>;
  autoLoad?: boolean;
}

export function useFacultyDashboard(options: UseFacultyDashboardOptions = {}) {
  const fetchCourses = options.fetchCourses ?? (async () => courseCatalog);
  const fetchPlanSections = options.fetchPlanSections ?? (async () => planSectionsCatalog);
  const fetchResources = options.fetchResources ?? (async () => resourceCatalog);

  const loading = ref(false);
  const error = ref<string | null>(null);

  const courses = ref<CourseMeta[]>([]);
  const planSections = ref<FacultyDashboardPlanSection[]>([]);
  const resources = ref<FacultyDashboardResource[]>([]);

  const filters = reactive({
    search: '',
    institution: 'all',
  });

  const hasFilters = computed(() => {
    return (
      filters.search.trim().length > 0 || (filters.institution && filters.institution !== 'all')
    );
  });

  const filteredCourses = computed(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const institutionFilter = filters.institution;

    return courses.value.filter((course) => {
      const matchesInstitution =
        institutionFilter === 'all' ||
        course.institution.toLowerCase() === institutionFilter.toLowerCase();

      if (!matchesInstitution) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      const haystack = [course.title, course.institution, course.description ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(searchTerm);
    });
  });

  async function loadDashboard() {
    loading.value = true;
    error.value = null;

    try {
      const [coursesResult, planSectionsResult, resourcesResult] = await Promise.all([
        fetchCourses(),
        fetchPlanSections(),
        fetchResources(),
      ]);

      courses.value = coursesResult;
      planSections.value = planSectionsResult;
      resources.value = resourcesResult;
    } catch (err) {
      courses.value = [];
      planSections.value = [];
      resources.value = [];

      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Falha ao carregar dados do painel.';
      }
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    filters.search = '';
    filters.institution = 'all';
  }

  if (options.autoLoad !== false) {
    onMounted(() => {
      void loadDashboard();
    });
  }

  return {
    loading,
    error,
    courses,
    planSections,
    resources,
    filters,
    hasFilters,
    filteredCourses,
    loadDashboard,
    resetFilters,
  } as const;
}

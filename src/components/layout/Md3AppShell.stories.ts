import type { Meta, StoryObj, StoryFn } from '@storybook/vue3';
import { ref, getCurrentInstance } from 'vue';
import { createRouter, createMemoryHistory, useRoute } from 'vue-router';
import Md3AppShell from './Md3AppShell.vue';
import ThemeToggle from '../ThemeToggle.vue';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'course-overview', component: { template: '<div />' } },
    { path: '/lessons', name: 'course-lessons', component: { template: '<div />' } },
    { path: '/exercises', name: 'course-exercises', component: { template: '<div />' } },
    { path: '/governance', name: 'course-governance', component: { template: '<div />' } },
  ],
});

function ensureRouter() {
  const instance = getCurrentInstance();
  if (!instance) {
    return;
  }
  const app = instance.appContext.app as Record<string, unknown> & {
    __STORYBOOK_ROUTER__?: boolean;
  };
  if (!app.__STORYBOOK_ROUTER__) {
    app.use(router);
    app.__STORYBOOK_ROUTER__ = true;
  }
}

const navigationItems = [
  {
    id: 'overview',
    label: 'Panorama',
    icon: 'compass',
    badge: 'Visão geral',
    to: { name: 'course-overview' },
  },
  { id: 'lessons', label: 'Aulas', icon: 'book-open', badge: '18', to: { name: 'course-lessons' } },
  {
    id: 'exercises',
    label: 'Exercícios',
    icon: 'clipboard-list',
    badge: '12',
    to: { name: 'course-exercises' },
  },
  { id: 'governance', label: 'Governança', icon: 'shield-check', disabled: true },
];

const breadcrumbItems = [
  { id: 'dashboard', label: 'Cursos', href: '#' },
  { id: 'course', label: 'Algoritmos I', to: { name: 'course-overview' } },
  { id: 'unit', label: 'Unidade 02 · Estruturas de decisão' },
];

const meta: Meta<typeof Md3AppShell> = {
  title: 'Layout/Md3AppShell',
  component: Md3AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Shell responsivo que coordena rail, drawer modal, breadcrumbs, busca contextual e barra inferior para cursos MD3.',
      },
    },
  },
  decorators: [
    (story: StoryFn) => ({
      components: { Story: story() },
      setup() {
        ensureRouter();
        router.push({ name: 'course-overview' }).catch(() => {
          /* ignore redundant navigation */
        });
        return {};
      },
      template: '<Story />',
    }),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

const modules = [
  {
    id: 'module-2',
    title: 'Unidade 02 · Estruturas de decisão',
    summary: 'Fluxogramas, operadores lógicos, estudos de caso e preparação para a NP1.',
    status: '6 aulas migradas',
  },
  {
    id: 'module-3',
    title: 'Unidade 03 · Laços de repetição',
    summary:
      'Atividades assíncronas e laboratórios com `while`, `for` e tabelas de acompanhamento.',
    status: 'Em revisão docente',
  },
  {
    id: 'project',
    title: 'Projeto integrador',
    summary: 'Plano de voo com checkpoints semanais, rubrica unificada e roteiros de laboratório.',
    status: 'Entrega prevista em 30/09',
  },
];

const upcoming = [
  { id: 'lab-04', title: 'Lab 04 · Menu condicional', due: 'Entrega 12/09', type: 'Laboratório' },
  {
    id: 'quiz-05',
    title: 'Quiz 05 · Operadores lógicos',
    due: 'Disponível até 15/09',
    type: 'Avaliação',
  },
  { id: 'review', title: 'Checklist NP1', due: 'Revisão 16/09', type: 'Governança' },
];

export const CursoCompleto: Story = {
  args: {
    title: 'Algoritmos e Programação I',
    navigation: navigationItems,
    breadcrumbs: breadcrumbItems,
    topBarVariant: 'medium',
    enableSearch: true,
    searchPlaceholder: 'Buscar aulas, exercícios ou materiais',
  },
  render: (args) => ({
    components: { Md3AppShell, ThemeToggle },
    setup() {
      ensureRouter();
      router.push({ name: 'course-overview' }).catch(() => {
        /* ignore redundant navigation */
      });
      const searchValue = ref('');
      const lastQuery = ref('—');
      const lastNavigation = ref('overview');
      const lastBreadcrumb = ref('—');
      const route = useRoute();

      const handleSearchUpdate = (value: string) => {
        searchValue.value = value;
      };
      const handleSubmitSearch = (value: string) => {
        lastQuery.value = value || '—';
      };
      const handleClearSearch = () => {
        searchValue.value = '';
        lastQuery.value = '—';
      };
      const handleNavigation = (id: string) => {
        lastNavigation.value = id;
      };
      const handleBreadcrumb = (id: string) => {
        lastBreadcrumb.value = id;
      };

      return {
        args,
        navigationItems,
        breadcrumbItems,
        modules,
        upcoming,
        searchValue,
        lastQuery,
        lastNavigation,
        lastBreadcrumb,
        route,
        handleSearchUpdate,
        handleSubmitSearch,
        handleClearSearch,
        handleNavigation,
        handleBreadcrumb,
      };
    },
    template: `
      <Md3AppShell
        v-bind="args"
        :navigation="args.navigation || navigationItems"
        :breadcrumbs="args.breadcrumbs || breadcrumbItems"
        :search-value="searchValue"
        @update:searchValue="handleSearchUpdate"
        @submit-search="handleSubmitSearch"
        @clear-search="handleClearSearch"
        @select-navigation="handleNavigation"
        @select-breadcrumb="handleBreadcrumb"
      >
        <template #brand>
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div
              style="width:2.5rem;height:2.5rem;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:600;background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container);"
            >
              AI
            </div>
            <div style="display:flex;flex-direction:column;gap:0.125rem;">
              <span style="font-weight:600;">Algoritmos I</span>
              <span style="font-size:0.875rem;color:var(--md-sys-color-on-surface-variant);">Turma 2025.1 · 6h restantes</span>
            </div>
          </div>
        </template>
        <template #actions>
          <ThemeToggle class="md3-top-app-bar__action md3-top-app-bar__action--icon" />
          <button type="button" class="md3-top-app-bar__action">Exportar plano</button>
        </template>
        <template #main>
          <div style="display:flex;flex-direction:column;gap:1.5rem;padding:1.5rem;">
            <section style="display:grid;gap:0.75rem;">
              <p style="margin:0;color:var(--md-sys-color-on-surface-variant);">
                Rota atual: <strong>{{ route.name }}</strong> · Última navegação: <strong>{{ lastNavigation }}</strong> · Última busca enviada: <strong>{{ lastQuery }}</strong> · Breadcrumb selecionado: <strong>{{ lastBreadcrumb }}</strong>
              </p>
              <div
                style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));"
              >
                <article
                  v-for="module in modules"
                  :key="module.id"
                  style="border-radius:1rem;padding:1rem 1.25rem;background:var(--md-sys-color-surface-variant);color:var(--md-sys-color-on-surface-variant);display:flex;flex-direction:column;gap:0.75rem;"
                >
                  <div>
                    <h3 style="margin:0 0 0.25rem 0;font-size:1rem;color:var(--md-sys-color-on-surface);">{{ module.title }}</h3>
                    <p style="margin:0;font-size:0.9rem;">{{ module.summary }}</p>
                  </div>
                  <span style="font-weight:600;color:var(--md-sys-color-secondary);">{{ module.status }}</span>
                </article>
              </div>
            </section>
          </div>
        </template>
        <template #secondary>
          <aside
            style="display:flex;flex-direction:column;gap:1rem;padding:1.5rem;background:var(--md-sys-color-surface-variant);border-radius:1.5rem;color:var(--md-sys-color-on-surface-variant);min-width:18rem;"
          >
            <h3 style="margin:0;font-size:1rem;color:var(--md-sys-color-on-surface);">Próximas ações</h3>
            <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.75rem;">
              <li v-for="item in upcoming" :key="item.id" style="display:flex;flex-direction:column;gap:0.25rem;">
                <span style="font-weight:600;color:var(--md-sys-color-on-surface);">{{ item.title }}</span>
                <span>{{ item.type }} · {{ item.due }}</span>
              </li>
            </ul>
            <button type="button" class="md3-top-app-bar__action" style="align-self:flex-start;">Abrir painel completo</button>
          </aside>
        </template>
      </Md3AppShell>
    `,
  }),
};

import type { Meta, StoryObj } from '@storybook/vue3';
import Md3TopAppBar from './Md3TopAppBar.vue';
import ThemeToggle from '../ThemeToggle.vue';

const meta: Meta<typeof Md3TopAppBar> = {
  title: 'Layout/Md3TopAppBar',
  component: Md3TopAppBar,
  argTypes: {
    variant: {
      control: 'select',
      options: ['small', 'center-aligned', 'medium', 'large'],
    },
    density: {
      control: 'inline-radio',
      options: ['default', 'comfortable', 'compact'],
    },
  },
  args: {
    variant: 'small',
    density: 'default',
    sticky: false,
    observeScroll: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Componente de barra superior Material 3 com variantes small, center-aligned, medium e large.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    variant: 'small',
  },
  render: (args) => ({
    components: { Md3TopAppBar, ThemeToggle },
    setup: () => ({ args }),
    template: `
      <Md3TopAppBar v-bind="args">
        <template #default>
          <span>Portal Acadêmico</span>
        </template>
        <template #actions>
          <a class="md3-top-app-bar__action" href="#">Cursos</a>
          <a class="md3-top-app-bar__action" href="#">Agenda</a>
          <ThemeToggle class="md3-top-app-bar__action md3-top-app-bar__action--icon" />
        </template>
      </Md3TopAppBar>
    `,
  }),
};

export const CenterAligned: Story = {
  args: {
    variant: 'center-aligned',
  },
  render: Small.render,
};

export const Medium: Story = {
  args: {
    variant: 'medium',
    density: 'comfortable',
  },
  render: (args) => ({
    components: { Md3TopAppBar },
    setup: () => ({ args }),
    template: `
      <Md3TopAppBar v-bind="args">
        <template #leading>
          <div style="display:flex;align-items:center;gap:0.5rem;color:var(--md-sys-color-on-surface-variant);">
            <span style="font-weight:600;">Algoritmos I</span>
            <span style="font-size:0.875rem;">Turma 2025.1</span>
          </div>
        </template>
        <template #default>
          <div style="display:flex;flex-direction:column;gap:0.25rem;">
            <span style="font-size:1.75rem;font-weight:600;">Unidade 2 · Estruturas de Decisão</span>
            <span style="font-size:0.875rem;color:var(--md-sys-color-on-surface-variant);">Fluxos principais e avaliação contínua</span>
          </div>
        </template>
        <template #actions>
          <button class="md3-top-app-bar__action">Exportar plano</button>
        </template>
      </Md3TopAppBar>
    `,
  }),
};

export const Large: Story = {
  args: {
    variant: 'large',
    density: 'default',
  },
  render: Medium.render,
};

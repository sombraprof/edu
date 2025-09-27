import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import Md3Breadcrumbs from './Md3Breadcrumbs.vue';

const meta: Meta<typeof Md3Breadcrumbs> = {
  title: 'Layout/Md3Breadcrumbs',
  component: Md3Breadcrumbs,
  args: {
    ariaLabel: 'Trilha de navegação',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Breadcrumbs responsivos com suporte a ícones, links externos e estados desabilitados para orientar o fluxo do docente.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const demoItems = [
  { id: 'home', label: 'Painel', href: '#' },
  { id: 'course', label: 'Algoritmos I', href: '#' },
  { id: 'unit', label: 'Unidade 02 · Decisão' },
];

export const Default: Story = {
  args: {
    items: demoItems,
  },
};

export const Interativo: Story = {
  args: {
    items: [
      { id: 'home', label: 'Painel', href: '#', icon: 'house' },
      { id: 'courses', label: 'Cursos', href: '#', icon: 'graduation-cap' },
      { id: 'course', label: 'Algoritmos I', href: '#', icon: 'puzzle' },
      { id: 'unit', label: 'Unidade 02 · Decisão' },
    ],
  },
  render: (args) => ({
    components: { Md3Breadcrumbs },
    setup() {
      const lastSelection = ref('—');
      const onSelect = (id: string) => {
        lastSelection.value = id;
      };
      return { args, lastSelection, onSelect };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;padding:1.5rem;background:var(--md-sys-color-surface);">
        <Md3Breadcrumbs v-bind="args" @select="onSelect" />
        <p style="margin:0;color:var(--md-sys-color-on-surface-variant);">
          Última seleção: <strong>{{ lastSelection }}</strong>
        </p>
      </div>
    `,
  }),
};

export const ComDisabled: Story = {
  args: {
    items: [
      { id: 'home', label: 'Painel', href: '#', icon: 'house' },
      { id: 'course', label: 'Algoritmos I', href: '#', icon: 'book-open' },
      { id: 'unit', label: 'Unidade 02 · Decisão', disabled: true },
      { id: 'lesson', label: 'Aula 07 · Operadores lógicos' },
    ],
  },
  render: Interativo.render,
};

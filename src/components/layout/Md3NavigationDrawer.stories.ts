import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import Md3NavigationDrawer from './Md3NavigationDrawer.vue';

const meta: Meta<typeof Md3NavigationDrawer> = {
  title: 'Layout/Md3NavigationDrawer',
  component: Md3NavigationDrawer,
  args: {
    density: 'default',
    variant: 'standard',
  },
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['default', 'compact'],
    },
    variant: {
      control: 'inline-radio',
      options: ['standard', 'modal'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const drawerItems = [
  { id: 'overview', label: 'Panorama', description: 'Resumo da disciplina', icon: 'layout-grid' },
  { id: 'modules', label: 'Módulos', description: 'Aulas e materiais', icon: 'layers', badge: '5' },
  {
    id: 'assessments',
    label: 'Avaliações',
    description: 'Provas e entregas',
    icon: 'clipboard-list',
  },
];

export const Standard: Story = {
  render: (args) => ({
    components: { Md3NavigationDrawer },
    setup() {
      const activeId = ref('overview');
      const handleSelect = (id: string) => {
        activeId.value = id;
      };
      return { args, activeId, handleSelect, drawerItems };
    },
    template: `
      <div style="display:flex;gap:2rem;">
        <Md3NavigationDrawer
          v-bind="args"
          :items="args.items || drawerItems"
          :active-id="activeId"
          @update:active-id="handleSelect"
        />
        <section style="flex:1;padding:1.5rem;">
          <h2 style="margin:0 0 0.5rem 0;">Conteúdo ativo</h2>
          <p>Última seção selecionada: <strong>{{ activeId }}</strong></p>
        </section>
      </div>
    `,
  }),
  args: {
    items: drawerItems,
  },
};

export const Modal: Story = {
  args: {
    items: drawerItems,
    variant: 'modal',
    density: 'compact',
  },
  render: Standard.render,
};

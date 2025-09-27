import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import Md3NavigationRail from './Md3NavigationRail.vue';

const meta: Meta<typeof Md3NavigationRail> = {
  title: 'Layout/Md3NavigationRail',
  component: Md3NavigationRail,
  args: {
    density: 'default',
    variant: 'expanded',
  },
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['default', 'compact'],
    },
    variant: {
      control: 'inline-radio',
      options: ['expanded', 'collapsed'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const demoItems = [
  { id: 'overview', label: 'Panorama', icon: 'compass' },
  { id: 'lessons', label: 'Aulas', icon: 'book-open', badge: '12' },
  { id: 'exams', label: 'Avaliações', icon: 'file-text' },
];

export const Interactive: Story = {
  render: (args) => ({
    components: { Md3NavigationRail },
    setup() {
      const activeId = ref('overview');
      const onSelect = (id: string) => {
        activeId.value = id;
      };
      return { args, activeId, onSelect, demoItems };
    },
    template: `
      <div style="display:flex;gap:2rem;min-height:20rem;">
        <Md3NavigationRail
          v-bind="args"
          :items="args.items || demoItems"
          :active-id="activeId"
          @update:active-id="onSelect"
        />
        <div style="padding:1rem;">
          <h3 style="margin:0 0 0.5rem 0;">Área de conteúdo</h3>
          <p>Seleção ativa: <strong>{{ activeId }}</strong></p>
        </div>
      </div>
    `,
  }),
  args: {
    items: demoItems,
  },
};

export const Collapsed: Story = {
  args: {
    items: demoItems,
    variant: 'collapsed',
  },
  render: Interactive.render,
};

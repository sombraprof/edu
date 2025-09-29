import type { Meta, StoryObj } from '@storybook/vue3';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { ref } from 'vue';
import Md3NavigationDrawer from './Md3NavigationDrawer.vue';
import { teacherDrawerItems } from './storyMetrics';

const CUSTOM_VIEWPORTS = {
  pixel7: {
    name: 'Pixel 7',
    styles: { width: '412px', height: '915px' },
    type: 'mobile' as const,
  },
  desktop1440: {
    name: 'Desktop 1440',
    styles: { width: '1440px', height: '900px' },
    type: 'desktop' as const,
  },
};

const meta: Meta<typeof Md3NavigationDrawer> = {
  title: 'Layout/Md3NavigationDrawer',
  component: Md3NavigationDrawer,
  args: {
    density: 'default',
    variant: 'standard',
    items: teacherDrawerItems,
  },
  parameters: {
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        ...CUSTOM_VIEWPORTS,
      },
      defaultViewport: 'desktop1440',
    },
    docs: {
      description: {
        component:
          'Navigation drawer padrão com badges reais do painel docente. Em telas largas ele substitui o rail quando precisamos de descrições ricas.',
      },
    },
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

export const Standard: Story = {
  render: (args) => ({
    components: { Md3NavigationDrawer },
    setup() {
      const activeId = ref(args.activeId ?? 'overview');
      const handleSelect = (id: string) => {
        activeId.value = id;
      };
      return { args, activeId, handleSelect };
    },
    template: `
      <div style="display:flex;gap:2rem;">
        <Md3NavigationDrawer
          v-bind="args"
          :items="args.items"
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
  parameters: {
    docs: {
      description: {
        story:
          'Drawer padrão em viewport desktop. Os badges de aulas, exercícios e governança refletem os relatórios do painel docente.',
      },
    },
  },
};

export const Modal: Story = {
  args: {
    variant: 'modal',
    density: 'compact',
  },
  render: Standard.render,
  parameters: {
    viewport: {
      defaultViewport: 'pixel7',
    },
    docs: {
      description: {
        story:
          'Drawer modal em viewport mobile. Use junto ao bottom bar para orientar navegação por métricas enquanto mantém foco no conteúdo.',
      },
    },
  },
};

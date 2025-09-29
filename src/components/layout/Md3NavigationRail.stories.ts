import type { Meta, StoryObj } from '@storybook/vue3';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { ref } from 'vue';
import Md3NavigationRail from './Md3NavigationRail.vue';
import { teacherRailItems } from './storyMetrics';

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

const meta: Meta<typeof Md3NavigationRail> = {
  title: 'Layout/Md3NavigationRail',
  component: Md3NavigationRail,
  args: {
    density: 'default',
    variant: 'expanded',
    items: teacherRailItems,
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
          'Navigation rail expandido no desktop com badges conectadas às métricas reais do painel docente. Ajuste o viewport para Pixel 7 para validar o comportamento colapsado usado em telas menores.',
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
      options: ['expanded', 'collapsed'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => ({
    components: { Md3NavigationRail },
    setup() {
      const activeId = ref(args.activeId ?? 'overview');
      const onSelect = (id: string) => {
        activeId.value = id;
      };
      return { args, activeId, onSelect };
    },
    template: `
      <div style="display:flex;gap:2rem;min-height:20rem;">
        <Md3NavigationRail
          v-bind="args"
          :items="args.items"
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
};

export const Collapsed: Story = {
  args: {
    variant: 'collapsed',
  },
  render: Interactive.render,
  parameters: {
    docs: {
      description: {
        story:
          'Rail colapsado destacando apenas ícones no desktop. Continua exibindo os badges derivados das métricas do painel.',
      },
    },
  },
};

export const MobileRailPeek: Story = {
  args: {
    variant: 'collapsed',
    density: 'compact',
  },
  parameters: {
    viewport: {
      defaultViewport: 'pixel7',
    },
    docs: {
      description: {
        story:
          'Viewport mobile simulando a transição para o modo drawer/bottom bar. O rail permanece colapsado como affordance lateral quando há espaço disponível.',
      },
    },
  },
  render: Interactive.render,
};

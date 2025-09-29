import type { Meta, StoryObj } from '@storybook/vue3';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { ref } from 'vue';
import Md3BottomAppBar from './Md3BottomAppBar.vue';
import { teacherBottomActions } from './storyMetrics';

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

const meta: Meta<typeof Md3BottomAppBar> = {
  title: 'Layout/Md3BottomAppBar',
  component: Md3BottomAppBar,
  args: {
    ariaLabel: 'Navegação principal',
    actions: teacherBottomActions,
    activeId: 'overview',
  },
  parameters: {
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        ...CUSTOM_VIEWPORTS,
      },
      defaultViewport: 'pixel7',
    },
    docs: {
      description: {
        component:
          'Barra inferior MD3 com até cinco ações principais, replicando a navegação móvel do shell responsivo. Os badges exibem as mesmas métricas consumidas pelo painel docente.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    actions: teacherBottomActions,
    activeId: 'overview',
  },
  render: (args) => ({
    components: { Md3BottomAppBar },
    setup() {
      const activeId = ref(args.activeId ?? 'overview');
      const onSelect = (id: string) => {
        activeId.value = id;
      };
      return { args, activeId, onSelect };
    },
    template: `
      <div style="padding:2rem;background:var(--md-sys-color-surface);display:flex;flex-direction:column;gap:1rem;">
        <Md3BottomAppBar
          v-bind="args"
          :actions="args.actions"
          :active-id="activeId"
          @update:active-id="onSelect"
          @select="onSelect"
        />
        <p style="margin:0;color:var(--md-sys-color-on-surface-variant);">
          Seleção atual: <strong>{{ activeId }}</strong>
        </p>
      </div>
    `,
  }),
};

export const ComDisabled: Story = {
  args: {
    actions: [
      ...teacherBottomActions.slice(0, 3),
      { id: 'settings', label: 'Configurações', icon: 'settings', disabled: true },
    ],
    activeId: 'lessons',
  },
  render: Interactive.render,
  parameters: {
    docs: {
      description: {
        story:
          'Exemplo com ação extra desabilitada mantendo as métricas reais nas demais entradas.',
      },
    },
  },
};

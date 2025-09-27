import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import Md3BottomAppBar from './Md3BottomAppBar.vue';

const meta: Meta<typeof Md3BottomAppBar> = {
  title: 'Layout/Md3BottomAppBar',
  component: Md3BottomAppBar,
  args: {
    ariaLabel: 'Navegação principal',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Barra inferior MD3 com até cinco ações principais, replicando a navegação móvel do shell responsivo.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const demoActions = [
  { id: 'overview', label: 'Panorama', icon: 'compass' },
  { id: 'lessons', label: 'Aulas', icon: 'book-open' },
  { id: 'exercises', label: 'Exercícios', icon: 'clipboard-list' },
  { id: 'governance', label: 'Governança', icon: 'shield-check' },
];

export const Interactive: Story = {
  args: {
    actions: demoActions,
    activeId: 'overview',
  },
  render: (args) => ({
    components: { Md3BottomAppBar },
    setup() {
      const activeId = ref(args.activeId ?? 'overview');
      const onSelect = (id: string) => {
        activeId.value = id;
      };
      return { args, activeId, onSelect, demoActions };
    },
    template: `
      <div style="padding:2rem;background:var(--md-sys-color-surface);display:flex;flex-direction:column;gap:1rem;">
        <Md3BottomAppBar
          v-bind="args"
          :actions="args.actions || demoActions"
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
      ...demoActions.slice(0, 3),
      { id: 'settings', label: 'Configurações', icon: 'settings', disabled: true },
    ],
    activeId: 'lessons',
  },
  render: Interactive.render,
};

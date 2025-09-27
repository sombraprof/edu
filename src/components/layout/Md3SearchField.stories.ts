import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import Md3SearchField from './Md3SearchField.vue';

const meta: Meta<typeof Md3SearchField> = {
  title: 'Layout/Md3SearchField',
  component: Md3SearchField,
  args: {
    placeholder: 'Buscar aulas, exercícios ou materiais',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Campo de busca MD3 com botão de envio, ação de limpar e suporte a rótulo acessível para o shell e páginas de curso.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Buscar no curso',
  },
  render: (args) => ({
    components: { Md3SearchField },
    setup() {
      const modelValue = ref('');
      const lastQuery = ref('');
      const handleUpdate = (value: string) => {
        modelValue.value = value;
      };
      const handleSubmit = (value: string) => {
        lastQuery.value = value;
      };
      const handleClear = () => {
        modelValue.value = '';
        lastQuery.value = '';
      };
      return { args, modelValue, lastQuery, handleUpdate, handleSubmit, handleClear };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;padding:1.5rem;background:var(--md-sys-color-surface);max-width:32rem;">
        <Md3SearchField
          v-bind="args"
          :model-value="modelValue"
          @update:model-value="handleUpdate"
          @submit="handleSubmit"
          @clear="handleClear"
        />
        <p style="margin:0;color:var(--md-sys-color-on-surface-variant);">
          Última busca enviada: <strong>{{ lastQuery || '—' }}</strong>
        </p>
      </div>
    `,
  }),
};

export const SemLabel: Story = {
  args: {
    label: '',
    ariaLabel: 'Buscar materiais',
    placeholder: 'Buscar materiais extras',
  },
  render: Default.render,
};

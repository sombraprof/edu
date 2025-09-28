import type { Meta, StoryObj } from '@storybook/vue3';
import Callout from './Callout.vue';

const meta: Meta<typeof Callout> = {
  title: 'Lesson/Blocks/Callout',
  component: Callout,
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const WithCodeSample: Story = {
  args: {
    variant: 'info',
    title: 'Dica de implementação',
    content: [
      {
        type: 'paragraph',
        text: 'Quando precisar compartilhar trechos de código, mantenha-os dentro do fluxo do conteúdo.',
      },
      {
        type: 'code',
        code: `if (!user.isAuthenticated()) {
  throw new Error('Faça login para continuar');
}`,
        language: 'javascript',
      },
      {
        type: 'paragraph',
        text: 'O espaçamento do bloco se adapta automaticamente ao contexto do callout e pode ser ajustado por token.',
      },
    ],
  },
  render: (args) => ({
    components: { Callout },
    setup() {
      return { args };
    },
    template: `
      <div class="lesson-block-story md-stack md-stack-6" style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
        <Callout v-bind="args" />
      </div>
    `,
  }),
};

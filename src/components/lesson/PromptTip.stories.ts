import type { Meta, StoryObj } from '@storybook/vue3';
import PromptTip from './PromptTip.vue';

const meta: Meta<typeof PromptTip> = {
  title: 'Lesson/Blocks/PromptTip',
  component: PromptTip,
  parameters: {
    backgrounds: {
      disable: false,
      default: 'ChatGPT Night',
      values: [
        { name: 'ChatGPT Night', value: '#202123' },
        { name: 'ChatGPT Jade', value: '#10a37f' },
        { name: 'Studio Surface', value: '#f7f8fb' },
      ],
    },
  },
  args: {
    data: {
      title: 'Briefing para sandbox TOTVS',
      description: 'Prompt base para acelerar o laboratório de experimentação controlada.',
      audience: 'equipes de implantação',
      prompt:
        'Você é um especialista TOTVS em serviços. Estruture um roteiro de experimentos no sandbox que valide integrações críticas, riscos regulatórios e impactos financeiros.',
      tags: ['laboratório', 'sandbox TOTVS', 'experimentos guiados'],
      tips: [
        'Peça uma versão com foco exclusivo em finanças e conciliações.',
        'Solicite perguntas de checagem para entrevistas com áreas parceiras.',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PromptTip>;

export const Default: Story = {
  render: (args) => ({
    components: { PromptTip },
    setup() {
      return { args };
    },
    template: `
      <div class="lesson-block-story md-stack md-stack-6" style="max-width: 56rem; margin: 0 auto; padding: 2rem;">
        <PromptTip v-bind="args" />
      </div>
    `,
  }),
};

export const Minimal: Story = {
  args: {
    data: {
      prompt: 'Monte uma agenda de daily stand-up com foco em desafios do sprint atual.',
    },
  },
  render: (args) => ({
    components: { PromptTip },
    setup() {
      return { args };
    },
    template: `
      <div class="lesson-block-story md-stack md-stack-6" style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
        <PromptTip v-bind="args" />
      </div>
    `,
  }),
};

export const WithPlayfulTips: Story = {
  args: {
    data: {
      title: 'Variações criativas',
      description: 'Teste abordagens diferentes para envolver squads.',
      prompt:
        'Atue como facilitador ágil e escreva um anúncio inspirador convidando o time a usar o sandbox de integrações TOTVS.',
      tags: ['comunicação', 'engajamento'],
      tips: [
        'Reescreva como se fosse um thread de rede social com tom informal.',
        'Gere uma versão curta para ser usada como descrição no Slack.',
        'Peça uma alternativa destacando métricas de sucesso do laboratório.',
      ],
    },
  },
  render: (args) => ({
    components: { PromptTip },
    setup() {
      return { args };
    },
    template: `
      <div class="lesson-block-story md-stack md-stack-6" style="max-width: 56rem; margin: 0 auto; padding: 2rem;">
        <PromptTip v-bind="args" />
      </div>
    `,
  }),
};

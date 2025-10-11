import type { Meta, StoryObj } from '@storybook/vue3';
import ChecklistEditor from './ChecklistEditor.vue';
import TimelineEditor from './TimelineEditor.vue';
import StepperEditor from './StepperEditor.vue';
import GlossaryEditor from './GlossaryEditor.vue';
import FlashcardsEditor from './FlashcardsEditor.vue';
import VideosEditor from './VideosEditor.vue';
import InteractiveDemoEditor from './InteractiveDemoEditor.vue';
import CodeSubmissionEditor from './CodeSubmissionEditor.vue';
import PromptTipEditor from './PromptTipEditor.vue';
import DesignEmbedEditor from './DesignEmbedEditor.vue';

const meta: Meta = {
  title: 'Authoring/Blocks/Editors',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj;

export const Checklist: Story = {
  render: () => ({
    components: { ChecklistEditor },
    template: '<ChecklistEditor :block="block" />',
    data: () => ({
      block: {
        type: 'checklist',
        title: 'Checklist pré-aula',
        description: 'Garanta que o laboratório está pronto para a turma.',
        items: ['Testar projetor', 'Configurar IDE', 'Revisar roteiro'],
      },
    }),
  }),
};

export const Timeline: Story = {
  render: () => ({
    components: { TimelineEditor },
    template: '<TimelineEditor :block="block" />',
    data: () => ({
      block: {
        type: 'timeline',
        title: 'Cronograma da aula',
        description: 'Do kickoff à retrospectiva.',
        steps: [
          { title: 'Introdução', content: 'Apresente objetivos e agenda.' },
          { title: 'Exploração', content: 'Hands-on em grupos.' },
        ],
      },
    }),
  }),
};

export const Stepper: Story = {
  render: () => ({
    components: { StepperEditor },
    template: '<StepperEditor :block="block" />',
    data: () => ({
      block: {
        type: 'stepper',
        title: 'Fluxo de resolução',
        steps: [
          { title: 'Planejar', description: 'Defina entradas e saídas.' },
          { title: 'Implementar', description: 'Escreva o código e testes.' },
        ],
      },
    }),
  }),
};

export const Glossary: Story = {
  render: () => ({
    components: { GlossaryEditor },
    template: '<GlossaryEditor :block="block" />',
    data: () => ({
      block: {
        type: 'glossary',
        title: 'Termos-chave',
        terms: [
          { term: 'API', definition: 'Interface de programação de aplicações.' },
          { term: 'SDK', definition: 'Conjunto de ferramentas para criar integrações.' },
        ],
      },
    }),
  }),
};

export const Flashcards: Story = {
  render: () => ({
    components: { FlashcardsEditor },
    template: '<FlashcardsEditor :block="block" />',
    data: () => ({
      block: {
        type: 'flashcards',
        title: 'Revisão rápida',
        cards: [
          { front: 'O que é DOM?', back: 'Representação do documento em árvore.' },
          { front: 'JSON', back: 'Formato leve de troca de dados.' },
        ],
      },
    }),
  }),
};

export const Videos: Story = {
  render: () => ({
    components: { VideosEditor },
    template: '<VideosEditor :block="block" />',
    data: () => ({
      block: {
        type: 'videos',
        title: 'Vídeos de apoio',
        videos: [
          { title: 'Introdução ao tema', url: 'https://youtu.be/intro' },
          { title: 'Exemplo prático', url: 'https://youtu.be/example' },
        ],
      },
    }),
  }),
};

export const InteractiveDemo: Story = {
  render: () => ({
    components: { InteractiveDemoEditor },
    template: '<InteractiveDemoEditor :block="block" />',
    data: () => ({
      block: {
        type: 'interactiveDemo',
        title: 'Simulador de algoritmos',
        url: 'https://demo.edu/algoritmo',
        description: 'Experimente diferentes entradas e observe os resultados em tempo real.',
      },
    }),
  }),
};

export const DesignEmbed: Story = {
  render: () => ({
    components: { DesignEmbedEditor },
    template: '<DesignEmbedEditor :block="block" />',
    data: () => ({
      block: {
        type: 'designEmbed',
        title: 'Fluxo de onboarding',
        description: 'Teste o protótipo navegando pelos principais caminhos.',
        provider: 'figma',
        url: 'https://www.figma.com/file/abc123/Onboarding?type=design',
        hints: ['Use o zoom para ver detalhes.', 'Registre insights durante a navegação.'],
      },
    }),
  }),
};

export const CodeSubmission: Story = {
  render: () => ({
    components: { CodeSubmissionEditor },
    template: '<CodeSubmissionEditor :block="block" />',
    data: () => ({
      block: {
        type: 'codeSubmission',
        title: 'Implementar função soma',
        description: 'Resolva a função e garanta que passe em todos os testes.',
        language: 'python',
        starterCode: 'def soma(a, b):\n    # TODO',
        tests: ['assert soma(1, 2) == 3', 'assert soma(-1, 1) == 0'],
      },
    }),
  }),
};

export const PromptTip: Story = {
  render: () => ({
    components: { PromptTipEditor },
    template: '<PromptTipEditor :block="block" />',
    data: () => ({
      block: {
        type: 'promptTip',
        title: 'Contextualize seu prompt',
        description: 'Use papéis claros e dados concretos para orientar o modelo.',
        audience: 'Times de mentoria',
        prompt: 'Você é um mentor técnico. Analise o código abaixo e sugira melhorias.',
        tags: ['prompt-engineering', 'mentoria'],
        tips: ['Evite termos vagos.', 'Peça exemplos de saída.'],
      },
    }),
  }),
};

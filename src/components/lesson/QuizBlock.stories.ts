import type { Meta, StoryObj } from '@storybook/vue3';
import QuizBlock from './QuizBlock.vue';

const meta: Meta<typeof QuizBlock> = {
  title: 'Lesson/Blocks/QuizBlock',
  component: QuizBlock,
};

export default meta;
type Story = StoryObj<typeof QuizBlock>;

export const SingleChoice: Story = {
  render: () => ({
    components: { QuizBlock },
    template: `
      <div style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
        <QuizBlock
          :data="{
            title: 'Quiz — Operadores',
            question: 'Qual é o resultado de <code>2 + 2 * 2</code>?',
            multiple: false,
            options: [
              { text: 'A) 6', correct: true, explanation: 'Multiplicação antes da soma: 2 + (2*2) = 6.' },
              { text: 'B) 8', correct: false },
              { text: 'C) 4', correct: false }
            ],
            feedback: { correct: 'Certo!', incorrect: 'Quase lá.' }
          }"
        />
      </div>
    `,
  }),
};

export const MultipleChoice: Story = {
  render: () => ({
    components: { QuizBlock },
    template: `
      <div style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
        <QuizBlock
          :data="{
            title: 'Quiz — Estruturas Lineares',
            question: 'Selecione as estruturas lineares:',
            multiple: true,
            options: [
              { text: 'Fila', correct: true, explanation: 'Sim, é linear.' },
              { text: 'Pilha', correct: true, explanation: 'Sim, é linear.' },
              { text: 'Árvore', correct: false }
            ]
          }"
        />
      </div>
    `,
  }),
};

import type { Meta, StoryObj } from '@storybook/vue3';
import Flashcards from './Flashcards.vue';

const meta: Meta<typeof Flashcards> = {
  title: 'Lesson/Blocks/Flashcards',
  component: Flashcards,
};

export default meta;
type Story = StoryObj<typeof Flashcards>;

export const BasicDeck: Story = {
  render: () => ({
    components: { Flashcards },
    template: `
      <div style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
        <Flashcards
          :data="{
            title: 'Flashcards — Conceitos OOP',
            description: 'Use espaço/enter para virar, setas para navegar.',
            shuffle: true,
            cards: [
              { front: '<b>Encapsulamento</b>', back: 'Protege estado interno expondo interface.' },
              { front: '<b>Herança</b>', back: 'Reuso e especialização de classes.' },
              { question: 'Polimorfismo?', answer: 'Múltiplas formas de um mesmo contrato.' }
            ]
          }"
        />
      </div>
    `,
  }),
};

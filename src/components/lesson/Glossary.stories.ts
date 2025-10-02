import type { Meta, StoryObj } from '@storybook/vue3';
import Glossary from './Glossary.vue';

const meta: Meta<typeof Glossary> = {
  title: 'Lesson/Blocks/Glossary',
  component: Glossary,
};

export default meta;
type Story = StoryObj<typeof Glossary>;

export const WithFilter: Story = {
  render: () => ({
    components: { Glossary },
    template: `
      <div style="max-width: 56rem; margin: 0 auto; padding: 2rem;">
        <Glossary :data="{
          title: 'Glossário — OOP',
          items: [
            { term: 'Encapsulamento', definition: 'Ocultar detalhes internos de implementação.' },
            { term: 'Herança', definition: 'Especialização de classes.' },
            { term: 'Polimorfismo', definition: 'Múltiplas formas de um mesmo contrato.' }
          ]
        }" />
      </div>
    `,
  }),
};

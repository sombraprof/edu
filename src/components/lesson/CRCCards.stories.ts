import type { Meta, StoryObj } from '@storybook/vue3';
import CRCCards from './CRCCards.vue';

const meta: Meta<typeof CRCCards> = {
  title: 'Lesson/Blocks/CRCCards',
  component: CRCCards,
};

export default meta;
type Story = StoryObj<typeof CRCCards>;

export const Basic: Story = {
  render: () => ({
    components: { CRCCards },
    template: `
      <div style="max-width: 72rem; margin: 0 auto; padding: 2rem;">
        <CRCCards :data="{
          title: 'CRC — Sistema de Biblioteca',
          classes: [
            {
              name: 'Livro',
              responsibilities: ['Armazenar metadados', 'Disponibilizar status'],
              collaborators: ['Autor', 'Empréstimo']
            },
            {
              name: 'Usuário',
              responsibilities: ['Solicitar empréstimo', 'Devolver item'],
              collaborators: ['Empréstimo']
            },
            {
              name: 'Empréstimo',
              responsibilities: ['Controlar vencimento', 'Registrar multa'],
              collaborators: ['Usuário', 'Livro']
            }
          ]
        }" />
      </div>
    `,
  }),
};

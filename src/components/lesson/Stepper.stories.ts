import type { Meta, StoryObj } from '@storybook/vue3';
import Stepper from './Stepper.vue';

const meta: Meta<typeof Stepper> = {
  title: 'Lesson/Blocks/Stepper',
  component: Stepper,
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Basic: Story = {
  render: () => ({
    components: { Stepper },
    template: `
      <div style="max-width: 56rem; margin: 0 auto; padding: 2rem;">
        <Stepper :data="{
          title: 'Pipeline de implementação',
          summary: 'Siga as etapas na ordem sugerida.',
          steps: [
            { title: 'Planejamento', description: 'Defina escopo e riscos.' },
            { title: 'Desenvolvimento', html: '<p>Implemente as funcionalidades centrais.</p>' },
            { title: 'Teste', code: 'npm test', language: 'bash' }
          ]
        }" />
      </div>
    `,
  }),
};

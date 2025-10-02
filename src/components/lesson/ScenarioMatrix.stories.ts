import type { Meta, StoryObj } from '@storybook/vue3';
import ScenarioMatrix from './ScenarioMatrix.vue';

const meta: Meta<typeof ScenarioMatrix> = {
  title: 'Lesson/Blocks/ScenarioMatrix',
  component: ScenarioMatrix,
};

export default meta;
type Story = StoryObj<typeof ScenarioMatrix>;

export const Basic: Story = {
  render: () => ({
    components: { ScenarioMatrix },
    template: `
      <div style="max-width: 64rem; margin: 0 auto; padding: 2rem;">
        <ScenarioMatrix :data="{
          title: 'Matriz 2x2 — TGS',
          x: { label: 'Automação', positive: 'Alta', negative: 'Baixa' },
          y: { label: 'Complexidade', positive: 'Alta', negative: 'Baixa' },
          items: [
            { label: 'Cenário A', quadrant: '++' },
            { label: 'Cenário B', quadrant: '+-' },
            { label: 'Cenário C', quadrant: '-+' },
            { label: 'Cenário D', quadrant: '--' }
          ]
        }" />
      </div>
    `,
  }),
};

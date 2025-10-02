import type { Meta, StoryObj } from '@storybook/vue3';
import ParsonsPuzzle from './ParsonsPuzzle.vue';

const meta: Meta<typeof ParsonsPuzzle> = {
  title: 'Lesson/Blocks/ParsonsPuzzle',
  component: ParsonsPuzzle,
};

export default meta;
type Story = StoryObj<typeof ParsonsPuzzle>;

export const Basic: Story = {
  render: () => ({
    components: { ParsonsPuzzle },
    template: `
      <div style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
        <ParsonsPuzzle :data="{
          title: 'Parsons — Soma de elementos',
          instructions: 'Reordene as linhas para formar o algoritmo correto.',
          shuffle: false,
          lines: [
            'int sum = 0;',
            'for (int i = 0; i < n; i++) {',
            '  sum += v[i];',
            '}',
            'printf("%d", sum);'
          ],
          solution: [
            'int sum = 0;',
            'for (int i = 0; i < n; i++) {',
            '  sum += v[i];',
            '}',
            'printf("%d", sum);'
          ]
        }" />
      </div>
    `,
  }),
};

import type { Meta, StoryObj } from '@storybook/vue3';
import TabsBlock from './TabsBlock.vue';

const meta: Meta<typeof TabsBlock> = {
  title: 'Lesson/Blocks/TabsBlock',
  component: TabsBlock,
};

export default meta;
type Story = StoryObj<typeof TabsBlock>;

export const Basics: Story = {
  render: () => ({
    components: { TabsBlock },
    template: `
      <div style="max-width: 56rem; margin: 0 auto; padding: 2rem;">
        <TabsBlock :data="{
          title: 'Abas — Comparativo',
          tabs: [
            { label: 'Texto', content: '<p>Conteúdo em HTML sanitizado.</p>' },
            { label: 'Código', code: 'console.log(\'Olá\')', language: 'javascript' }
          ]
        }" />
      </div>
    `,
  }),
};

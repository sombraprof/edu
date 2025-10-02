import type { Meta, StoryObj } from '@storybook/vue3';
import SpriteSheetViewer from './SpriteSheetViewer.vue';

const meta: Meta<typeof SpriteSheetViewer> = {
  title: 'Lesson/Blocks/SpriteSheetViewer',
  component: SpriteSheetViewer,
};

export default meta;
type Story = StoryObj<typeof SpriteSheetViewer>;

export const Basic: Story = {
  render: () => ({
    components: { SpriteSheetViewer },
    template: `
      <div style="max-width: 32rem; margin: 0 auto; padding: 2rem;">
        <SpriteSheetViewer :data="{
          title: 'Spritesheet — Personagem',
          src: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Free-scrolling-game-spritesheet.png',
          frameWidth: 64,
          frameHeight: 64,
          cols: 8,
          rows: 4,
          frameCount: 32,
          fps: 8
        }" />
      </div>
    `,
  }),
};

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SpriteSheetViewer from '../SpriteSheetViewer.vue';

describe('SpriteSheetViewer', () => {
  it('advances frames on next()', async () => {
    const wrapper = mount(SpriteSheetViewer, {
      props: {
        data: {
          src: 'https://example.com/sprite.png',
          frameWidth: 32,
          frameHeight: 32,
          cols: 4,
          rows: 2,
          frameCount: 8,
          fps: 0,
        },
      },
    });

    const counter = () => wrapper.find('.sprite-viewer__counter').text();
    expect(counter()).toMatch(/1 \/ 8/);
    await wrapper.findAll('button')[2].trigger('click'); // Próximo
    expect(counter()).toMatch(/2 \/ 8/);
  });
});

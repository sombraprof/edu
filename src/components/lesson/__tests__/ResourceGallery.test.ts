import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ResourceGallery from '../ResourceGallery.vue';

describe('ResourceGallery', () => {
  it('renders inline items and filters by type', async () => {
    const wrapper = mount(ResourceGallery, {
      props: {
        data: {
          title: 'Galeria',
          items: [
            {
              type: 'image',
              title: 'Img 1',
              url: 'https://example.com/a',
              thumbnail: 'https://example.com/a.jpg',
              source: 'X',
            },
            { type: 'audio', title: 'Audio 1', url: 'https://example.com/b', source: 'Y' },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('Galeria');
    expect(wrapper.findAll('.resource-gallery__card').length).toBe(2);
  });
});

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ParsonsPuzzle from '../ParsonsPuzzle.vue';

describe('ParsonsPuzzle', () => {
  it('reorders lines and checks correctness', async () => {
    const wrapper = mount(ParsonsPuzzle, {
      props: {
        data: {
          title: 'Parsons',
          shuffle: false,
          lines: ['B', 'A', 'C'],
          solution: ['A', 'B', 'C'],
        },
      },
    });

    const items = () => wrapper.findAll('.lesson-parsons__item');
    expect(items().length).toBe(3);
    // Move up second item (A) to the top
    await items()[1].find('button').trigger('click');
    await wrapper.find('button.md-button--filled').trigger('click');
    expect(wrapper.text()).toMatch(/Certo|Correto/i);
  });
});

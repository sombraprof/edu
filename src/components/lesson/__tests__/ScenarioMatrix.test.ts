import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ScenarioMatrix from '../ScenarioMatrix.vue';

describe('ScenarioMatrix', () => {
  it('renders items into quadrants', () => {
    const wrapper = mount(ScenarioMatrix, {
      props: {
        data: {
          x: { label: 'X', positive: 'Pos', negative: 'Neg' },
          y: { label: 'Y', positive: 'Pos', negative: 'Neg' },
          items: [
            { label: 'A', quadrant: '++' },
            { label: 'B', quadrant: '--' },
          ],
        },
      },
    });

    const plusPlus = wrapper.find('[data-q="++"]');
    const minusMinus = wrapper.find('[data-q="--"]');
    expect(plusPlus.text()).toContain('A');
    expect(minusMinus.text()).toContain('B');
  });
});

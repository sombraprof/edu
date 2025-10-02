import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CRCCards from '../CRCCards.vue';

describe('CRCCards', () => {
  it('renders CRC cards grid', () => {
    const wrapper = mount(CRCCards, {
      props: {
        data: {
          title: 'CRC',
          classes: [
            { name: 'Livro', responsibilities: ['A'], collaborators: ['B'] },
            { name: 'Usuário', responsibilities: ['C'], collaborators: ['D'] },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('CRC');
    expect(wrapper.findAll('.crc-card').length).toBe(2);
  });
});

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TabsBlock from '../TabsBlock.vue';

describe('TabsBlock', () => {
  it('renders tabs and switches panels', async () => {
    const wrapper = mount(TabsBlock, {
      props: {
        data: {
          title: 'Abas',
          tabs: [
            { label: 'A', content: '<p>Conteúdo A</p>' },
            { label: 'B', content: '<p>Conteúdo B</p>' },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('Abas');
    const tabButtons = wrapper.findAll('.lesson-tabs__tab');
    expect(tabButtons).toHaveLength(2);
    await tabButtons[1].trigger('click');
    expect(wrapper.text()).toContain('Conteúdo B');
  });
});

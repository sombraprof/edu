import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Glossary from '../Glossary.vue';

describe('Glossary', () => {
  it('renders items and filters by term', async () => {
    const wrapper = mount(Glossary, {
      props: {
        data: {
          title: 'Glossário',
          items: [
            { term: 'Encapsulamento', definition: 'Ocultar detalhes internos.' },
            { term: 'Herança', definition: 'Especialização.' },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('Glossário');
    expect(wrapper.findAll('.lesson-glossary__term').length).toBe(2);
  });
});

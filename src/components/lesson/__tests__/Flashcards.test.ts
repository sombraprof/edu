import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Flashcards from '../Flashcards.vue';

describe('Flashcards', () => {
  it('renders deck and flips', async () => {
    const wrapper = mount(Flashcards, {
      props: {
        data: {
          title: 'Deck',
          cards: [
            { front: '<b>A</b>', back: 'A-back' },
            { question: 'B?', answer: 'B-back' },
          ],
          shuffle: false,
        },
      },
    });

    expect(wrapper.text()).toContain('Deck');
    const card = wrapper.find('.lesson-flashcards__card');
    expect(card.exists()).toBe(true);
    await card.trigger('click');
    expect(card.attributes('data-flipped')).toBe('true');
  });
});

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import QuizBlock from '../QuizBlock.vue';

describe('QuizBlock', () => {
  it('renders options and verifies single-choice flow', async () => {
    const wrapper = mount(QuizBlock, {
      props: {
        data: {
          title: 'Mini-Quiz',
          question: '2 + 2 * 2 = ?',
          multiple: false,
          shuffle: false,
          options: [
            { text: '6', correct: true, explanation: 'Multiplicação antes da soma.' },
            { text: '8', correct: false },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('Mini-Quiz');
    const inputs = wrapper.findAll('input[type="radio"]');
    expect(inputs).toHaveLength(2);
    await inputs[0].setValue();
    await wrapper.find('button.md-button--filled').trigger('click');
    expect(wrapper.text()).toMatch(/Certo|Correto|Certo!/i);
  });
});

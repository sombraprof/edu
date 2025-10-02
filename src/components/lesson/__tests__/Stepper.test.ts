import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Stepper from '../Stepper.vue';

describe('Stepper', () => {
  it('renders steps and navigates', async () => {
    const wrapper = mount(Stepper, {
      props: {
        data: {
          title: 'Stepper',
          steps: [
            { title: 'Um', description: 'Primeiro' },
            { title: 'Dois', description: 'Segundo' },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('Stepper');
    expect(wrapper.text()).toContain('Um');
    await wrapper.find('button.md-button--filled').trigger('click');
    expect(wrapper.text()).toContain('Dois');
  });
});

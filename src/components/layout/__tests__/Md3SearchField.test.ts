import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Md3SearchField from '../Md3SearchField.vue';

describe('Md3SearchField', () => {
  it('emits updates and submit events', async () => {
    const wrapper = mount(Md3SearchField, {
      props: {
        modelValue: '',
      },
    });

    const input = wrapper.find('input');
    await input.setValue('algoritmos');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['algoritmos']);

    await wrapper.setProps({ modelValue: 'algoritmos' });
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit')?.[0]).toEqual(['algoritmos']);

    await wrapper.find('button[type="button"]').trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
  });
});

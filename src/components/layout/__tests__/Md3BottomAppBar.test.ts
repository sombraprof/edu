import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Md3BottomAppBar from '../Md3BottomAppBar.vue';

describe('Md3BottomAppBar', () => {
  it('emits select and update events when clicking actions', async () => {
    const wrapper = mount(Md3BottomAppBar, {
      props: {
        activeId: 'overview',
        actions: [
          { id: 'overview', label: 'Visão geral', icon: 'layout-dashboard' },
          { id: 'lessons', label: 'Aulas', icon: 'book-open' },
        ],
      },
    });

    const lessonButton = wrapper.findAll('button').at(1);
    await lessonButton?.trigger('click');

    expect(wrapper.emitted('update:activeId')?.[0]).toEqual(['lessons']);
    expect(wrapper.emitted('select')?.[0]).toEqual(['lessons']);
  });
});

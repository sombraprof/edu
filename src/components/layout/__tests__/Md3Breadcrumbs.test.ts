import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Md3Breadcrumbs from '../Md3Breadcrumbs.vue';

describe('Md3Breadcrumbs', () => {
  it('emits select when clicking intermediate breadcrumb', async () => {
    const wrapper = mount(Md3Breadcrumbs, {
      props: {
        items: [
          { id: 'home', label: 'Início', href: '/' },
          { id: 'course', label: 'Disciplina', href: '/curso' },
          { id: 'lesson', label: 'Aula 01' },
        ],
      },
    });

    await wrapper
      .find('.md3-breadcrumbs__item:first-child .md3-breadcrumbs__link')
      .trigger('click');

    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')?.[0]).toEqual(['home']);
  });

  it('does not emit when clicking the current breadcrumb', async () => {
    const wrapper = mount(Md3Breadcrumbs, {
      props: {
        items: [
          { id: 'home', label: 'Início', href: '/' },
          { id: 'lesson', label: 'Aula 01' },
        ],
      },
    });

    await wrapper.findAll('.md3-breadcrumbs__item').at(-1)?.trigger('click');

    expect(wrapper.emitted('select')).toBeUndefined();
  });
});

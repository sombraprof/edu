import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Md3NavigationDrawer from '../Md3NavigationDrawer.vue';

const items = [
  { id: 'overview', label: 'Overview', icon: 'home', description: 'Resumo do curso' },
  { id: 'content', label: 'Conteúdo', icon: 'book', badge: '12' },
];

describe('Md3NavigationDrawer', () => {
  it('renders drawer items and marks active entries', () => {
    const wrapper = mount(Md3NavigationDrawer, {
      props: {
        items,
        activeId: 'content',
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(items.length);
    expect(buttons[1].classes()).toContain('md3-navigation-drawer__item--active');
    expect(buttons[1].text()).toContain('12');
  });

  it('emits select events when clicking entries', async () => {
    const wrapper = mount(Md3NavigationDrawer, {
      props: {
        items,
      },
    });

    const [, second] = wrapper.findAll('button');
    await second.trigger('click');

    expect(wrapper.emitted('select')?.[0]).toEqual(['content']);
    expect(wrapper.emitted('update:activeId')?.[0]).toEqual(['content']);
  });

  it('applies modal and density variants', () => {
    const wrapper = mount(Md3NavigationDrawer, {
      props: {
        items,
        variant: 'modal',
        density: 'compact',
      },
    });

    expect(wrapper.classes()).toContain('md3-navigation-drawer--modal');
    expect(wrapper.classes()).toContain('md3-navigation-drawer--compact');
  });
});

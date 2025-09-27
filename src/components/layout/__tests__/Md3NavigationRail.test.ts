import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Md3NavigationRail from '../Md3NavigationRail.vue';

const items = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'lessons', label: 'Lessons', icon: 'book-open' },
];

describe('Md3NavigationRail', () => {
  it('renders actions and marks the active item', () => {
    const wrapper = mount(Md3NavigationRail, {
      props: {
        items,
        activeId: 'lessons',
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(items.length);
    expect(buttons[1].classes()).toContain('md3-navigation-rail__item--active');
  });

  it('emits selection events when clicked', async () => {
    const wrapper = mount(Md3NavigationRail, {
      props: {
        items,
      },
    });

    const [first, second] = wrapper.findAll('button');
    await second.trigger('click');

    expect(wrapper.emitted('update:activeId')).toBeTruthy();
    expect(wrapper.emitted('update:activeId')?.[0]).toEqual(['lessons']);
    expect(wrapper.emitted('select')?.[0]).toEqual(['lessons']);

    await first.trigger('click');
    expect(wrapper.emitted('update:activeId')?.[1]).toEqual(['overview']);
  });

  it('applies density and collapsed modifiers', () => {
    const wrapper = mount(Md3NavigationRail, {
      props: {
        items,
        density: 'compact',
        variant: 'collapsed',
      },
    });

    expect(wrapper.classes()).toContain('md3-navigation-rail--compact');
    expect(wrapper.classes()).toContain('md3-navigation-rail--collapsed');
  });
});

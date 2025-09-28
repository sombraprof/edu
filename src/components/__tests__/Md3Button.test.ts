import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Md3Button from '../Md3Button.vue';

describe('Md3Button', () => {
  it('renders default variant with label content', () => {
    const wrapper = mount(Md3Button, {
      slots: {
        default: 'Ação',
      },
    });

    expect(wrapper.classes()).toContain('md3-button');
    expect(wrapper.classes()).toContain('md3-button--filled');
    expect(wrapper.text()).toContain('Ação');
  });

  it('supports icon slots and alternate variants', () => {
    const wrapper = mount(Md3Button, {
      props: {
        variant: 'tonal',
      },
      slots: {
        leading: '<span data-test="icon" />',
        default: 'Com ícone',
      },
    });

    expect(wrapper.classes()).toContain('md3-button--tonal');
    expect(wrapper.find('[data-test="icon"]').exists()).toBe(true);
    expect(wrapper.find('.md3-button__icon--leading').exists()).toBe(true);
  });

  it('applies aria-disabled semantics when rendering non-button tags', () => {
    const wrapper = mount(Md3Button, {
      props: {
        as: 'a',
        disabled: true,
      },
      attrs: {
        href: 'https://example.com',
      },
      slots: {
        default: 'Link',
      },
    });

    const element = wrapper.element as HTMLAnchorElement;
    expect(element.tagName).toBe('A');
    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.attributes('tabindex')).toBe('-1');
    expect(wrapper.attributes('href')).toBeUndefined();
  });
});

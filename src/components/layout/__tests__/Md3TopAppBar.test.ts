import { mount } from '@vue/test-utils';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import Md3TopAppBar from '../Md3TopAppBar.vue';

let scrollValue = 0;

function mockScroll(value: number) {
  scrollValue = value;
  window.dispatchEvent(new Event('scroll'));
}

describe('Md3TopAppBar', () => {
  beforeEach(() => {
    scrollValue = 0;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollValue,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'scrollY');
  });

  it('applies variant and density modifiers', async () => {
    const wrapper = mount(Md3TopAppBar, {
      props: {
        variant: 'medium',
        density: 'compact',
      },
      slots: {
        default: '<h1>Title</h1>',
      },
    });

    expect(wrapper.classes()).toContain('md3-top-app-bar--variant-medium');
    expect(wrapper.classes()).toContain('md3-top-app-bar--density-compact');

    await wrapper.setProps({ variant: 'large', density: 'default' });
    expect(wrapper.classes()).toContain('md3-top-app-bar--variant-large');
    expect(wrapper.classes()).toContain('md3-top-app-bar--density-default');
  });

  it('toggles elevated state when scrolling', async () => {
    const wrapper = mount(Md3TopAppBar, {
      props: {
        observeScroll: true,
      },
      slots: {
        default: '<span>Title</span>',
      },
    });

    expect((wrapper.vm as unknown as { isRaised: boolean }).isRaised).toBe(false);
    expect(wrapper.classes()).not.toContain('md3-top-app-bar--raised');

    mockScroll(20);
    await nextTick();

    expect((wrapper.vm as unknown as { isRaised: boolean }).isRaised).toBe(true);
    expect(wrapper.classes()).toContain('md3-top-app-bar--raised');
  });

  it('renders supporting slots for breadcrumbs and search', () => {
    const wrapper = mount(Md3TopAppBar, {
      slots: {
        default: '<span>Dashboard</span>',
        breadcrumbs: '<nav class="test-breadcrumbs"></nav>',
        search: '<div class="test-search"></div>',
      },
    });

    expect(wrapper.find('.md3-top-app-bar__breadcrumbs .test-breadcrumbs').exists()).toBe(true);
    expect(wrapper.find('.md3-top-app-bar__search .test-search').exists()).toBe(true);
  });
});

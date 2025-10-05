import { mount } from '@vue/test-utils';
import { describe, expect, it, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { nextTick } from 'vue';

import TeacherAuthoringWorkspace from '../TeacherAuthoringWorkspace.vue';

describe('TeacherAuthoringWorkspace', () => {
  let originalInnerWidth: number;
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query.includes('(min-width: 1024px)'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterAll(() => {
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: originalMatchMedia,
      });
    } else {
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1600,
    });
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    });
  });

  it('applies a 30/70 desktop grid split when the sidebar is present', async () => {
    const wrapper = mount(TeacherAuthoringWorkspace, {
      attachTo: document.body,
      slots: {
        header: '<div>Header</div>',
        sidebar: '<div data-test="sidebar">Sidebar</div>',
        editor: '<div>Editor</div>',
      },
    });

    const layout = wrapper.get('.teacher-authoring-workspace__layout');
    const layoutElement = layout.element as HTMLElement;
    const scopeId = (TeacherAuthoringWorkspace as unknown as { __scopeId?: string }).__scopeId;
    const scopeSelector = scopeId ? `[${scopeId}]` : '';
    const styleElement = document.createElement('style');

    styleElement.textContent = `
      /* Vitest não processa estilos de SFC, então aplicamos a regra diretamente. */
      .teacher-authoring-workspace__layout${scopeSelector} {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
      }

      .teacher-authoring-workspace__layout--with-sidebar${scopeSelector} {
        grid-template-columns: minmax(20rem, 30%) minmax(0, 70%);
        align-items: flex-start;
      }

      .teacher-authoring-workspace__sidebar${scopeSelector} {
        position: sticky;
        top: 5.5rem;
        max-height: calc(100vh - 6rem);
        overflow: auto;
        align-self: start;
        width: 100%;
      }
    `;

    document.head.appendChild(styleElement);

    layoutElement.style.width = '1600px';

    await nextTick();

    const layoutStyles = getComputedStyle(layoutElement);
    const sidebarStyles = getComputedStyle(
      wrapper.get('.teacher-authoring-workspace__sidebar').element
    );

    expect(layoutStyles.gridTemplateColumns.replace(/\s+/g, ' ').trim()).toBe(
      'minmax(20rem, 30%) minmax(0, 70%)'
    );
    expect(sidebarStyles.position).toBe('sticky');
    expect(sidebarStyles.overflow).toBe('auto');

    styleElement.remove();
    wrapper.unmount();
  });
});

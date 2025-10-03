import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import type { Router } from 'vue-router';
import { nextTick } from 'vue';

import { routes } from '@/router';

const matchMediaStub = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

if (typeof window !== 'undefined') {
  window.matchMedia = matchMediaStub;
}

describe('Faculty workflow routes', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.localStorage.setItem('teacherMode', 'true');
      window.scrollTo = vi.fn();
    }
  });

  async function navigate(router: Router, path: string) {
    await router.push(path);
    await flushPromises();
    await nextTick();
  }

  it('navega da ingestão até a publicação no modo professor', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    const App = (await import('@/App.vue')).default;

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    await router.isReady();
    await flushPromises();

    await navigate(router, '/faculty/ingestion');
    expect(wrapper.text()).toContain('Ingestão e validação de conteúdo JSON');

    await navigate(router, '/faculty/editor');
    expect(wrapper.text()).toContain('Editor visual de aulas e exercícios');

    await navigate(router, '/faculty/validation');
    expect(wrapper.text()).toContain('Validações automatizadas e relatórios');

    await navigate(router, '/faculty/publication');
    expect(wrapper.text()).toContain('Preparar publicação e pacote de Git');
  });
});

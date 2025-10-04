import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { nextTick, type ComponentPublicInstance } from 'vue';
import { expect } from 'vitest';

type AnyWrapper = VueWrapper<ComponentPublicInstance>;

type MountResult = {
  router: Router;
  wrapper: AnyWrapper;
};

const matchMediaMock = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

function setupBrowserMocks() {
  if (typeof window === 'undefined') {
    return;
  }

  window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
  window.scrollTo = () => {};
  window.localStorage.clear();
  window.localStorage.setItem('teacherMode', 'true');
}

export async function mountFacultyApp(initialPath = '/faculty'): Promise<MountResult> {
  setupBrowserMocks();

  const { routes } = await import('@/router');
  const App = (await import('@/App.vue')).default;
  const router = createRouter({ history: createMemoryHistory(), routes });

  await router.push(initialPath);
  const wrapper = mount(App, {
    global: {
      plugins: [router],
    },
  });

  await router.isReady();

  return { router, wrapper };
}

export async function flushAll() {
  await flushPromises();
  await nextTick();
}

export async function navigateTo(router: Router, path: string) {
  await router.push(path);
  await flushAll();
}

function getNav(wrapper: AnyWrapper) {
  const nav = wrapper.find('[aria-label="Rotas principais"]');
  expect(nav.exists()).toBe(true);
  return nav;
}

function findNavLink(wrapper: AnyWrapper, label: string) {
  const nav = getNav(wrapper);
  const links = nav.findAll('a.md3-top-app-bar__action');
  const target = links.find((link) => link.text().includes(label));
  expect(target, `Link de navegação não encontrado: ${label}`).toBeTruthy();
  return target!;
}

export function expectNavLinkActive(wrapper: AnyWrapper, label: string) {
  const link = findNavLink(wrapper, label);
  expect(link.attributes('aria-current')).toBe('page');
  expect(link.classes()).toContain('md3-top-app-bar__action--active');
}

export function expectNavLinkVisible(wrapper: AnyWrapper, label: string) {
  const link = findNavLink(wrapper, label);
  expect(link.attributes('aria-current')).toBeUndefined();
}

export function expectDashboardBreadcrumb(wrapper: AnyWrapper) {
  const link = wrapper
    .findAll('a')
    .find((anchor) => anchor.text().includes('Voltar para o painel'));
  expect(link, 'Esperado link "Voltar para o painel" para navegação').toBeTruthy();
}

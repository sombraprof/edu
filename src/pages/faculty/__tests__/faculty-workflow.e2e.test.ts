import { beforeEach, describe, expect, it } from 'vitest';
import type { Router } from 'vue-router';
import type { VueWrapper } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';

import FacultyDashboard from '../FacultyDashboard.vue';

import {
  mountFacultyApp,
  flushAll,
  navigateTo,
  expectNavLinkActive,
  expectNavLinkVisible,
  expectDashboardBreadcrumb,
} from './faculty-test-utils';

describe('Faculty workflow routes', () => {
  let router: Router;
  let wrapper: VueWrapper<ComponentPublicInstance>;

  beforeEach(async () => {
    const harness = await mountFacultyApp('/faculty');
    router = harness.router;
    wrapper = harness.wrapper;
  });

  it('navega da ingestão até a publicação no modo professor', async () => {
    const nav = wrapper.find('[aria-label="Rotas principais"]');
    expect(nav.exists()).toBe(true);
    expect(nav.attributes('aria-label')).toBe('Rotas principais');

    const dashboard = wrapper.getComponent(FacultyDashboard);
    (dashboard.vm as any).dashboardLoading = true;
    await flushAll();
    expect(wrapper.text()).toContain('Carregando disciplinas…');

    (dashboard.vm as any).dashboardLoading = false;
    await flushAll();

    expectNavLinkActive(wrapper, 'Painel docente');
    expect(wrapper.text()).toContain('Hub administrativo do professor');

    await navigateTo(router, '/faculty/ingestion');
    expectNavLinkActive(wrapper, 'Ingestão de JSON');
    expectNavLinkVisible(wrapper, 'Painel docente');
    expectDashboardBreadcrumb(wrapper);
    expect(wrapper.text()).toContain('Ingestão e validação de conteúdo JSON');

    await navigateTo(router, '/faculty/editor');
    expectNavLinkActive(wrapper, 'Editor visual');
    expectNavLinkVisible(wrapper, 'Painel docente');
    expect(wrapper.text()).toContain('Editor visual de aulas e exercícios');

    await navigateTo(router, '/faculty/validation');
    expectNavLinkActive(wrapper, 'Validações & relatórios');
    expect(wrapper.text()).toContain('Validações automatizadas e relatórios');

    await navigateTo(router, '/faculty/publication');
    expectNavLinkActive(wrapper, 'Publicação & Git');
    expect(wrapper.text()).toContain('Preparar publicação e pacote de Git');
  });
});

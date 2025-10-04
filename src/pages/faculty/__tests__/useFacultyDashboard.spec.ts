import { describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';

import type { CourseMeta } from '@/data/courses';
import {
  type FacultyDashboardPlanSection,
  type FacultyDashboardResource,
  useFacultyDashboard,
} from '../controllers/useFacultyDashboard';

describe('useFacultyDashboard', () => {
  const sampleCourses: CourseMeta[] = [
    { id: 'a', title: 'Algoritmos', institution: 'Unichristus', description: 'Intro' },
    { id: 'b', title: 'Estruturas de Dados', institution: 'Unifametro', description: 'Avançado' },
  ];
  const samplePlan: FacultyDashboardPlanSection[] = [
    { title: 'Planejar', subtitle: 'Sub', icon: {}, actions: ['A'], links: [] },
  ];
  const sampleResources: FacultyDashboardResource[] = [
    { title: 'Doc', description: 'Descrição', href: 'https://example.com' },
  ];

  function setup(options = {}) {
    const scope = effectScope();
    let composable: ReturnType<typeof useFacultyDashboard>;
    scope.run(() => {
      composable = useFacultyDashboard(options as never);
    });
    return { scope, composable: composable! };
  }

  it('carrega dados com sucesso', async () => {
    const fetchCourses = vi.fn().mockResolvedValue(sampleCourses);
    const fetchPlanSections = vi.fn().mockResolvedValue(samplePlan);
    const fetchResources = vi.fn().mockResolvedValue(sampleResources);

    const { composable, scope } = setup({
      fetchCourses,
      fetchPlanSections,
      fetchResources,
      autoLoad: false,
    });

    await composable.loadDashboard();

    expect(fetchCourses).toHaveBeenCalledTimes(1);
    expect(fetchPlanSections).toHaveBeenCalledTimes(1);
    expect(fetchResources).toHaveBeenCalledTimes(1);
    expect(composable.courses.value).toEqual(sampleCourses);
    expect(composable.planSections.value).toEqual(samplePlan);
    expect(composable.resources.value).toEqual(sampleResources);
    expect(composable.error.value).toBeNull();
    expect(composable.loading.value).toBe(false);

    scope.stop();
  });

  it('propaga erro ao carregar', async () => {
    const fetchCourses = vi.fn().mockRejectedValue(new Error('Falha'));

    const { composable, scope } = setup({
      fetchCourses,
      fetchPlanSections: () => Promise.resolve(samplePlan),
      fetchResources: () => Promise.resolve(sampleResources),
      autoLoad: false,
    });

    await composable.loadDashboard();

    expect(composable.courses.value).toEqual([]);
    expect(composable.planSections.value).toEqual([]);
    expect(composable.resources.value).toEqual([]);
    expect(composable.error.value).toBe('Falha');
    expect(composable.loading.value).toBe(false);

    scope.stop();
  });

  it('mantém todas as disciplinas quando filtros estão vazios', async () => {
    const { composable, scope } = setup({
      fetchCourses: () => Promise.resolve(sampleCourses),
      fetchPlanSections: () => Promise.resolve(samplePlan),
      fetchResources: () => Promise.resolve(sampleResources),
      autoLoad: false,
    });

    await composable.loadDashboard();

    composable.filters.search = '';
    composable.filters.institution = 'all';

    expect(composable.filteredCourses.value).toHaveLength(sampleCourses.length);
    expect(composable.hasFilters.value).toBe(false);

    scope.stop();
  });
});

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { computed, ref, shallowRef } from 'vue';
import CourseHome from '../CourseHome.vue';
import type { CourseHomeController, CourseHomeItem } from '../CourseHome.logic';

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/course/:courseId', name: 'course-home', component: CourseHome },
  {
    path: '/course/:courseId/lesson/:lessonId',
    name: 'lesson',
    component: { template: '<div>Lesson</div>' },
  },
];

let controller: CourseHomeController;
let router: ReturnType<typeof createRouter>;

vi.mock('../CourseHome.logic', () => ({
  useCourseHomeController: () => controller,
}));

const ButtonStub = {
  template: '<button><slot /></button>',
};

const IconStub = { template: '<span />' };

function createController(): CourseHomeController {
  const contentFilter = ref<'all' | 'lesson' | 'exercise'>('all');
  const viewMode = ref<'grid' | 'list'>('grid');
  const isLoading = ref(false);
  const displayItems = shallowRef<CourseHomeItem[]>([
    {
      key: 'lesson-01',
      type: 'lesson',
      title: 'Aula 1',
      available: true,
      wrapper: 'router-link',
      attrs: { to: { name: 'lesson', params: { courseId: 'demo', lessonId: 'lesson-01' } } },
    },
  ]);

  return {
    lessons: ref([]),
    exercises: ref([]),
    contentFilter,
    viewMode,
    isLoading,
    rawSearchQuery: computed(() => ''),
    searchTerm: computed(() => ''),
    combinedItems: computed(() => displayItems.value),
    displayItems: computed(() => displayItems.value),
    refreshCourseContent: vi.fn(),
    resetFilters: vi.fn(() => {
      router.push({ name: 'course-home', params: { courseId: 'demo' } });
    }),
    updateSection: vi.fn((section: 'all' | 'lesson' | 'exercise') => {
      const query: Record<string, string> = {};
      if (section === 'lesson') query.section = 'lessons';
      if (section === 'exercise') query.section = 'exercises';
      router.push({ name: 'course-home', params: { courseId: 'demo' }, query });
      contentFilter.value = section;
    }),
    courseId: computed(() => 'demo'),
    route: router.currentRoute.value,
  } as CourseHomeController;
}

describe('CourseHome integration', () => {
  beforeEach(async () => {
    router = createRouter({ history: createMemoryHistory(), routes });
    controller = createController();
    await router.push('/course/demo');
    await router.isReady();
  });

  it('renderiza loading state com aria-busy', () => {
    controller.isLoading.value = true;
    const wrapper = mount(CourseHome, {
      global: {
        plugins: [router],
        stubs: {
          Md3Button: ButtonStub,
          Grid3x3: IconStub,
          List: IconStub,
          ChevronRight: IconStub,
        },
      },
    });

    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.text()).toContain('Carregando conteúdos da disciplina');
  });

  it('navega via updateSection e renderiza links roteados', async () => {
    const wrapper = mount(CourseHome, {
      global: {
        plugins: [router],
        stubs: {
          Md3Button: ButtonStub,
          Grid3x3: IconStub,
          List: IconStub,
          ChevronRight: IconStub,
        },
      },
    });

    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);

    const lessonFilterButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Aulas'));
    expect(lessonFilterButton).toBeTruthy();
    await lessonFilterButton!.trigger('click');
    expect(controller.updateSection).toHaveBeenCalledWith('lesson');
  });
});

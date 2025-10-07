import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, computed } from 'vue';
import CourseHome from '../CourseHome.vue';
import type { CourseHomeController, CourseHomeItem } from '../CourseHome.logic';

const createController = () => {
  const lessons = ref([]);
  const exercises = ref([]);
  const contentFilter = ref<'all' | 'lesson' | 'exercise'>('all');
  const viewMode = ref<'grid' | 'list'>('grid');
  const isLoading = ref(false);
  const displayItemsState = ref<CourseHomeItem[]>([]);
  const combinedItems = computed(() => displayItemsState.value);
  const displayItems = computed(() => displayItemsState.value);
  const resetFiltersSpy = vi.fn();

  const controller = {
    lessons,
    exercises,
    contentFilter,
    viewMode,
    isLoading,
    rawSearchQuery: computed(() => ''),
    searchTerm: computed(() => ''),
    combinedItems,
    displayItems,
    refreshCourseContent: vi.fn(),
    resetFilters: resetFiltersSpy,
    updateSection: vi.fn(),
    courseId: computed(() => 'demo'),
    route: { params: {}, query: {} } as any,
  } satisfies CourseHomeController;

  const setDisplayItems = (items: CourseHomeItem[]) => {
    displayItemsState.value = items;
  };

  const clearFiltersSpy = () => {
    resetFiltersSpy.mockClear();
  };
  return { controller, setDisplayItems, resetFiltersSpy, clearFiltersSpy };
};

let controllerMock: CourseHomeController;
let setDisplayItems: (items: CourseHomeItem[]) => void;
let resetFiltersSpy: ReturnType<typeof vi.fn>;
let clearFiltersSpy: () => void;

vi.mock('../CourseHome.logic', () => ({
  useCourseHomeController: () => controllerMock,
}));

const ButtonStub = {
  inheritAttrs: false,
  props: ['as'],
  emits: ['click'],
  template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
};

describe('CourseHome component', () => {
  beforeEach(() => {
    const controllerSetup = createController();
    controllerMock = controllerSetup.controller;
    setDisplayItems = controllerSetup.setDisplayItems;
    resetFiltersSpy = controllerSetup.resetFiltersSpy;
    clearFiltersSpy = controllerSetup.clearFiltersSpy;
    clearFiltersSpy();
  });

  it('exibe estado de carregamento', () => {
    controllerMock.isLoading.value = true;
    const wrapper = mount(CourseHome, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          Grid3x3: { template: '<span />' },
          List: { template: '<span />' },
          ChevronRight: { template: '<span />' },
        },
      },
    });
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.text()).toContain('Carregando conteúdos da disciplina');
  });

  it('renderiza itens disponíveis com classes corretas', () => {
    controllerMock.isLoading.value = false;
    setDisplayItems([
      {
        key: 'lesson-01',
        type: 'lesson',
        title: 'Aula 1',
        available: true,
        wrapper: 'router-link',
        attrs: { to: { name: 'lesson', params: { courseId: 'demo', lessonId: 'lesson-01' } } },
      },
      {
        key: 'exercise-01',
        type: 'exercise',
        title: 'Exercício',
        available: false,
        wrapper: 'div',
        attrs: {},
      },
    ]);

    const wrapper = mount(CourseHome, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          Grid3x3: { template: '<span />' },
          List: { template: '<span />' },
          ChevronRight: { template: '<span />' },
        },
      },
    });

    const lessonCard = wrapper.find('.course-home__card--lesson');
    const exerciseCard = wrapper.find('.course-home__card--exercise');
    expect(lessonCard.exists()).toBe(true);
    expect(exerciseCard.exists()).toBe(true);
  });

  it('aciona reset ao clicar em "Limpar filtros"', async () => {
    controllerMock.isLoading.value = false;
    setDisplayItems([]);
    resetFiltersSpy.mockClear();

    const wrapper = mount(CourseHome, {
      global: {
        stubs: {
          Md3Button: ButtonStub,
          RouterLink: { template: '<a><slot /></a>' },
          Grid3x3: { template: '<span />' },
          List: { template: '<span />' },
          ChevronRight: { template: '<span />' },
        },
      },
    });

    const resetButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Limpar filtros'));
    expect(resetButton).toBeTruthy();
    await resetButton!.trigger('click');
    expect(resetFiltersSpy).toHaveBeenCalled();
  });
});

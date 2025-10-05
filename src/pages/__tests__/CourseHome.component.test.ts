import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import CourseHome from '../CourseHome.vue';
import type { CourseHomeController, CourseHomeItem } from '../CourseHome.logic';

interface ControllerHarness {
  controller: CourseHomeController;
  isLoading: Ref<boolean>;
  displayItemsSource: Ref<CourseHomeItem[]>;
  resetFiltersMock: ReturnType<typeof vi.fn>;
}

const createController = (): ControllerHarness => {
  const lessons = ref([]);
  const exercises = ref([]);
  const contentFilter = ref<'all' | 'lesson' | 'exercise'>('all');
  const viewMode = ref<'grid' | 'list'>('grid');
  const isLoading = ref(false);
  const displayItemsState = ref<CourseHomeItem[]>([]);

  const controller = {
    lessons,
    exercises,
    contentFilter,
    viewMode,
    isLoading,
    rawSearchQuery: computed(() => ''),
    searchTerm: computed(() => ''),
    combinedItems: computed(() => displayItemsState.value),
    displayItems: computed(() => displayItemsState.value),
    refreshCourseContent: vi.fn(),
    resetFilters: vi.fn(),
    updateSection: vi.fn(),
    courseId: computed(() => 'demo'),
    route: { params: {}, query: {} } as any,
  } satisfies CourseHomeController;

  const setDisplayItems = (items: CourseHomeItem[]) => {
    displayItemsState.value = items;
  };

  return { controller, setDisplayItems };
};

let controllerHarness: ControllerHarness;
let controllerMock: CourseHomeController;
let setDisplayItems: (items: CourseHomeItem[]) => void;

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
  });

  it('exibe estado de carregamento', () => {
    controllerHarness.isLoading.value = true;
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
    controllerMock.resetFilters.mockClear();

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
    expect(controllerMock.resetFilters).toHaveBeenCalled();
  });
});

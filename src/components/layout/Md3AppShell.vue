<template>
  <div class="md3-app-shell">
    <div
      v-if="hasNavigation"
      :id="drawerId"
      class="md3-app-shell__drawer-wrapper"
      :class="{ 'md3-app-shell__drawer-wrapper--open': drawerOpen }"
      :aria-hidden="drawerOpen ? undefined : 'true'"
    >
      <Md3NavigationDrawer
        variant="modal"
        density="compact"
        :items="navigationItems"
        :active-id="activeNavigationId"
        aria-label="Navegação principal"
        @select="handleNavigationSelect"
        @update:active-id="handleNavigationUpdate"
      >
        <template #header>
          <slot name="drawer-header" />
        </template>
        <template #footer>
          <slot name="drawer-footer" />
        </template>
      </Md3NavigationDrawer>
    </div>
    <div v-if="drawerOpen" class="md3-app-shell__scrim" @click="closeDrawer"></div>
    <aside v-if="hasNavigation" class="md3-app-shell__rail">
      <Md3NavigationRail
        :items="navigationItems"
        :active-id="activeNavigationId"
        aria-label="Navegação principal"
        density="compact"
        @select="handleNavigationSelect"
        @update:active-id="handleNavigationUpdate"
      >
        <template #header>
          <slot name="rail-header" />
        </template>
        <template #footer>
          <slot name="rail-footer" />
        </template>
      </Md3NavigationRail>
    </aside>
    <div class="md3-app-shell__layout">
      <Md3TopAppBar :variant="topBarVariant" density="comfortable">
        <template #leading>
          <button
            v-if="hasNavigation"
            type="button"
            class="md3-top-app-bar__action md3-top-app-bar__action--icon"
            :aria-controls="drawerId"
            :aria-expanded="drawerOpen"
            @click="toggleDrawer"
          >
            <Menu class="md-icon md-icon--sm" aria-hidden="true" />
            <span class="sr-only">Alternar navegação</span>
          </button>
          <slot name="brand" />
        </template>
        <slot>
          <h1 class="text-title-large font-semibold text-[var(--md-sys-color-on-surface)]">
            {{ title }}
          </h1>
        </slot>
        <template #actions>
          <slot name="actions" />
        </template>
        <template #breadcrumbs>
          <slot name="breadcrumbs">
            <Md3Breadcrumbs
              v-if="breadcrumbs.length"
              :items="breadcrumbs"
              @select="handleBreadcrumbSelect"
            />
          </slot>
        </template>
        <template #search>
          <slot name="search">
            <Md3SearchField
              v-if="enableSearch"
              :model-value="searchValue"
              :placeholder="searchPlaceholder"
              :label="searchLabel"
              @update:model-value="(value) => emit('update:searchValue', value)"
              @submit="(value) => emit('submit-search', value)"
              @clear="emit('clear-search')"
            />
          </slot>
        </template>
        <template #supporting>
          <slot name="top-supporting" />
        </template>
      </Md3TopAppBar>
      <div class="md3-app-shell__content" :class="{ 'md3-app-shell--two-column': hasSecondary }">
        <div class="md3-app-shell__main-area">
          <div class="md3-app-shell__main">
            <slot name="main">
              <slot />
            </slot>
          </div>
        </div>
        <aside v-if="hasSecondary" class="md3-app-shell__secondary">
          <slot name="secondary" />
        </aside>
      </div>
      <Md3BottomAppBar
        v-if="hasNavigation"
        :actions="navigationActions"
        :active-id="activeNavigationId"
        @select="handleNavigationSelect"
        @update:active-id="handleNavigationUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue';
import { Menu } from 'lucide-vue-next';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
import Md3TopAppBar from './Md3TopAppBar.vue';
import Md3NavigationRail from './Md3NavigationRail.vue';
import Md3NavigationDrawer from './Md3NavigationDrawer.vue';
import Md3BottomAppBar from './Md3BottomAppBar.vue';
import Md3Breadcrumbs from './Md3Breadcrumbs.vue';
import Md3SearchField from './Md3SearchField.vue';

interface ShellNavigationItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  description?: string;
  disabled?: boolean;
  to?: RouteLocationRaw;
}

interface ShellBreadcrumbItem {
  id: string;
  label: string;
  icon?: string;
  to?: RouteLocationRaw;
  href?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    navigation?: ShellNavigationItem[];
    breadcrumbs?: ShellBreadcrumbItem[];
    searchValue?: string;
    searchPlaceholder?: string;
    searchLabel?: string;
    enableSearch?: boolean;
    topBarVariant?: 'small' | 'center-aligned' | 'medium' | 'large';
  }>(),
  {
    title: 'Visão geral',
    navigation: () => [],
    breadcrumbs: () => [],
    searchValue: '',
    searchPlaceholder: 'Buscar',
    searchLabel: 'Buscar conteúdo',
    enableSearch: false,
    topBarVariant: 'small',
  }
);

const emit = defineEmits<{
  (event: 'select-navigation', value: string): void;
  (event: 'update:activeNavigationId', value: string): void;
  (event: 'update:searchValue', value: string): void;
  (event: 'submit-search', value: string): void;
  (event: 'clear-search'): void;
  (event: 'select-breadcrumb', value: string): void;
}>();

const route = useRoute();
const router = useRouter();
const slots = useSlots();
const activeNavigationId = ref('');
const drawerId = 'app-shell-drawer';
const drawerOpen = ref(false);
let mediaQuery: MediaQueryList | null = null;
let mediaQueryHandler: ((event: MediaQueryListEvent) => void) | null = null;

const hasNavigation = computed(() => props.navigation.length > 0);
const hasSecondary = computed(() => Boolean(slots.secondary));

const navigationItems = computed(() => props.navigation);
const breadcrumbs = computed(() => props.breadcrumbs);
const enableSearch = computed(() => props.enableSearch || Boolean(props.searchPlaceholder));

const navigationActions = computed(() =>
  props.navigation.map(({ id, label, icon, disabled }) => ({ id, label, icon, disabled }))
);

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
}

function closeDrawer() {
  drawerOpen.value = false;
}

function handleNavigationUpdate(id: string) {
  activeNavigationId.value = id;
  emit('update:activeNavigationId', id);
}

function handleNavigationSelect(id: string) {
  const item = props.navigation.find((entry) => entry.id === id);
  if (item?.to) {
    router.push(item.to).catch(() => {
      /* ignore redundant navigation */
    });
  }
  emit('select-navigation', id);
  closeDrawer();
}

function handleBreadcrumbSelect(id: string) {
  const item = props.breadcrumbs.find((breadcrumb) => breadcrumb.id === id);
  if (item?.to) {
    router.push(item.to).catch(() => {
      /* ignore redundant navigation */
    });
  }
  emit('select-breadcrumb', id);
}

function updateActiveNavigationFromRoute() {
  const matching = props.navigation.find((item) => {
    if (!item.to) {
      return false;
    }
    if (typeof item.to === 'string') {
      return item.to === route.path;
    }
    if ('name' in item.to && item.to.name) {
      return item.to.name === route.name;
    }
    if ('path' in item.to && item.to.path) {
      return router.resolve(item.to).path === route.path;
    }
    return false;
  });
  if (matching) {
    activeNavigationId.value = matching.id;
    emit('update:activeNavigationId', matching.id);
  } else if (props.navigation.length && !activeNavigationId.value) {
    activeNavigationId.value = props.navigation[0].id;
    emit('update:activeNavigationId', activeNavigationId.value);
  }
}

watch(
  () => route.fullPath,
  () => {
    updateActiveNavigationFromRoute();
  }
);

function setupMediaQuery() {
  if (typeof window === 'undefined' || !hasNavigation.value) {
    return;
  }
  const styles = getComputedStyle(document.documentElement);
  const breakpoint = styles.getPropertyValue('--md-sys-breakpoint-lg').trim() || '72rem';
  mediaQuery = window.matchMedia(`(min-width: ${breakpoint})`);

  mediaQueryHandler = (event: MediaQueryListEvent) => {
    if (event.matches) {
      closeDrawer();
    }
  };

  const legacyQuery = mediaQuery as MediaQueryList & {
    addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', mediaQueryHandler);
  } else if (legacyQuery.addListener) {
    legacyQuery.addListener(mediaQueryHandler);
  }

  if (mediaQuery.matches) {
    closeDrawer();
  }
}

onMounted(() => {
  updateActiveNavigationFromRoute();
  setupMediaQuery();
});

onBeforeUnmount(() => {
  if (!mediaQuery || !mediaQueryHandler) {
    return;
  }
  const legacyQuery = mediaQuery as MediaQueryList & {
    addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  };

  if (mediaQuery.removeEventListener) {
    mediaQuery.removeEventListener('change', mediaQueryHandler);
  } else if (legacyQuery.removeListener) {
    legacyQuery.removeListener(mediaQueryHandler);
  }
});

watch(
  () => props.navigation,
  () => {
    updateActiveNavigationFromRoute();
  },
  { deep: true }
);

const topBarVariant = computed(() => props.topBarVariant);
</script>

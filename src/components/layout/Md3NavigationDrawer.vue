<template>
  <aside
    class="md3-navigation-drawer"
    :class="drawerClasses"
    role="navigation"
    :aria-label="ariaLabel || undefined"
  >
    <header v-if="$slots.header" class="md3-navigation-drawer__header">
      <slot name="header" />
    </header>
    <ul class="md3-navigation-drawer__list" role="list">
      <li v-for="item in normalizedItems" :key="item.id" role="listitem">
        <button
          type="button"
          class="md3-navigation-drawer__item"
          :class="{ 'md3-navigation-drawer__item--active': item.isActive }"
          :aria-current="item.isActive ? 'page' : undefined"
          :aria-disabled="item.disabled || undefined"
          :disabled="item.disabled"
          @click="handleSelect(item)"
        >
          <component
            :is="item.iconComponent"
            v-if="item.iconComponent"
            class="md3-navigation-drawer__icon"
            aria-hidden="true"
          />
          <span class="md3-navigation-drawer__body">
            <span class="md3-navigation-drawer__label">{{ item.label }}</span>
            <span v-if="item.description" class="md3-navigation-drawer__description">
              {{ item.description }}
            </span>
          </span>
          <span v-if="item.badge" class="md3-navigation-drawer__badge">{{ item.badge }}</span>
        </button>
      </li>
    </ul>
    <footer v-if="$slots.footer" class="md3-navigation-drawer__footer">
      <slot name="footer" />
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import * as LucideIcons from 'lucide-vue-next';

type DrawerVariant = 'standard' | 'modal';

type DrawerDensity = 'default' | 'compact';

type NavigationDrawerItem = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    items: NavigationDrawerItem[];
    activeId?: string;
    ariaLabel?: string;
    density?: DrawerDensity;
    variant?: DrawerVariant;
  }>(),
  {
    items: () => [],
    activeId: '',
    ariaLabel: '',
    density: 'default' as DrawerDensity,
    variant: 'standard' as DrawerVariant,
  }
);

const emit = defineEmits<{
  (event: 'update:activeId', value: string): void;
  (event: 'select', value: string): void;
}>();

interface NormalizedDrawerItem extends NavigationDrawerItem {
  isActive: boolean;
  iconComponent: Component | null;
}

const iconRegistry = LucideIcons as unknown as Record<string, Component>;

function toPascalCase(name: string): string {
  return name
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function resolveIcon(name?: string): Component | null {
  if (!name) {
    return null;
  }
  const normalized = toPascalCase(name);
  return iconRegistry[normalized] ?? null;
}

const normalizedItems = computed<NormalizedDrawerItem[]>(() => {
  const fallback = props.items.find((item) => !item.disabled);
  const activeId = props.activeId || fallback?.id || '';
  return props.items.map((item) => ({
    ...item,
    isActive: activeId === item.id,
    iconComponent: resolveIcon(item.icon),
  }));
});

const drawerClasses = computed(() => ({
  'md3-navigation-drawer--modal': props.variant === 'modal',
  'md3-navigation-drawer--compact': props.density === 'compact',
}));

function handleSelect(item: NormalizedDrawerItem) {
  if (item.disabled) {
    return;
  }

  emit('update:activeId', item.id);
  emit('select', item.id);
}
</script>

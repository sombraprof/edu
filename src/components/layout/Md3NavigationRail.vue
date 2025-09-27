<template>
  <nav class="md3-navigation-rail" :class="railClasses" :aria-label="ariaLabel || undefined">
    <header v-if="$slots.header" class="md3-navigation-rail__header">
      <slot name="header" />
    </header>
    <ul class="md3-navigation-rail__list" role="list">
      <li v-for="item in normalizedItems" :key="item.id" role="listitem">
        <button
          type="button"
          class="md3-navigation-rail__item"
          :class="{ 'md3-navigation-rail__item--active': item.isActive }"
          :aria-current="item.isActive ? 'page' : undefined"
          :aria-disabled="item.disabled || undefined"
          :disabled="item.disabled"
          @click="handleSelect(item)"
        >
          <span class="md3-navigation-rail__indicator" aria-hidden="true"></span>
          <component
            :is="item.iconComponent"
            v-if="item.iconComponent"
            class="md3-navigation-rail__icon"
            aria-hidden="true"
          />
          <span class="md3-navigation-rail__label">{{ item.label }}</span>
          <span v-if="item.badge" class="md3-navigation-rail__badge">{{ item.badge }}</span>
        </button>
      </li>
    </ul>
    <footer v-if="$slots.footer" class="md3-navigation-rail__footer">
      <slot name="footer" />
    </footer>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import * as LucideIcons from 'lucide-vue-next';

type NavigationDensity = 'default' | 'compact';

type NavigationRailVariant = 'expanded' | 'collapsed';

type NavigationRailItem = {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    items: NavigationRailItem[];
    activeId?: string;
    ariaLabel?: string;
    density?: NavigationDensity;
    variant?: NavigationRailVariant;
  }>(),
  {
    items: () => [],
    activeId: '',
    ariaLabel: '',
    density: 'default' as NavigationDensity,
    variant: 'expanded' as NavigationRailVariant,
  }
);

const emit = defineEmits<{
  (event: 'update:activeId', value: string): void;
  (event: 'select', value: string): void;
}>();

interface NormalizedRailItem extends NavigationRailItem {
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

const normalizedItems = computed<NormalizedRailItem[]>(() => {
  const fallback = props.items.find((item) => !item.disabled);
  const activeId = props.activeId || fallback?.id || '';
  return props.items.map((item) => ({
    ...item,
    isActive: activeId === item.id,
    iconComponent: resolveIcon(item.icon),
  }));
});

const railClasses = computed(() => ({
  'md3-navigation-rail--compact': props.density === 'compact',
  'md3-navigation-rail--collapsed': props.variant === 'collapsed',
}));

function handleSelect(item: NormalizedRailItem) {
  if (item.disabled) {
    return;
  }

  emit('update:activeId', item.id);
  emit('select', item.id);
}
</script>

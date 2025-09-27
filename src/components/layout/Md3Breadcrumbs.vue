<template>
  <nav class="md3-breadcrumbs" :aria-label="ariaLabel">
    <ol class="md3-breadcrumbs__list">
      <li
        v-for="(item, index) in normalizedItems"
        :key="item.id"
        class="md3-breadcrumbs__item"
        :aria-current="index === normalizedItems.length - 1 ? 'page' : undefined"
      >
        <component
          :is="item.component"
          v-if="item.component"
          class="md3-breadcrumbs__link"
          v-bind="item.componentProps"
          @click="handleClick(item, index)"
        >
          <component
            :is="item.iconComponent"
            v-if="item.iconComponent"
            class="md-icon md-icon--sm"
            aria-hidden="true"
          />
          <span>{{ item.label }}</span>
        </component>
        <span v-else>{{ item.label }}</span>
        <span
          v-if="index < normalizedItems.length - 1"
          class="md3-breadcrumbs__separator"
          aria-hidden="true"
        >
          <ChevronRight class="md-icon md-icon--sm" />
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, type RouteLocationRaw } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import type { Component } from 'vue';
import * as LucideIcons from 'lucide-vue-next';

interface BreadcrumbItem {
  id: string;
  label: string;
  to?: RouteLocationRaw;
  href?: string;
  icon?: string;
  disabled?: boolean;
}

interface NormalizedBreadcrumb extends BreadcrumbItem {
  component: Component | string | null;
  componentProps: Record<string, unknown>;
  iconComponent: Component | null;
}

const props = withDefaults(
  defineProps<{
    items: BreadcrumbItem[];
    ariaLabel?: string;
  }>(),
  {
    items: () => [],
    ariaLabel: 'Trilha de navegação',
  }
);

const emit = defineEmits<{
  (event: 'select', value: string): void;
}>();

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
  return iconRegistry[toPascalCase(name)] ?? null;
}

const normalizedItems = computed<NormalizedBreadcrumb[]>(() =>
  props.items.map((item) => {
    let component: Component | string | null = null;
    let componentProps: Record<string, unknown> = {};

    if (item.to) {
      component = RouterLink;
      componentProps = { to: item.to };
    } else if (item.href) {
      component = 'a';
      componentProps = {
        href: item.href,
        rel: 'noreferrer noopener',
        target: item.href.startsWith('http') ? '_blank' : undefined,
      };
    }

    if (item.disabled) {
      componentProps = { ...componentProps, 'aria-disabled': 'true', tabindex: -1 };
    }

    return {
      ...item,
      component,
      componentProps,
      iconComponent: resolveIcon(item.icon),
    };
  })
);

function handleClick(item: NormalizedBreadcrumb, index: number) {
  if (item.disabled || index === normalizedItems.value.length - 1) {
    return;
  }
  emit('select', item.id);
}
</script>

<template>
  <nav class="md3-bottom-app-bar" :aria-label="ariaLabel">
    <button
      v-for="action in normalizedActions"
      :key="action.id"
      class="md3-bottom-app-bar__action"
      type="button"
      :aria-current="action.isActive ? 'page' : undefined"
      :disabled="action.disabled"
      @click="handleSelect(action)"
    >
      <component
        :is="action.iconComponent"
        v-if="action.iconComponent"
        class="md-icon md-icon--sm"
        aria-hidden="true"
      />
      <span>{{ action.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import * as LucideIcons from 'lucide-vue-next';

type BottomAppBarAction = {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
};

interface NormalizedAction extends BottomAppBarAction {
  isActive: boolean;
  iconComponent: Component | null;
}

const props = withDefaults(
  defineProps<{
    actions: BottomAppBarAction[];
    activeId?: string;
    ariaLabel?: string;
  }>(),
  {
    actions: () => [],
    activeId: '',
    ariaLabel: 'Ações principais',
  }
);

const emit = defineEmits<{
  (event: 'select', value: string): void;
  (event: 'update:activeId', value: string): void;
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

const normalizedActions = computed<NormalizedAction[]>(() => {
  const fallback = props.actions.find((action) => !action.disabled);
  const active = props.activeId || fallback?.id || '';
  return props.actions.map((action) => ({
    ...action,
    isActive: action.id === active,
    iconComponent: resolveIcon(action.icon),
  }));
});

function handleSelect(action: NormalizedAction) {
  if (action.disabled) {
    return;
  }
  emit('update:activeId', action.id);
  emit('select', action.id);
}
</script>

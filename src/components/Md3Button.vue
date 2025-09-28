<template>
  <component :is="resolvedTag" v-bind="componentAttrs" :class="buttonClasses">
    <span v-if="hasLeading" class="md3-button__icon md3-button__icon--leading">
      <slot name="leading" />
    </span>
    <span v-if="!iconOnly || hasDefaultSlot" class="md3-button__label">
      <slot />
    </span>
    <span v-if="hasTrailing" class="md3-button__icon md3-button__icon--trailing">
      <slot name="trailing" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots, type Component } from 'vue';

type Md3ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    variant?: Md3ButtonVariant;
    /**
     * The underlying element or component rendered by the button.
     * Accepts a tag name or a Vue component (e.g. RouterLink).
     */
    as?: string | Component;
    /**
     * Deprecated alias for `as` kept for backwards compatibility.
     */
    tag?: string | Component;
    type?: 'button' | 'submit' | 'reset';
    icon?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'filled',
    type: 'button',
    icon: false,
    fullWidth: false,
    disabled: false,
  }
);

const attrs = useAttrs();
const slots = useSlots();

const resolvedTag = computed(() => props.as ?? props.tag ?? 'button');
const hasLeading = computed(() => Boolean(slots.leading));
const hasTrailing = computed(() => Boolean(slots.trailing));
const hasDefaultSlot = computed(() => Boolean(slots.default));
const iconOnly = computed(() => props.icon);
const isButtonTag = computed(() => resolvedTag.value === 'button');

const componentAttrs = computed(() => {
  const finalAttrs: Record<string, unknown> = { ...attrs };

  if (isButtonTag.value) {
    if (finalAttrs.type === undefined) {
      finalAttrs.type = props.type;
    }
    if (props.disabled) {
      finalAttrs.disabled = true;
    }
  } else if (props.disabled) {
    finalAttrs['aria-disabled'] = 'true';
    if (finalAttrs.tabIndex === undefined) {
      finalAttrs.tabIndex = -1;
    }
    if ('href' in finalAttrs) {
      delete finalAttrs.href;
    }
  }

  return finalAttrs;
});

const buttonClasses = computed(() => [
  'md3-button',
  `md3-button--${props.variant}`,
  {
    'md3-button--icon': props.icon,
    'md3-button--full-width': props.fullWidth,
  },
]);
</script>

<style scoped>
.md3-button--full-width {
  width: 100%;
  justify-content: center;
}
</style>

<template>
  <header
    class="md3-top-app-bar"
    :class="barClasses"
    role="banner"
    :aria-label="ariaLabel || undefined"
    :aria-labelledby="ariaLabel ? undefined : headlineId || undefined"
  >
    <div class="md3-top-app-bar__container">
      <div v-if="$slots.leading" class="md3-top-app-bar__leading">
        <slot name="leading" />
      </div>
      <div v-if="$slots.default" class="md3-top-app-bar__headline" :id="headlineId || undefined">
        <slot />
      </div>
      <div v-if="$slots.actions" class="md3-top-app-bar__actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from 'vue';

const props = withDefaults(
  defineProps<{
    /**
     * Keeps the bar fixed to the top of the viewport. Set to false to allow natural flow.
     */
    sticky?: boolean;
    /**
     * When true, the bar listens to scroll to toggle the elevated state.
     */
    observeScroll?: boolean;
    /**
     * Optional aria-label used when no visual title is provided.
     */
    ariaLabel?: string;
  }>(),
  {
    sticky: true,
    observeScroll: true,
    ariaLabel: '',
  }
);

const slots = useSlots();
const isRaised = ref(false);
const instanceId = `top-app-bar-${Math.random().toString(36).slice(2, 8)}`;

function updateElevation() {
  if (!props.observeScroll || typeof window === 'undefined') {
    isRaised.value = false;
    return;
  }
  isRaised.value = window.scrollY > 4;
}

onMounted(() => {
  if (!props.observeScroll || typeof window === 'undefined') {
    return;
  }
  updateElevation();
  window.addEventListener('scroll', updateElevation, { passive: true });
});

onBeforeUnmount(() => {
  if (!props.observeScroll || typeof window === 'undefined') {
    return;
  }
  window.removeEventListener('scroll', updateElevation);
});

const barClasses = computed(() => ({
  'md3-top-app-bar--sticky': props.sticky,
  'md3-top-app-bar--raised': isRaised.value,
  'md3-top-app-bar--has-leading': Boolean(slots.leading),
  'md3-top-app-bar--has-actions': Boolean(slots.actions),
}));

const headlineId = computed(() => {
  if (props.ariaLabel || !slots.default) {
    return '';
  }
  return `${instanceId}-title`;
});
</script>

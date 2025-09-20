<template>
  <button class="btn btn-tonal" @click="toggle()" :aria-label="ariaLabel">
    <component :is="icon" :style="{ height: 'var(--md-sys-icon-size-small)', width: 'var(--md-sys-icon-size-small)' }" />
    <span class="hidden sm:inline">{{ textLabel }}</span>
  </button>
</template>

<script setup lang="ts">
// Light/Dark theme toggle using Tailwind `darkMode: 'class'` via html.light
import { computed, ref } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';

const isLight = ref(document.documentElement.classList.contains('light'));
const ariaLabel = computed(() => (isLight.value ? 'Ativar modo escuro' : 'Ativar modo claro'));
const textLabel = computed(() => (isLight.value ? 'Modo escuro' : 'Modo claro'));
const icon = computed(() => (isLight.value ? Moon : Sun));

function toggle() {
  isLight.value = !isLight.value;
  document.documentElement.classList.toggle('light', isLight.value);
  localStorage.setItem('theme', isLight.value ? 'light' : 'dark');
}
</script>
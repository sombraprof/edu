<template>
  <button class="btn btn-tonal" @click="toggle()" :aria-label="ariaLabel">
    <component :is="icon" class="md-icon md-icon--sm" />
    <span class="hidden sm:inline">{{ textLabel }}</span>
  </button>
</template>

<script setup lang="ts">
// Light/Dark theme toggle backed by the centralized Material You manager
import { computed } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import { getActiveMaterialTheme, setMaterialTheme } from '@/theme/material-theme';

const theme = getActiveMaterialTheme();
const isLight = computed(() => theme.value === 'light');
const ariaLabel = computed(() => (isLight.value ? 'Ativar modo escuro' : 'Ativar modo claro'));
const textLabel = computed(() => (isLight.value ? 'Modo escuro' : 'Modo claro'));
const icon = computed(() => (isLight.value ? Moon : Sun));

function toggle() {
  setMaterialTheme(isLight.value ? 'dark' : 'light');
}
</script>

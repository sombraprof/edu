<template>
  <Md3Button class="app-theme-toggle" variant="text" :aria-label="ariaLabel" @click="toggle">
    <template #leading>
      <component :is="icon" class="md-icon md-icon--sm" aria-hidden="true" focusable="false" />
    </template>
    <span class="hidden sm:inline">{{ textLabel }}</span>
  </Md3Button>
</template>

<script setup lang="ts">
// Light/Dark theme toggle backed by the centralized Material You manager
import { computed } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import { getActiveMaterialTheme, setMaterialTheme } from '@/theme/material-theme';
import Md3Button from './Md3Button.vue';

const theme = getActiveMaterialTheme();
const isLight = computed(() => theme.value === 'light');
const ariaLabel = computed(() => (isLight.value ? 'Ativar modo escuro' : 'Ativar modo claro'));
const textLabel = computed(() => (isLight.value ? 'Modo escuro' : 'Modo claro'));
const icon = computed(() => (isLight.value ? Moon : Sun));

function toggle() {
  setMaterialTheme(isLight.value ? 'dark' : 'light');
}
</script>

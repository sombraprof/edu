<template>
  <section
    v-if="selectedBlock"
    ref="panelEl"
    :id="editorSectionId"
    class="exercise-block-editor card md3-surface-section md-stack md-stack-3"
  >
    <h3 class="md-typescale-title-medium font-semibold text-on-surface">
      Editor do bloco selecionado
    </h3>
    <component
      v-if="blockEditorComponent"
      :is="blockEditorComponent"
      :block="selectedBlock"
      @update:block="handleUpdateBlock"
    />
    <p v-else class="text-body-medium text-on-surface-variant">
      Nenhum editor disponível para o bloco selecionado.
    </p>
  </section>
  <section
    v-else
    class="exercise-block-editor exercise-block-editor--empty card md3-surface-section"
  >
    <p class="text-body-medium text-on-surface-variant">
      Selecione um bloco na barra lateral para editar os detalhes.
    </p>
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, type Component } from 'vue';
import type { LessonAuthoringBlock } from '@/composables/useAuthoringBlockKeys';
import type { LessonBlock } from '@/components/lesson/blockRegistry';

const props = defineProps<{
  selectedBlock: LessonAuthoringBlock | null;
  blockEditorComponent: Component | null;
  editorSectionId?: string;
  onUpdateBlock: (block: LessonBlock) => void;
}>();

const panelEl = ref<HTMLElement | null>(null);

watch(
  () => props.selectedBlock?.__uiKey,
  () => {
    nextTick(() => {
      const container = panelEl.value;
      if (!container) return;
      if (typeof container.scrollIntoView === 'function') {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const focusTarget =
        container.querySelector<HTMLElement>('[autofocus]') ??
        container.querySelector<HTMLElement>(
          'input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
        );
      focusTarget?.focus();
    });
  }
);

function handleUpdateBlock(block: LessonBlock) {
  props.onUpdateBlock(block);
}
</script>

<style scoped>
.exercise-block-editor {
  width: 100%;
}

.exercise-block-editor--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 12rem;
}
</style>

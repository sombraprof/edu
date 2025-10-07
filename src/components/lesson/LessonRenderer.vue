<template>
  <section v-if="hasRenderableContent" class="lesson-renderer md-stack md-stack-6">
    <LessonMetadataSummary v-if="metadataSummary" v-bind="metadataSummary" />

    <template v-for="(entry, index) in resolvedBlocks" :key="index">
      <component
        v-if="entry.component"
        :is="entry.component"
        v-bind="entry.props"
        :data-authoring-block="entry.uiKey ?? undefined"
      />
      <div
        v-else
        class="prose max-w-none text-[var(--md-sys-color-on-surface-variant)]"
        :data-authoring-block="entry.uiKey ?? undefined"
      >
        <p>{{ entry.error }}</p>
      </div>
    </template>

    <BibliographyBlock v-if="bibliographyFallback" :data="bibliographyFallback" />
  </section>
  <p v-else class="prose max-w-none text-[var(--md-sys-color-on-surface-variant)]">
    Nenhum conteúdo disponível para esta aula.
  </p>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import BibliographyBlock from './BibliographyBlock.vue';
import LessonMetadataSummary from './LessonMetadataSummary.vue';
import { useLessonRenderer, type LessonContent } from '@/pages/course/LessonRenderer.logic';

const props = defineProps<{ data: LessonContent }>();

const { metadataSummary, resolvedBlocks, bibliographyFallback, hasRenderableContent } =
  useLessonRenderer(toRef(props, 'data'));
</script>

<style scoped>
.lesson-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-6);
}
</style>

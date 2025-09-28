<template>
  <section
    v-if="data && data.content && data.content.length"
    class="lesson-renderer md-stack md-stack-6"
  >
    <template v-for="(entry, index) in resolvedBlocks" :key="index">
      <component v-if="entry.component" :is="entry.component" v-bind="entry.props" />
      <div v-else class="prose max-w-none text-[var(--md-sys-color-on-surface-variant)]">
        <p>{{ entry.error }}</p>
      </div>
    </template>
  </section>
  <p v-else class="prose max-w-none text-[var(--md-sys-color-on-surface-variant)]">
    Nenhum conteúdo disponível para esta aula.
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LessonBlock } from './blockRegistry';
import { resolveBlock } from './blockRegistry';

type LessonContent = {
  id: string;
  title: string;
  objective?: string;
  content: LessonBlock[];
};

const props = defineProps<{ data: LessonContent }>();

const resolvedBlocks = computed(() => {
  const blocks = props.data?.content ?? [];
  return blocks.map((block) => {
    const resolution = resolveBlock(block);
    return {
      ...resolution,
      props: resolution.props ?? {},
      error:
        resolution.error ?? `Bloco com tipo desconhecido: ${String(block.type ?? '(sem tipo)')}.`,
    };
  });
});
</script>

<style scoped>
.lesson-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-6);
}
</style>

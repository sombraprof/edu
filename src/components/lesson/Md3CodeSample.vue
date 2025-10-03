<template>
  <section class="md-stack md-stack-6">
    <header v-if="title || summary" class="md-stack md-stack-2">
      <h3 v-if="title" class="text-title-large font-semibold tracking-tight text-on-surface">
        {{ title }}
      </h3>
      <p v-if="summary" class="text-body-medium text-on-surface-variant" v-html="summary" />
    </header>

    <CodeBlock :code="code" :language="language" />

    <footer v-if="highlights?.length" class="md-stack md-stack-2">
      <p class="text-label-large uppercase tracking-wide text-on-surface-variant">
        Pontos de atenção
      </p>
      <ul
        class="md-stack md-stack-1 list-disc list-inside text-body-medium text-on-surface-variant"
      >
        <li v-for="item in highlights" :key="item" v-html="item" />
      </ul>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CodeBlock from '@/components/lesson/CodeBlock.vue';

interface Props {
  title?: string;
  summary?: string;
  code: string;
  language?: string;
  highlights?: string[];
}

const props = defineProps<Props>();

const language = computed(() => props.language ?? 'java');
</script>

<style scoped>
section {
  background: var(--md-sys-color-surface-container);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 40%, transparent);
  border-radius: var(--md-sys-border-radius-xl);
  padding: var(--md-sys-spacing-6);
}

header h3 {
  margin: 0;
}

footer ul {
  margin: 0;
  padding-inline-start: var(--md-sys-spacing-6);
}
</style>

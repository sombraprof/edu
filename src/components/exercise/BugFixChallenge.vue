<template>
  <article class="bug-fix card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <CodeBlock :code="data.code" :language="data.language" :plainText="!data.language" />

    <p v-if="data.hints?.length" class="text-body-small text-on-surface-variant">
      Linhas suspeitas: {{ data.hints.join(', ') }}
    </p>

    <section v-if="data.guidance?.length" class="bug-fix__guidance">
      <h4 class="text-title-small font-semibold text-on-surface">Dicas de depuração</h4>
      <ul class="md-stack md-stack-1" role="list">
        <li
          v-for="(hint, index) in data.guidance"
          :key="index"
          class="text-body-medium text-on-surface"
        >
          {{ hint }}
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import CodeBlock from '@/components/lesson/CodeBlock.vue';

export interface BugFixChallengeBlockData {
  title?: string;
  description?: string;
  code: string;
  language?: string;
  hints?: number[];
  guidance?: string[];
}

defineProps<{ data: BugFixChallengeBlockData }>();
</script>

<style scoped>
.bug-fix {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface-container);
}

.bug-fix__guidance {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
}
</style>

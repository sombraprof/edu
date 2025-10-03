<template>
  <article class="definition-card card md-stack md-stack-3">
    <header class="md-stack md-stack-1">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">Termo</p>
      <h3 class="text-title-large font-semibold text-on-surface">{{ data.term }}</h3>
    </header>

    <p class="text-body-large leading-relaxed text-on-surface">{{ data.definition }}</p>

    <footer v-if="hasSource" class="definition-card__footer">
      <span class="text-label-small uppercase text-on-surface-variant">Fonte</span>
      <a
        v-if="data.sourceUrl"
        class="text-body-small font-medium text-primary hover:underline"
        :href="data.sourceUrl"
        rel="noreferrer noopener"
        target="_blank"
      >
        {{ data.source }}
      </a>
      <span v-else class="text-body-small text-on-surface-variant">{{ data.source }}</span>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface DefinitionCardBlockData {
  term: string;
  definition: string;
  source?: string;
  sourceUrl?: string;
}

const props = defineProps<{ data: DefinitionCardBlockData }>();

const hasSource = computed(() => Boolean(props.data.source));
</script>

<style scoped>
.definition-card {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.definition-card__footer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}
</style>

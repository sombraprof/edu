<template>
  <section class="lesson-glossary">
    <header class="lesson-glossary__header">
      <h3 v-if="data.title" class="lesson-glossary__title">{{ data.title }}</h3>
      <div class="lesson-glossary__search">
        <input
          v-model="query"
          class="lesson-glossary__input"
          type="search"
          placeholder="Buscar termos..."
          aria-label="Buscar termos do glossário"
        />
      </div>
    </header>

    <dl class="lesson-glossary__list">
      <template v-for="(item, i) in filtered" :key="i">
        <dt class="lesson-glossary__term">{{ item.term }}</dt>
        <dd class="lesson-glossary__definition" v-html="item.definition"></dd>
      </template>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface GlossaryItem {
  term: string;
  definition: string;
}
interface GlossaryData {
  title?: string;
  items: Array<GlossaryItem | { name?: string; desc?: string } | string>;
}

const props = defineProps<{ data: GlossaryData }>();

const items = computed<GlossaryItem[]>(() => {
  const raw = Array.isArray(props.data?.items) ? props.data.items : [];
  return raw
    .map((entry) => {
      if (typeof entry === 'string') {
        const term = entry.trim();
        if (!term) return undefined;
        return { term, definition: '' };
      }
      const term = String((entry as any).term ?? (entry as any).name ?? '').trim();
      if (!term) return undefined;
      const definition = sanitizeHtml((entry as any).definition ?? (entry as any).desc ?? '');
      return { term, definition } as GlossaryItem;
    })
    .filter((i): i is GlossaryItem => Boolean(i));
});

const query = ref('');
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter((i) => i.term.toLowerCase().includes(q));
});
</script>

<style scoped>
.lesson-glossary {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-glossary__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-glossary__search {
  margin-top: var(--md-sys-spacing-2);
}

.lesson-glossary__input {
  width: 100%;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
}

.lesson-glossary__list {
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.lesson-glossary__term {
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.lesson-glossary__definition {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

@media (max-width: 640px) {
  .lesson-glossary {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

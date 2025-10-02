<template>
  <section class="lesson-tabs">
    <header class="lesson-tabs__header">
      <h3 v-if="data.title" class="lesson-tabs__title">{{ data.title }}</h3>
    </header>

    <div class="lesson-tabs__bar" role="tablist">
      <button
        v-for="(t, i) in tabs"
        :key="t.key"
        class="lesson-tabs__tab"
        :id="`tab-${uid}-${i}`"
        :aria-controls="`panel-${uid}-${i}`"
        role="tab"
        :aria-selected="i === index ? 'true' : 'false'"
        :data-active="i === index ? 'true' : 'false'"
        @click="select(i)"
      >
        {{ t.label }}
      </button>
    </div>

    <div
      v-for="(t, i) in tabs"
      :key="t.key + '-panel'"
      v-show="i === index"
      class="lesson-tabs__panel"
      :id="`panel-${uid}-${i}`"
      role="tabpanel"
      :aria-labelledby="`tab-${uid}-${i}`"
    >
      <div v-if="t.html" v-html="t.html"></div>
      <CodeBlock
        v-else-if="t.code"
        :code="t.code.code"
        :language="t.code.language || 'plaintext'"
        :plainText="isPlainText(t.code.language)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import CodeBlock from './CodeBlock.vue';

type TabCode = { code: string; language?: string };
type Tab = { key: string; label: string; html?: string; code?: TabCode };

interface TabsData {
  title?: string;
  tabs: Array<
    | {
        id?: string;
        label?: string;
        title?: string;
        content?: string;
        html?: string;
        code?: string;
        language?: string;
      }
    | string
  >;
}

const props = defineProps<{ data: TabsData }>();
const uid = Math.random().toString(36).slice(2, 9);

const tabs = computed<Tab[]>(() => {
  const raw = Array.isArray(props.data?.tabs) ? props.data.tabs : [];
  return raw
    .map((entry, i) => {
      if (typeof entry === 'string') {
        const label = entry.trim();
        if (!label) return undefined;
        return { key: `tab-${i}`, label, html: '' } as Tab;
      }
      const label = String(entry?.label ?? entry?.title ?? '').trim();
      if (!label) return undefined;
      const html = sanitizeHtml(entry?.html ?? entry?.content ?? '');
      const code =
        typeof entry?.code === 'string' && entry.code.trim().length
          ? {
              code: entry.code,
              language: typeof entry?.language === 'string' ? entry.language : undefined,
            }
          : undefined;
      return { key: String(entry?.id || `tab-${i}`), label, html, code } as Tab;
    })
    .filter((t): t is Tab => Boolean(t));
});

const index = ref(0);
function select(i: number) {
  index.value = i;
}

function isPlainText(language?: string) {
  if (!language) return true;
  const normalized = language.toLowerCase();
  return normalized === 'plaintext' || normalized === 'pseudocode' || normalized === 'text';
}
</script>

<style scoped>
.lesson-tabs {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-4);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-tabs__title {
  font-size: var(--md-sys-typescale-title-large-size, 1.25rem);
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.lesson-tabs__bar {
  display: flex;
  gap: var(--md-sys-spacing-2);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.lesson-tabs__tab {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
}

.lesson-tabs__tab[data-active='true'] {
  color: var(--md-sys-color-primary);
  border-color: var(--md-sys-color-primary);
}

.lesson-tabs__panel {
  color: var(--md-sys-color-on-surface);
}

@media (max-width: 640px) {
  .lesson-tabs {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

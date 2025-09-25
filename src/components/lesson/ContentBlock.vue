<template>
  <div class="card p-8 my-10">
    <h3 class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ data.title }}</h3>

    <template v-for="(item, index) in data.content" :key="index">
      <p
        v-if="item.type === 'paragraph'"
        class="text-body-large mb-4 text-[var(--md-sys-color-on-surface-variant)]"
        v-html="item.text"
      ></p>

      <div v-else-if="item.type === 'subBlock'" class="card surface-tonal p-8 mb-8">
        <h4 class="text-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ item.title }}</h4>
        <template v-for="(subItem, subIndex) in item.items" :key="subIndex">
          <div
            v-if="isString(subItem)"
            class="prose max-w-none mb-4 lesson-content"
            v-html="subItem"
          ></div>
          <component
            v-else-if="isComponent(subItem)"
            :is="resolveComponent(subItem.component)"
            v-bind="subItem.props || {}"
          />
        </template>
      </div>

      <component
        v-else-if="isCalloutBlock(item)"
        :is="Callout"
        :variant="(item as any).variant ?? 'info'"
        :title="(item as any).title"
        :content="(item as any).content"
      />

      <CodeBlock
        v-else-if="item.type === 'code'"
        :code="item.code"
        :language="item.language"
        :plainText="shouldUsePlainText(item.language)"
      />

      <component
        v-else-if="isComponent(item)"
        :is="resolveComponent(item.component)"
        v-bind="item.props || {}"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Callout from './Callout.vue';
import CodeBlock from './CodeBlock.vue';
import CardGrid from './CardGrid.vue';
import MemoryDiagram from './MemoryDiagram.vue';
import Md3Table from './Md3Table.vue';
import Md3LogicOperators from './Md3LogicOperators.vue';
import OrderedList from './OrderedList.vue';

const componentRegistry = {
  CardGrid,
  MemoryDiagram,
  Md3Table,
  Md3LogicOperators,
  OrderedList,
  Callout
} as const;

type RegistryKey = keyof typeof componentRegistry;

type ContentBlockData = {
  title: string;
  content: any[];
};

const props = defineProps<{ data: ContentBlockData }>();

function resolveComponent(name?: string) {
  if (!name) return null;
  return componentRegistry[name as RegistryKey] ?? null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isComponent(value: unknown): value is { component: string; props?: Record<string, unknown> } {
  return Boolean(value) && typeof value === 'object' && typeof (value as any).component === 'string';
}

function isCalloutBlock(item: any): item is { variant?: string; title?: string; content?: string } {
  return item && typeof item === 'object' && item.type === 'callout';
}

function shouldUsePlainText(language?: string): boolean {
  return !language || language === 'plaintext' || language === 'pseudocode' || language === 'text';
}
</script>

<style scoped>
.prose :deep(p),
.prose :deep(ul),
.prose :deep(li) {
  color: var(--md-sys-color-on-surface);
}
</style>
















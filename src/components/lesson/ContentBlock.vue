<template>
  <div class="card p-8 my-10">
    <h3 class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ data.title }}</h3>

    <template v-for="(item, index) in data.content" :key="index">
      <p v-if="item.type === 'paragraph'" class="text-body-large mb-4 text-[var(--md-sys-color-on-surface-variant)]" v-html="item.text"></p>
      
      <div v-if="item.type === 'subBlock'" class="card surface-tonal p-8 mb-8">
        <h4 class="text-title-large font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">{{ item.title }}</h4>
        <div v-for="(subItem, subIndex) in item.items" :key="subIndex" class="prose max-w-none mb-2 lesson-content" v-html="subItem"></div>
      </div>

      <Callout
        v-if="item.type === 'callout'"
        :variant="item.variant"
        :title="item.title"
        :content="item.content"
      />

      <CodeBlock
        v-if="item.type === 'code'"
        :code="item.code"
        :language="item.language"
        :plainText="shouldUsePlainText(item.language)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Callout from './Callout.vue';
import CodeBlock from './CodeBlock.vue';

interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

interface SubBlock {
  type: 'subBlock';
  title: string;
  items: string[];
}

interface CalloutBlock {
  type: 'callout';
  variant: 'info' | 'academic' | 'good-practice' | 'warning';
  title: string;
  content: string;
}

interface CodeBlockItem {
  type: 'code';
  language: string;
  code: string;
}

interface ContentBlockData {
  type: 'contentBlock';
  title: string;
  content: (ParagraphBlock | SubBlock | CalloutBlock | CodeBlockItem)[];
}

// Function to determine if plain text should be used
function shouldUsePlainText(language?: string): boolean {
  // Use plain text for plaintext, pseudocode, or when no language is specified
  return !language || language === 'plaintext' || language === 'pseudocode' || language === 'text';
}

defineProps<{
  data: ContentBlockData;
}>();
</script>

<style scoped>
/* Clean MD3 styling for ContentBlock */
.prose :deep(p),
.prose :deep(ul),
.prose :deep(li) {
  color: var(--md-sys-color-on-surface);
}
</style>

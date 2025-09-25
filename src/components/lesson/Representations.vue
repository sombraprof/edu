
<template>
  <div class="card p-8 my-10">
    <h3 class="text-headline-small font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">{{ data.title }}</h3>
    <p v-if="data.description" class="text-body-large mb-6 text-[var(--md-sys-color-on-surface-variant)]" v-html="data.description"></p>

    <div class="grid grid-cols-1 gap-8">
      <div v-for="(item, index) in data.items" :key="index" class="card !p-6 flex flex-col">
        <h4 class="text-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ item.title }}</h4>
        <p class="text-body-medium text-[var(--md-sys-color-on-surface-variant)] flex-grow" v-html="item.content"></p>
        
        <div class="mt-4 pt-4 border-t border-[var(--md-sys-color-outline)]">
          <!-- Case 1: Render raw HTML detail -->
          <div v-if="item.detail" class="prose max-w-none lesson-content" v-html="item.detail"></div>

          <!-- Case 2: Render styled code block -->
          <div v-if="item.code">
            <CodeBlock
              :code="item.code"
              :language="item.language || 'plaintext'"
              :plainText="shouldUsePlainText(item.language)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeBlock from './CodeBlock.vue';
interface RepresentationItem {
  title: string;
  content: string;
  detail?: string; // For HTML content
  language?: string; // For code blocks
  code?: string; // For code blocks
}

interface RepresentationsData {
  title: string;
  description?: string;
  items: RepresentationItem[];
}

defineProps<{
  data: RepresentationsData;
}>();

// Function to determine if plain text should be used
function shouldUsePlainText(language?: string): boolean {
  // Use plain text for plaintext, pseudocode, or when no language is specified
  return !language || language === 'plaintext' || language === 'pseudocode' || language === 'text';
}
</script>

<style scoped>
/* Basic styling for the flowchart example */
:deep(.flowchart-container) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
}

:deep(.flowchart-shape) {
  padding: 0.5rem 1rem;
  border: 2px solid var(--md-sys-color-outline);
  border-radius: 0.5rem;
  background-color: var(--md-sys-color-surface-container);
  text-align: center;
}

:deep(.flowchart-terminal) {
  border-radius: 999px;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-color: var(--md-sys-color-secondary);
}

:deep(.flowchart-io) {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-color: var(--md-sys-color-primary);
}

:deep(.flowchart-process) {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  border-color: var(--md-sys-color-tertiary);
}

:deep(.flowchart-arrow)::after {
  content: '→';
  font-size: 1.5rem;
  color: var(--md-sys-color-on-surface-variant);
}

/* Ensure prose styles inside this component are consistent */
:deep(.prose) {
  color: var(--md-sys-color-on-surface-variant);
}
:deep(.prose) ol > li::before {
  background-color: var(--md-sys-color-on-surface-variant);
}
</style>



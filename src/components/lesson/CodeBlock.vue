<template>
  <div :class="['code-block group', { 'plain-text-mode': plainText }]">
    <div
      class="flex justify-end items-center py-2 px-3 bg-[var(--md-sys-color-surface-container-high)] border-b border-[var(--md-sys-color-outline)]"
    >
      <button
        @click="copyCode"
        class="btn-icon"
        :aria-label="copied ? 'Copiado!' : 'Copiar código'"
      >
        <Check v-if="copied" :size="18" />
        <Copy v-else :size="18" />
      </button>
    </div>
    <pre
      class="p-4 pt-0 m-0"
    ><code :class="plainText ? 'plain-text' : `language-${language}`" ref="codeElement">{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import Prism from 'prismjs';
import { Copy, Check } from 'lucide-vue-next';

// Import base languages used in other definitions
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';

// Import required languages
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';

// Define Portugol and Pseudocode language support
Prism.languages.portugol = {
  comment: {
    pattern: /(\/\/.*)|(\/\*[\s\S]*?(?:\*\/|$))/,
    greedy: true,
  },
  string: {
    pattern: /"(?:\\.|[^\\"])*"/,
    greedy: true,
  },
  keyword: {
    pattern:
      /\b(?:algoritmo|declare|leia|escreva|caso|contrario|se|entao|senao|fim_algoritmo|fim_se|para|de|ate|faca|fim_para|enquanto|fim_enquanto|funcao|procedimento|retorne|inteiro|real|caractere|logico|vetor)\b/i,
    greedy: true,
  },
  function: {
    pattern: /\b\w+(?:\s*\()/,
    greedy: true,
  },
  operator: /<-|->|<=>|<=|>=|==|!=|E|OU|NAO|mod|div/i,
  number: /\b\d+(?:\.\d+)?\b/,
  punctuation: /["()[\\\]{}\":;,.]/,
};
Prism.languages.pseudocode = Prism.languages.portugol;
Prism.languages.pseudocodigo = Prism.languages.portugol;

const props = defineProps<{
  code: string;
  language: string;
  plainText?: boolean;
}>();

const codeElement = ref<HTMLElement | null>(null);
const copied = ref(false);

const copyCode = () => {
  navigator.clipboard.writeText(props.code).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};

const highlight = () => {
  if (codeElement.value && !props.plainText) {
    Prism.highlightElement(codeElement.value);
  }
};

onMounted(() => {
  highlight();
});

watch(
  () => [props.code, props.language],
  () => {
    nextTick(() => {
      highlight();
    });
  },
  { immediate: true }
);
</script>

<style>
/* Using a global style tag here to define the Prism theme based on MD3 */

/* Base code block style */
.code-block {
  background-color: var(--md-sys-color-surface-container);
  border-radius: 1rem;
  overflow: hidden;
  margin: 1.5rem 0;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 65%, transparent);
  position: relative;
}

/* Button container styling */
.code-block > div:first-child {
  background-color: var(--md-sys-color-surface-container-high);
  border-bottom: 1px solid var(--md-sys-color-outline);
}

/* Button styling */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  transition:
    background-color 200ms ease,
    color 200ms ease,
    border-color 200ms ease;
}

.btn-icon:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-color: var(--md-sys-color-primary);
}

.btn-icon:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.btn-icon svg {
  color: currentColor;
}

/* Plain text styling - no syntax highlighting */
.plain-text {
  color: var(--md-sys-color-on-surface) !important;
  background: transparent !important;
}

.plain-text * {
  color: var(--md-sys-color-on-surface) !important;
  background: transparent !important;
  font-weight: normal !important;
  font-style: normal !important;
}

/* Ensure plain text doesn't inherit Prism styles */
.code-block .plain-text {
  all: unset;
  color: var(--md-sys-color-on-surface);
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.875em;
  font-weight: 500;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Plain text mode - remove borders, shadows and backgrounds */
.code-block.plain-text-mode {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.code-block.plain-text-mode > div:first-child {
  display: none !important; /* Hide the button container */
}

.code-block.plain-text-mode pre {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}

.code-block pre,
.code-block code {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  text-shadow: none;
  background: none;
  text-align: left;
  white-space: pre-wrap;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.6;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

/* Light Theme */
:root {
  --prism-color-text: var(--md-sys-color-on-surface);
  --prism-color-comment: var(--md-sys-color-on-surface-variant);
  --prism-color-keyword: var(--md-sys-color-primary);
  --prism-color-string: var(--md-sys-color-secondary);
  --prism-color-function: var(--md-sys-color-primary);
  --prism-color-number: var(--md-sys-color-error);
  --prism-color-operator: var(--md-sys-color-on-surface-variant);
  --prism-color-punctuation: var(--md-sys-color-outline);
}

/* Dark Theme */
html:not(.light) {
  --prism-color-text: var(--md-sys-color-on-surface);
  --prism-color-comment: var(--md-sys-color-on-surface-variant);
  --prism-color-keyword: var(--md-sys-color-primary);
  --prism-color-string: var(--md-sys-color-secondary);
  --prism-color-function: var(--md-sys-color-primary);
  --prism-color-number: var(--md-sys-color-error);
  --prism-color-operator: var(--md-sys-color-on-surface-variant);
  --prism-color-punctuation: var(--md-sys-color-outline);
}

/* Token colors */
code[class*='language-'],
pre[class*='language-'] {
  color: var(--prism-color-text);
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: var(--prism-color-comment);
  font-style: italic;
}

.token.punctuation {
  color: var(--prism-color-punctuation);
}

.token.namespace {
  opacity: 0.7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: var(--prism-color-number);
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: var(--prism-color-string);
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: var(--prism-color-operator);
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: var(--prism-color-keyword);
}

.token.function,
.token.class-name {
  color: var(--prism-color-function);
}

.token.regex,
.token.important,
.token.variable {
  color: var(--prism-color-string);
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}
</style>

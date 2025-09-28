<template>
  <div :class="['code-block group', { 'plain-text-mode': plainText }]">
    <header class="code-block__chrome">
      <div class="code-block__chrome-dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="code-block__label" :title="displayLanguage">{{ displayLanguage }}</p>
      <div class="code-block__toolbar">
        <Md3Button
          variant="text"
          icon
          type="button"
          :aria-label="copied ? 'Copiado!' : 'Copiar código'"
          @click="copyCode"
        >
          <template #leading>
            <span class="md-icon md-icon--md" aria-hidden="true">
              <Check v-if="copied" />
              <Copy v-else />
            </span>
          </template>
        </Md3Button>
      </div>
    </header>
    <pre
      class="code-block__pre"
    ><code :class="plainText ? 'plain-text' : `language-${language}`" ref="codeElement">{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import Prism from 'prismjs';
import { Copy, Check } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

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

const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
    plainText?: boolean;
  }>(),
  {
    language: 'plaintext',
  }
);

const codeElement = ref<HTMLElement | null>(null);
const copied = ref(false);

const languageLabels: Record<string, string> = {
  c: 'C',
  clike: 'C-like',
  cpp: 'C++',
  csharp: 'C#',
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  kotlin: 'Kotlin',
  portugol: 'Portugol',
  pseudocode: 'Pseudocódigo',
  pseudocodigo: 'Pseudocódigo',
  python: 'Python',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  plaintext: 'Texto simples',
  text: 'Texto simples',
};

const displayLanguage = computed(() => {
  const languageKey = props.language?.toLowerCase() ?? 'plaintext';
  if (languageLabels[languageKey]) {
    return languageLabels[languageKey];
  }

  return languageKey.replace(/[-_]/g, ' ').replace(/\b\w/g, (segment) => segment.toUpperCase());
});

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
  --_chrome-padding-inline: clamp(1.25rem, 3vw, 1.75rem);
  --_chrome-padding-block: var(--md-sys-spacing-2);
  --_content-padding-inline: clamp(1.25rem, 3vw, 1.75rem);
  --_content-padding-block: var(--md-sys-spacing-4);

  background-color: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-shape-corner-extra-large, var(--md-sys-border-radius-xl));
  margin-block: var(--code-block-spacing, 0);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.code-block__chrome {
  display: flex;
  align-items: center;
  gap: var(--md-sys-spacing-3);
  padding-inline: var(--_chrome-padding-inline);
  padding-block: var(--_chrome-padding-block);
  background-color: var(--md-sys-color-surface-container-highest);
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-highest) 88%,
    transparent
  );
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 70%, transparent);
}

.code-block__chrome-dots {
  display: inline-flex;
  gap: 0.45rem;
}

.code-block__chrome-dots span {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 28%, transparent);
  transition: background-color 200ms ease;
}

.group:hover .code-block__chrome-dots span {
  background: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 42%, transparent);
}

.code-block__label {
  margin: 0;
  font: var(--md-sys-typescale-label-medium, 500 0.75rem/1.2 'Figtree', sans-serif);
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
}

.code-block__toolbar {
  display: flex;
  justify-content: flex-end;
}

.code-block__pre {
  margin: 0;
  padding-inline: var(--_content-padding-inline);
  padding-block: var(--_content-padding-block);
  padding-top: var(--md-sys-spacing-2);
  overflow-x: auto;
}

.code-block code {
  border: none;
  box-shadow: none;
  padding: 0;
  background: none;
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

.code-block.plain-text-mode .code-block__chrome {
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
html[data-theme='dark'] {
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

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
/* Accessible code block redesign focused on high-contrast legibility */
.code-block {
  --cb-radius: 12px;
  --cb-border: color-mix(in srgb, var(--md-sys-color-outline, #cbd5f5) 45%, transparent 55%);
  --cb-surface: color-mix(in srgb, var(--md-sys-color-surface, #ffffff) 94%, white 6%);
  --cb-header-bg: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-highest, #e8edf5) 80%,
    white 20%
  );
  --cb-header-text: color-mix(in srgb, var(--md-sys-color-on-surface, #0f172a) 95%, black 5%);
  --cb-code-bg: color-mix(in srgb, var(--md-sys-color-surface, #ffffff) 90%, #dbeafe 10%);
  --cb-toolbar-color: color-mix(
    in srgb,
    var(--md-sys-color-primary, #2563eb) 70%,
    var(--md-sys-color-on-surface, #0f172a) 30%
  );
  --cb-dot-red: #f87171;
  --cb-dot-amber: #f59e0b;
  --cb-dot-green: #22c55e;

  background: var(--cb-surface);
  border-radius: var(--cb-radius);
  box-shadow: none;
  margin-block: var(--code-block-spacing, 1.5rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

html[data-theme='dark'] .code-block {
  --cb-border: rgba(148, 163, 184, 0.35);
  --cb-surface: #0b121a;
  --cb-header-bg: #121c2b;
  --cb-header-text: #e2e8f0;
  --cb-code-bg: #0f1c2f;
  --cb-toolbar-color: #60a5fa;
  --cb-dot-red: #fb7185;
  --cb-dot-amber: #facc15;
  --cb-dot-green: #34d399;
}

.code-block__chrome {
  display: flex;
  align-items: center;
  gap: var(--md-sys-spacing-3, 0.75rem);
  padding-inline: var(--md-sys-spacing-6, 1.25rem);
  padding-block: var(--md-sys-spacing-3, 0.75rem);
  background: var(--cb-header-bg);
  color: var(--cb-header-text);
  border-bottom: 1px solid color-mix(in srgb, var(--cb-border) 70%, transparent 30%);
}

.code-block__chrome-dots {
  display: inline-flex;
  gap: 0.5rem;
}

.code-block__chrome-dots span {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--cb-dot-red);
  opacity: 0.9;
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.code-block__chrome-dots span:nth-child(2) {
  background: var(--cb-dot-amber);
}

.code-block__chrome-dots span:nth-child(3) {
  background: var(--cb-dot-green);
}

.group:hover .code-block__chrome-dots span {
  opacity: 1;
  transform: scale(1.05);
}

.code-block__label {
  margin: 0;
  font:
    600 0.78rem/1.2 'Figtree',
    'Inter',
    system-ui;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: inherit;
  flex: 1;
  user-select: none;
}

.code-block__toolbar {
  display: flex;
  justify-content: flex-end;
  color: var(--cb-toolbar-color);
}

.code-block__toolbar .md3-button {
  color: inherit;
  font-weight: 600;
}

.code-block__toolbar .md3-button:hover,
.code-block__toolbar .md3-button:focus-visible {
  color: color-mix(in srgb, var(--cb-toolbar-color) 85%, white 15%);
}

.code-block__pre {
  margin: 0;
  padding: var(--md-sys-spacing-5, 0.75rem);
  background: var(--cb-code-bg);
  border: none;
  border-radius: 0;
  overflow-x: auto;
}

.code-block code {
  display: block;
  min-width: 100%;
  background: none;
  border: none;
  padding: 0;
  font-family: 'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace;
  font-size: 0.95rem;
  line-height: 1.65;
  letter-spacing: 0.01em;
  color: var(--prism-color-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  tab-size: 4;
  border-radius: 8px;
  padding: 4px;
}

/* Plain text block variant */
.code-block.plain-text-mode {
  --cb-border: transparent;
  --cb-surface: transparent;
  --cb-header-bg: transparent;
  --cb-code-bg: transparent;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  margin-block: 0;
}

.code-block.plain-text-mode .code-block__chrome {
  display: none !important;
}

.code-block.plain-text-mode pre {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}

.code-block .plain-text {
  color: var(--prism-color-text);
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  white-space: pre-wrap;
}

/* Prism token palette */
:root {
  --prism-color-text: #0f172a;
  --prism-color-comment: #64748b;
  --prism-color-keyword: #4338ca;
  --prism-color-string: #0f766e;
  --prism-color-function: #b45309;
  --prism-color-number: #b91c1c;
  --prism-color-operator: #1e293b;
  --prism-color-punctuation: #475569;
}

html[data-theme='dark'] {
  --prism-color-text: #e2e8f0;
  --prism-color-comment: #94a3b8;
  --prism-color-keyword: #c084fc;
  --prism-color-string: #34d399;
  --prism-color-function: #38bdf8;
  --prism-color-number: #fca5a5;
  --prism-color-operator: #bae6fd;
  --prism-color-punctuation: #cbd5f5;
}

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

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: var(--prism-color-number);
}

.token.boolean,
.token.number {
  color: var(--prism-color-number);
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
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
  font-weight: 600;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}
</style>

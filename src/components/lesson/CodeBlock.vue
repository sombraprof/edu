<template>
  <div class="code-block group">
    <div class="flex justify-end items-center py-1 px-2">
      <button 
        @click="copyCode" 
        class="btn-icon"
        :aria-label="copied ? 'Copiado!' : 'Copiar código'"
      >
        <Check v-if="copied" :size="18" class="text-success-500" />
        <Copy v-else :size="18" />
      </button>
    </div>
    <pre class="p-4 pt-0 m-0"><code :class="`language-${language}`" ref="codeElement">{{ code }}</code></pre>
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
	'comment': {
		pattern: /(\/\/.*)|(\/\*[\s\S]*?(?:\*\/|$))/, 
		greedy: true
	},
	'string': {
		pattern: /"(?:\\.|[^\\"])*"/, 
		greedy: true
	},
	'keyword': {
		pattern: /\b(?:algoritmo|declare|leia|escreva|caso|contrario|se|entao|senao|fim_algoritmo|fim_se|para|de|ate|faca|fim_para|enquanto|fim_enquanto|funcao|procedimento|retorne|inteiro|real|caractere|logico|vetor)\b/i,
		greedy: true
	},
	'function': {
		pattern: /\b\w+(?:\s*\()/,
		greedy: true
	},
	'operator': /<-|->|<=>|<=|>=|==|!=|E|OU|NAO|mod|div/i,
	'number': /\b\d+(?:\.\d+)?\b/,
	'punctuation': /["()[\\\]{}\":;,.]/
};
Prism.languages.pseudocode = Prism.languages.portugol;
Prism.languages.pseudocodigo = Prism.languages.portugol;


const props = defineProps<{ 
  code: string;
  language: string;
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
  if (codeElement.value) {
    Prism.highlightElement(codeElement.value);
  }
};

onMounted(() => {
  highlight();
});

watch(() => [props.code, props.language], () => {
  nextTick(() => {
    highlight();
  });
}, { immediate: true });
</script>


<style>
/* Using a global style tag here to define the Prism theme based on MD3 */

/* Base code block style */
.code-block {
  background-color: var(--md-sys-color-surface-container);
  border-radius: 1rem;
  overflow: hidden;
  margin: 1.5rem 0;
  box-shadow: var(--shadow-elevation-1);
  border: 1px solid var(--md-sys-color-outline);
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
  --prism-color-text: #1c1b1f;
  --prism-color-comment: #616161;
  --prism-color-keyword: #880e4f;
  --prism-color-string: #0d47a1;
  --prism-color-function: #1565c0;
  --prism-color-number: #ad1457;
  --prism-color-operator: #45464f;
  --prism-color-punctuation: #757575;
}

/* Dark Theme */
html:not(.light) {
  --prism-color-text: #e2e7f2;
  --prism-color-comment: #c1c8d8;
  --prism-color-keyword: #f48fb1;
  --prism-color-string: #90caf9;
  --prism-color-function: #bbdefb;
  --prism-color-number: #f8bbd9;
  --prism-color-operator: #c1c8d8;
  --prism-color-punctuation: #a3b1c7;
}

/* Token colors */
code[class*=language-],
pre[class*=language-] {
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
  opacity: .7;
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

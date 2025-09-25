<template>
  <section
    ref="container"
    class="legacy-html lesson-content prose max-w-none dark:prose-invert"
    v-html="sanitizedHtml"
  ></section>
</template>

<script setup lang="ts">
// Sanitises legacy HTML fragments while applying baseline Material 3 surfaces and
// enhances plain <pre><code> blocks so they match the modern CodeBlock component.
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import Prism from 'prismjs';

// Keep language support aligned with CodeBlock.vue
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';

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

const props = defineProps<{ html: string }>();
const container = ref<HTMLElement | null>(null);
const PROCESSED_FLAG = 'data-legacy-code-enhanced';

function stripRawHtml(html: string): string {
  if (!html) return '';
  try {
    if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      doc
        .querySelectorAll('script, style, link[rel="stylesheet"], noscript, iframe, meta')
        .forEach((node) => node.remove());

      const chromeSelectors = ['header', 'nav', 'footer'];
      chromeSelectors.forEach((selector) => {
        doc.body.querySelectorAll(selector).forEach((node) => {
          const text = node.textContent?.toLowerCase() ?? '';
          const shouldRemove =
            text.includes('prof. tiago sombra') ||
            text.includes('disciplinas') ||
            text.includes('voltar para a disciplina') ||
            node.className?.includes('site-header') ||
            node.className?.includes('top-bar');

          if (shouldRemove) {
            node.remove();
          }
        });
      });

      return (doc.body?.innerHTML ?? '').trim();
    }
  } catch (error) {
    console.warn('[LegacyHtml] Failed to sanitize legacy HTML', error);
  }

  return html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .trim();
}

const sanitizedHtml = computed(() => stripRawHtml(props.html));

function enhanceCodeBlocks() {
  if (!container.value) return;

  const preElements = Array.from(container.value.querySelectorAll('pre')) as HTMLPreElement[];

  preElements.forEach((pre) => {
    if (pre.getAttribute(PROCESSED_FLAG) === 'true') {
      return;
    }

    if (pre.closest('.code-block')) {
      pre.setAttribute(PROCESSED_FLAG, 'true');
      return;
    }

    const originalCode = pre.querySelector('code');
    const codeText = originalCode?.textContent ?? pre.textContent ?? '';
    const languageMatch = originalCode?.className.match(/language-([\w-]+)/i);
    const language = languageMatch ? languageMatch[1] : '';

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block legacy-code-block';

    const header = document.createElement('div');
    header.className =
      'legacy-code-block__header flex justify-end items-center py-2 px-3 bg-[var(--md-sys-color-surface-container-high)] border-b border-[var(--md-sys-color-outline)]';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-icon legacy-code-block__button';
    button.setAttribute('aria-label', 'Copiar código');

    const copyIcon =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    const checkIcon =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';

    button.innerHTML = copyIcon;

    let copyTimeout: number | null = null;
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(codeText).then(() => {
        button.innerHTML = checkIcon;
        button.setAttribute('aria-label', 'Copiado!');
        if (copyTimeout) window.clearTimeout(copyTimeout);
        copyTimeout = window.setTimeout(() => {
          button.innerHTML = copyIcon;
          button.setAttribute('aria-label', 'Copiar código');
        }, 2000);
      });
    });

    header.appendChild(button);

    const preClone = document.createElement('pre');
    preClone.className = 'p-4 pt-0 m-0';

    const codeClone = originalCode
      ? (originalCode.cloneNode(true) as HTMLElement)
      : document.createElement('code');
    if (!originalCode) {
      codeClone.textContent = codeText;
    }

    if (language) {
      if (!codeClone.classList.contains(`language-${language}`)) {
        codeClone.classList.add(`language-${language}`);
      }
    } else if (!Array.from(codeClone.classList).some((cls) => cls.startsWith('language-'))) {
      codeClone.classList.add('language-plaintext');
    }

    preClone.appendChild(codeClone);

    wrapper.appendChild(header);
    wrapper.appendChild(preClone);

    pre.replaceWith(wrapper);
    wrapper.setAttribute(PROCESSED_FLAG, 'true');

    nextTick(() => {
      Prism.highlightElement(codeClone as HTMLElement);
    });
  });
}

onMounted(() => {
  nextTick(() => {
    enhanceCodeBlocks();
  });
});

watch(
  sanitizedHtml,
  () => {
    nextTick(() => {
      enhanceCodeBlocks();
    });
  },
  { immediate: true }
);
</script>

<style scoped>
.legacy-html {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  color: var(--md-sys-color-on-surface);
  font-family: var(
    --md-sys-typescale-body-large-font,
    'Inter',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif
  );
  line-height: 1.6;
}

.legacy-html :deep(*) {
  box-sizing: border-box;
}

.legacy-html :deep(section),
.legacy-html :deep(article),
.legacy-html :deep(.bg-white),
.legacy-html :deep(.bg-white\/80),
.legacy-html :deep(.shadow),
.legacy-html :deep(.shadow-lg),
.legacy-html :deep(.shadow-sm),
.legacy-html :deep(.rounded-lg),
.legacy-html :deep(.rounded-xl) {
  background-color: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  box-shadow: none;
  padding: var(--md-sys-spacing-5);
}

html:not(.light) .legacy-html :deep(section),
html:not(.light) .legacy-html :deep(article),
html:not(.light) .legacy-html :deep(.bg-white),
html:not(.light) .legacy-html :deep(.bg-white\/80),
html:not(.light) .legacy-html :deep(.shadow),
html:not(.light) .legacy-html :deep(.shadow-lg),
html:not(.light) .legacy-html :deep(.shadow-sm),
html:not(.light) .legacy-html :deep(.rounded-lg),
html:not(.light) .legacy-html :deep(.rounded-xl) {
  background-color: var(--md-sys-color-surface-container);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 50%, transparent);
  box-shadow: var(--shadow-elevation-2);
}

.legacy-html :deep(h1),
.legacy-html :deep(h2),
.legacy-html :deep(h3),
.legacy-html :deep(h4),
.legacy-html :deep(h5),
.legacy-html :deep(h6) {
  color: var(--md-sys-color-on-surface);
  font-weight: 600;
  margin: 0;
}

.legacy-html :deep(h1) {
  font-size: var(--md-sys-typescale-headline-medium-size, 1.75rem);
}
.legacy-html :deep(h2) {
  font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
}
.legacy-html :deep(h3) {
  font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
}
.legacy-html :deep(h4),
.legacy-html :deep(h5),
.legacy-html :deep(h6) {
  font-size: var(--md-sys-typescale-title-small-size, 1rem);
}

.legacy-html :deep(h1),
.legacy-html :deep(h2),
.legacy-html :deep(h3),
.legacy-html :deep(h4),
.legacy-html :deep(h5),
.legacy-html :deep(h6) {
  margin-top: var(--md-sys-spacing-4);
  margin-bottom: var(--md-sys-spacing-2);
}

.legacy-html :deep(p) {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.legacy-html :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
  font-weight: 500;
}

.legacy-html :deep(a:hover) {
  opacity: 0.85;
}

.legacy-html :deep(ul),
.legacy-html :deep(ol) {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--md-sys-color-on-surface-variant);
}

.legacy-html :deep(li) {
  margin-bottom: var(--md-sys-spacing-1);
}

.legacy-html :deep(blockquote) {
  border-left: 4px solid var(--md-sys-color-primary);
  padding-left: var(--md-sys-spacing-4);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 80%, transparent);
}

.legacy-html :deep(pre) {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-border-radius-medium);
  padding: var(--md-sys-spacing-4);
  overflow-x: auto;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 50%, transparent);
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  box-shadow: none;
}

.legacy-html :deep(code) {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-small);
  padding: 0.125rem 0.375rem;
  font-size: 0.9em;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
}

.legacy-html :deep(img) {
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
  box-shadow: var(--shadow-elevation-1);
  max-width: 100%;
  height: auto;
}

.legacy-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
}

.legacy-html :deep(th),
.legacy-html :deep(td) {
  padding: var(--md-sys-spacing-3);
  border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
  text-align: left;
}

.legacy-html :deep(th) {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
  color: var(--md-sys-color-on-surface);
  font-weight: 600;
}

.legacy-html :deep(tr:nth-child(even)) {
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface) 85%,
    var(--md-sys-color-surface-container) 15%
  );
}

.legacy-html :deep(iframe) {
  width: 100%;
  min-height: 320px;
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
}

.legacy-html :deep(details) {
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  background: var(--md-sys-color-surface-container);
  padding: var(--md-sys-spacing-3);
}

.legacy-html :deep(summary) {
  cursor: pointer;
  font-weight: 600;
  color: var(--md-sys-color-primary);
}

.legacy-html :deep(hr) {
  border: none;
  height: 1px;
  background: color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
  margin: var(--md-sys-spacing-6) 0;
}

.legacy-html :deep(.btn),
.legacy-html :deep(button) {
  font-family: inherit;
}

.legacy-html :deep(.btn) {
  display: inline-flex;
  align-items: center;
  gap: var(--md-sys-spacing-2);
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  padding: 0.6rem 1.2rem;
  border-radius: var(--md-sys-border-radius-large);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-elevation-2);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.legacy-html :deep(.btn:hover) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-elevation-3);
}

.legacy-html :deep(.btn-tonal) {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.legacy-html :deep(.btn-tonal:hover) {
  box-shadow: var(--shadow-elevation-2);
}

.legacy-html :deep(.code-block) {
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  box-shadow: none;
  background: var(--md-sys-color-surface);
}

.legacy-code-block__button svg {
  pointer-events: none;
}
</style>

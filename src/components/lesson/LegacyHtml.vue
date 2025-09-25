<template>
  <section
    class="legacy-html lesson-content prose max-w-none dark:prose-invert"
    v-html="sanitizedHtml"
  ></section>
</template>

<script setup lang="ts">
// Sanitises legacy HTML fragments while applying baseline Material 3 surfaces.
import { computed } from 'vue';

const props = defineProps<{ html: string }>();

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
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  box-shadow: var(--shadow-elevation-1);
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
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-border-radius-medium);
  padding: var(--md-sys-spacing-4);
  overflow-x: auto;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
}

.legacy-html :deep(code) {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-small);
  padding: 0.125rem 0.375rem;
  font-size: 0.9em;
}

.legacy-html :deep(img) {
  max-width: 100%;
  border-radius: var(--md-sys-border-radius-medium);
}

.legacy-html :deep(.container) {
  max-width: min(1040px, 100%);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  padding-inline: var(--md-sys-spacing-5);
}

.legacy-html :deep(.grid) {
  display: grid;
  gap: var(--md-sys-spacing-4);
}

.legacy-html :deep(.grid-cols-1) {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.legacy-html :deep(.md\:grid-cols-2) {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.legacy-html :deep(.flex) {
  display: flex;
}

.legacy-html :deep(.gap-4),
.legacy-html :deep(.gap-6),
.legacy-html :deep(.gap-8) {
  gap: var(--md-sys-spacing-4);
}

.legacy-html :deep(.space-y-2) > * + * {
  margin-top: var(--md-sys-spacing-2);
}

.legacy-html :deep(.space-y-3) > * + * {
  margin-top: var(--md-sys-spacing-3);
}

.legacy-html :deep(.space-y-4) > * + * {
  margin-top: var(--md-sys-spacing-4);
}

.legacy-html :deep(.px-6) {
  padding-inline: var(--md-sys-spacing-5);
}

.legacy-html :deep(.py-10) {
  padding-block: var(--md-sys-spacing-10);
}

.legacy-html :deep(.mt-4) {
  margin-top: var(--md-sys-spacing-4);
}

.legacy-html :deep(.mb-12) {
  margin-bottom: var(--md-sys-spacing-8);
}

.legacy-html :deep(.hidden),
.legacy-html :deep(nav),
.legacy-html :deep(.fixed) {
  display: none !important;
}

.legacy-html :deep(i.fa),
.legacy-html :deep(i.fas),
.legacy-html :deep(i.far) {
  display: none !important;
}

.legacy-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-medium);
  overflow: hidden;
}

.legacy-html :deep(table th),
.legacy-html :deep(table td) {
  padding: var(--md-sys-spacing-3);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  text-align: left;
}

.legacy-html :deep(hr) {
  border: none;
  height: 1px;
  background: color-mix(in srgb, var(--md-sys-color-outline) 70%, transparent);
  margin: var(--md-sys-spacing-6) 0;
}
</style>

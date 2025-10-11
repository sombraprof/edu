<template>
  <article class="slide-deck card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        Deck de slides
      </p>
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <section v-if="isExternal" class="slide-deck__external md-stack md-stack-2">
      <div v-if="iframeSrc" class="slide-deck__frame" :style="externalFrameStyle">
        <iframe
          :src="iframeSrc"
          :title="iframeTitle"
          loading="lazy"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        ></iframe>
      </div>
      <p v-else class="text-body-small text-on-surface-variant">
        {{ externalErrorMessage }}
      </p>
      <a
        v-if="iframeSrc && data.url && showOpenInNewTab"
        class="slide-deck__open text-label-large"
        :href="data.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir em nova aba
      </a>
    </section>

    <section v-else class="slide-deck__local md-stack md-stack-3">
      <div
        v-if="localState.loading"
        class="slide-deck__status text-body-medium text-on-surface-variant"
      >
        Carregando slides…
      </div>
      <div v-else-if="localState.error" class="slide-deck__status text-body-medium text-error">
        {{ localState.error }}
      </div>
      <div v-else-if="localSlidesCount > 0" class="slide-deck__viewer md-stack md-stack-3">
        <div class="slide-deck__nav">
          <button
            type="button"
            class="md3-button md3-button--outlined"
            @click="goToPrevious"
            :disabled="!canGoPrevious"
          >
            Anterior
          </button>
          <span class="text-body-medium text-on-surface-variant" aria-live="polite">
            Slide {{ localState.index + 1 }} de {{ localSlidesCount }}
          </span>
          <button
            type="button"
            class="md3-button md3-button--filled"
            @click="goToNext"
            :disabled="!canGoNext"
          >
            Próximo
          </button>
        </div>

        <div class="slide-deck__slide" role="group" :aria-label="currentSlideLabel">
          <article class="slide-deck__slide-content" v-html="currentSlideHtml"></article>
        </div>
      </div>
      <p v-else class="slide-deck__status text-body-medium text-on-surface-variant">
        Nenhum slide foi encontrado no arquivo informado.
      </p>

      <footer v-if="data.downloadUrl || data.notes" class="slide-deck__footer md-stack md-stack-2">
        <p v-if="data.notes" class="text-body-small text-on-surface-variant">
          {{ data.notes }}
        </p>
        <a
          v-if="data.downloadUrl"
          class="slide-deck__download text-label-large"
          :href="data.downloadUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Baixar original
        </a>
      </footer>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

const contentSlideLoaders = import.meta.glob('../../content/**/*.{html,md,mdx,json}', {
  as: 'raw',
});
const assetSlideLoaders = import.meta.glob('../../assets/**/*.{html,md,mdx,json}', { as: 'raw' });
const slideLoaderMap = new Map<string, () => Promise<string>>([
  ...Object.entries(contentSlideLoaders),
  ...Object.entries(assetSlideLoaders),
]);

interface SlideFragment {
  html: string;
  label?: string;
}

type SlideDeckSourceType = 'external' | 'reveal' | 'mdx';

export interface SlideDeckBlockData {
  title?: string;
  description?: string;
  sourceType: SlideDeckSourceType;
  url?: string;
  slidesPath?: string;
  downloadUrl?: string;
  notes?: string;
  height?: number;
  initialSlide?: number;
  allowOpenInNewTab?: boolean;
}

const props = defineProps<{ data: SlideDeckBlockData }>();
const data = computed(() => props.data);

const isExternal = computed(() => props.data.sourceType === 'external');

const iframeTitle = computed(() => props.data.title || 'Deck de slides incorporado');

const showOpenInNewTab = computed(() => props.data.allowOpenInNewTab !== false);

const iframeSrc = computed(() => {
  if (!isExternal.value || !props.data.url) {
    return '';
  }
  try {
    const parsed = new URL(props.data.url);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch (error) {
    console.warn('[SlideDeck] Invalid external URL provided', error);
    return '';
  }
});

const externalFrameStyle = computed(() => {
  if (!props.data.height || props.data.height <= 0) {
    return {};
  }
  return {
    minHeight: `${props.data.height}px`,
  } as const;
});

const externalErrorMessage = computed(() => {
  if (!props.data.url) {
    return 'Informe uma URL pública para incorporar o deck externo.';
  }
  return 'Não foi possível validar a URL fornecida para o deck externo.';
});

interface LocalSlideState {
  loading: boolean;
  error: string;
  slides: SlideFragment[];
  index: number;
}

const localState = reactive<LocalSlideState>({
  loading: false,
  error: '',
  slides: [],
  index: 0,
});

const localSlidesCount = computed(() => localState.slides.length);

const currentSlideHtml = computed(() => localState.slides[localState.index]?.html ?? '');

const currentSlideLabel = computed(() => {
  const label = localState.slides[localState.index]?.label;
  if (label) {
    return label;
  }
  return `Slide ${localState.index + 1}`;
});

const canGoPrevious = computed(() => localState.index > 0);
const canGoNext = computed(() => localState.index < localState.slides.length - 1);

function goToPrevious() {
  if (canGoPrevious.value) {
    localState.index -= 1;
  }
}

function goToNext() {
  if (canGoNext.value) {
    localState.index += 1;
  }
}

function clampInitialIndex(slideCount: number): number {
  if (slideCount === 0) {
    return 0;
  }
  const requested = typeof props.data.initialSlide === 'number' ? props.data.initialSlide : 1;
  if (Number.isFinite(requested) && requested > 0) {
    return Math.min(slideCount - 1, Math.max(0, Math.round(requested) - 1));
  }
  return 0;
}

async function loadLocalSlides() {
  if (isExternal.value) {
    return;
  }
  const path = props.data.slidesPath?.trim();
  if (!path) {
    localState.slides = [];
    localState.error = 'Informe `slidesPath` com o arquivo exportado do deck.';
    return;
  }

  localState.loading = true;
  localState.error = '';
  localState.slides = [];
  try {
    const raw = await readSlideSource(path);
    if (!raw) {
      localState.error = 'Não foi possível carregar o arquivo de slides informado.';
      return;
    }
    const slides = parseSlides(raw, props.data.sourceType);
    if (!slides.length) {
      localState.slides = [];
      return;
    }
    localState.slides = slides;
    localState.index = clampInitialIndex(slides.length);
  } catch (error) {
    console.error('[SlideDeck] Failed to load local slides', error);
    localState.error = 'Ocorreu um erro ao processar o arquivo de slides.';
  } finally {
    localState.loading = false;
  }
}

async function readSlideSource(rawPath: string): Promise<string> {
  const normalized = normalizeSlidesPath(rawPath);
  if (!normalized) {
    return '';
  }

  const loader = getSlideLoader(normalized);
  if (loader) {
    try {
      const content = await loader();
      if (typeof content === 'string') {
        return content;
      }
    } catch (error) {
      console.warn('[SlideDeck] Failed to load slides via glob import', normalized, error);
    }
  }

  if (isAbsoluteUrl(normalized)) {
    try {
      const response = await fetch(normalized);
      if (response.ok) {
        return await response.text();
      }
      console.warn('[SlideDeck] Failed to fetch slides from URL', normalized, response.status);
    } catch (error) {
      console.warn('[SlideDeck] Network error fetching slides', normalized, error);
    }
    return '';
  }

  if (normalized.startsWith('public/')) {
    const relative = normalized.slice('public/'.length);
    try {
      const response = await fetch(`/${relative}`);
      if (response.ok) {
        return await response.text();
      }
      console.warn(
        '[SlideDeck] Failed to fetch slides from public directory',
        normalized,
        response.status
      );
    } catch (error) {
      console.warn(
        '[SlideDeck] Network error fetching slides from public directory',
        normalized,
        error
      );
    }
    return '';
  }

  try {
    const response = await fetch(normalized);
    if (response.ok) {
      return await response.text();
    }
    console.warn(
      '[SlideDeck] Failed to fetch slides using relative path',
      normalized,
      response.status
    );
  } catch (error) {
    console.warn(
      '[SlideDeck] Network error fetching slides using relative path',
      normalized,
      error
    );
  }
  return '';
}

function getSlideLoader(normalized: string) {
  return slideLoaderMap.get(normalized);
}

function normalizeSlidesPath(rawPath: string): string | null {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    return null;
  }
  if (isAbsoluteUrl(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('@/')) {
    return `../../${trimmed.slice(2)}`;
  }
  if (trimmed.startsWith('~/')) {
    return `../../${trimmed.slice(2)}`;
  }
  if (trimmed.startsWith('src/')) {
    return `../../${trimmed.slice(4)}`;
  }
  if (trimmed.startsWith('content/')) {
    return `../../${trimmed}`;
  }
  if (trimmed.startsWith('assets/')) {
    return `../../${trimmed}`;
  }
  if (trimmed.startsWith('../')) {
    return trimmed;
  }
  if (trimmed.startsWith('public/')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `../../content/${trimmed}`;
}

function isAbsoluteUrl(value: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(value);
}

function parseSlides(raw: string, sourceType: SlideDeckSourceType): SlideFragment[] {
  if (!raw) {
    return [];
  }
  if (sourceType === 'external') {
    return [];
  }
  const html = typeof raw === 'string' ? raw : String(raw);
  const fragments = extractHtmlSections(html);
  return fragments.map((fragment, index) => ({
    html: sanitizeHtml(fragment.html),
    label: fragment.label || `Slide ${index + 1}`,
  }));
}

interface ExtractedSection {
  html: string;
  label?: string;
}

function extractHtmlSections(html: string): ExtractedSection[] {
  if (typeof window !== 'undefined' && 'DOMParser' in window) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const container = doc.querySelector('.slides') ?? doc.body;
      const sections = flattenSections(container);
      return sections.map((section) => ({
        html: section.innerHTML || section.outerHTML,
        label: resolveSectionLabel(section),
      }));
    } catch (error) {
      console.warn('[SlideDeck] DOMParser failed, falling back to split parsing', error);
    }
  }
  return fallbackSplitSections(html);
}

function flattenSections(root: Element | null): Element[] {
  if (!root) {
    return [];
  }
  const result: Element[] = [];
  const directSections = Array.from(root.children).filter(
    (node) => node instanceof HTMLElement && node.tagName.toLowerCase() === 'section'
  ) as HTMLElement[];
  if (
    !directSections.length &&
    root instanceof HTMLElement &&
    root.tagName.toLowerCase() === 'section'
  ) {
    directSections.push(root);
  }
  for (const section of directSections) {
    const nested = Array.from(section.children).filter(
      (node) => node instanceof HTMLElement && node.tagName.toLowerCase() === 'section'
    ) as HTMLElement[];
    if (nested.length) {
      result.push(...nested);
    } else {
      result.push(section);
    }
  }
  return result;
}

function resolveSectionLabel(section: Element): string | undefined {
  const dataTitle = section.getAttribute('data-title') || section.getAttribute('aria-label');
  if (dataTitle) {
    return dataTitle;
  }
  const heading = section.querySelector('h1, h2, h3, h4');
  if (heading && heading.textContent) {
    return heading.textContent.trim();
  }
  return undefined;
}

function fallbackSplitSections(html: string): ExtractedSection[] {
  const cleaned = html.replace(/\r?\n/g, '\n');
  const parts = cleaned.split(/<\s*section[^>]*>/i).slice(1);
  return parts
    .map((part) => {
      const endIndex = part.indexOf('</section>');
      const content = endIndex !== -1 ? part.slice(0, endIndex) : part;
      return content.trim();
    })
    .filter((fragment) => fragment.length > 0)
    .map((fragment) => ({ html: fragment }));
}

function handleKeydown(event: KeyboardEvent) {
  if (isExternal.value || localSlidesCount.value === 0) {
    return;
  }
  if (event.defaultPrevented) {
    return;
  }
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    event.preventDefault();
    goToNext();
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    goToPrevious();
  }
}

watch(
  () => [props.data.sourceType, props.data.slidesPath],
  () => {
    if (!isExternal.value) {
      loadLocalSlides();
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.slide-deck {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.slide-deck__external,
.slide-deck__local {
  width: 100%;
}

.slide-deck__frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline);
}

.slide-deck__frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.slide-deck__open,
.slide-deck__download {
  color: var(--md-sys-color-primary);
  text-decoration: none;
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.slide-deck__open:hover,
.slide-deck__download:hover {
  text-decoration: underline;
}

.slide-deck__viewer {
  width: 100%;
}

.slide-deck__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.slide-deck__nav .md3-button {
  min-width: 8rem;
}

.slide-deck__slide {
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 1rem;
  overflow: hidden;
  background: var(--md-sys-color-surface-variant);
  padding: 1.5rem;
}

.slide-deck__slide-content :deep(*) {
  max-width: min(80ch, 100%);
  margin-inline: auto;
}

.slide-deck__status {
  padding: 0.75rem 1rem;
  background: var(--md-sys-color-surface-variant);
  border-radius: 0.75rem;
}

.slide-deck__footer {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
}

@media (max-width: 640px) {
  .slide-deck {
    padding: 1.25rem;
  }

  .slide-deck__frame {
    aspect-ratio: 4 / 3;
  }

  .slide-deck__slide {
    padding: 1rem;
  }
}
</style>

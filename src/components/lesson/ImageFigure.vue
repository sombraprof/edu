<template>
  <figure class="image-figure">
    <div v-if="figures.length" class="image-figure__media">
      <component
        v-if="figures.length === 1"
        :is="figures[0].lightbox ? 'button' : 'div'"
        :type="figures[0].lightbox ? 'button' : undefined"
        class="image-figure__trigger"
        :class="{ 'image-figure__trigger--static': !figures[0].lightbox }"
        @click="figures[0].lightbox ? openLightbox(0) : undefined"
        :aria-label="figures[0].lightbox ? ariaLabelFor(figures[0]) : undefined"
        :data-test="figures[0].lightbox ? 'image-figure-trigger' : undefined"
      >
        <picture class="image-figure__picture">
          <template v-for="(source, sourceIndex) in figures[0].sources ?? []" :key="sourceIndex">
            <source
              :srcset="source.srcset"
              :type="source.type"
              :media="source.media"
              :sizes="source.sizes ?? figures[0].sizes"
            />
          </template>
          <img
            :src="figures[0].src"
            :srcset="figures[0].srcset"
            :sizes="figures[0].sizes"
            :alt="figures[0].alt"
            loading="lazy"
          />
        </picture>
      </component>

      <div v-else class="image-figure__gallery" role="list">
        <component
          v-for="(entry, index) in figures"
          :key="index"
          :is="entry.lightbox ? 'button' : 'div'"
          :type="entry.lightbox ? 'button' : undefined"
          class="image-figure__trigger image-figure__trigger--gallery"
          :class="{ 'image-figure__trigger--static': !entry.lightbox }"
          @click="entry.lightbox ? openLightbox(index) : undefined"
          :aria-label="entry.lightbox ? ariaLabelFor(entry, index) : undefined"
          :data-test="entry.lightbox ? 'image-figure-trigger' : undefined"
        >
          <picture class="image-figure__picture">
            <template v-for="(source, sourceIndex) in entry.sources ?? []" :key="sourceIndex">
              <source
                :srcset="source.srcset"
                :type="source.type"
                :media="source.media"
                :sizes="source.sizes ?? entry.sizes"
              />
            </template>
            <img
              :src="entry.src"
              :srcset="entry.srcset"
              :sizes="entry.sizes"
              :alt="entry.alt"
              loading="lazy"
            />
          </picture>
        </component>
      </div>
    </div>

    <figcaption v-if="caption || credit" class="image-figure__caption">
      <div v-if="caption" v-html="caption"></div>
      <p
        v-if="credit"
        class="image-figure__credit"
        data-test="image-figure-credit"
        v-html="credit"
      ></p>
    </figcaption>
  </figure>

  <Teleport to="body">
    <div
      v-if="isLightboxOpen"
      class="image-figure__lightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="lightboxAriaLabel"
      @keydown.escape.prevent.stop="closeLightbox"
    >
      <div class="image-figure__lightbox-backdrop" @click="closeLightbox"></div>
      <div class="image-figure__lightbox-content" role="document">
        <button
          type="button"
          class="image-figure__close"
          @click="closeLightbox"
          data-test="image-figure-close"
          ref="closeButtonRef"
        >
          Fechar
        </button>

        <figure v-if="activeFigure" class="image-figure__lightbox-figure">
          <picture class="image-figure__picture">
            <template
              v-for="(source, sourceIndex) in activeFigure.sources ?? []"
              :key="sourceIndex"
            >
              <source
                :srcset="source.srcset"
                :type="source.type"
                :media="source.media"
                :sizes="source.sizes ?? activeFigure.sizes"
              />
            </template>
            <img
              :src="activeFigure.src"
              :srcset="activeFigure.srcset"
              :sizes="activeFigure.sizes"
              :alt="activeFigure.alt"
            />
          </picture>
          <figcaption v-if="activeFigure.caption || activeFigure.credit">
            <div v-if="activeFigure.caption" v-html="activeFigure.caption"></div>
            <p
              v-if="activeFigure.credit"
              class="image-figure__credit"
              v-html="activeFigure.credit"
            ></p>
          </figcaption>
        </figure>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { buildSrcSet, resolveAsset, type PictureSource } from '@/utils/mediaAssets';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

type ImageSourceEntry = {
  src?: unknown;
  srcset?: unknown;
  type?: unknown;
  media?: unknown;
  sizes?: unknown;
  width?: unknown;
  density?: unknown;
  descriptor?: unknown;
};

type ImageEntry = {
  src?: unknown;
  srcset?: unknown;
  alt?: unknown;
  caption?: unknown;
  credit?: unknown;
  lightbox?: unknown;
  sizes?: unknown;
  sources?: unknown;
};

type NormalizedImage = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  srcset?: string;
  sizes?: string;
  sources?: PictureSource[];
  lightbox: boolean;
};

const props = defineProps<{
  src?: string;
  srcset?: string;
  sizes?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  sources?: Array<ImageSourceEntry | null | undefined>;
  lightbox?: boolean;
  images?: Array<ImageEntry | null | undefined>;
}>();

const activeIndex = ref<number | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);
const figures = ref<NormalizedImage[]>([]);
let refreshToken = 0;

watch(
  () => ({
    src: props.src,
    srcset: props.srcset,
    sizes: props.sizes,
    alt: props.alt,
    caption: props.caption,
    credit: props.credit,
    sources: props.sources,
    lightbox: props.lightbox,
    images: props.images,
  }),
  () => {
    void refreshFigures();
  },
  { deep: true, immediate: true }
);

const caption = computed(() => {
  const explicit = sanitizeRichText(props.caption);
  if (explicit) {
    return explicit;
  }
  return figures.value[0]?.caption;
});

const credit = computed(() => {
  const explicit = sanitizeRichText(props.credit);
  if (explicit) {
    return explicit;
  }
  return figures.value[0]?.credit;
});

const hasLightbox = computed(() => figures.value.some((figure) => figure.lightbox));

const isLightboxOpen = computed(() => hasLightbox.value && activeIndex.value !== null);

const activeFigure = computed(() =>
  activeIndex.value === null ? undefined : figures.value[activeIndex.value]
);

const lightboxAriaLabel = computed(() => {
  if (!activeFigure.value) {
    return 'Visualização de imagem';
  }
  if (activeFigure.value.alt) {
    return `Visualização da imagem: ${activeFigure.value.alt}`;
  }
  return 'Visualização de imagem ampliada';
});

function sanitizeRichText(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  const sanitized = sanitizeHtml(value);
  return sanitized.trim().length ? sanitized : undefined;
}

async function refreshFigures() {
  const token = ++refreshToken;
  const entries: ImageEntry[] = [];

  if (Array.isArray(props.images) && props.images.length > 0) {
    props.images.forEach((entry) => {
      if (entry && typeof entry === 'object') {
        entries.push(entry);
      }
    });
  } else if (props.src) {
    entries.push({
      src: props.src,
      srcset: props.srcset,
      alt: props.alt,
      caption: props.caption,
      credit: props.credit,
      sizes: props.sizes,
      sources: props.sources,
      lightbox: props.lightbox,
    });
  }

  const defaultLightbox = props.lightbox !== false;
  const normalized = await Promise.all<NormalizedImage | null>(
    entries.map((entry) => normalizeImage(entry, defaultLightbox))
  );
  if (token !== refreshToken) {
    return;
  }
  figures.value = normalized.filter((entry): entry is NormalizedImage => entry !== null);
}

async function normalizeImage(entry: ImageEntry | undefined, defaultLightbox: boolean) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const rawSrc = typeof entry.src === 'string' ? entry.src.trim() : '';
  if (!rawSrc) {
    return null;
  }

  const alt = typeof entry.alt === 'string' ? entry.alt : '';
  const caption = sanitizeRichText(entry.caption);
  const credit = sanitizeRichText(entry.credit);
  const sizes = typeof entry.sizes === 'string' ? entry.sizes : undefined;
  const lightbox = entry.lightbox === false ? false : defaultLightbox;

  const responsive = await buildSrcSet(rawSrc);
  const resolvedSrc = responsive?.src ?? (await resolveAsset(rawSrc));
  if (!resolvedSrc) {
    return null;
  }

  const explicitSrcset = await normalizeSrcsetString(entry.srcset);
  const manualSources = await normalizeSources(entry.sources);
  const generatedSources = responsive?.sources ?? [];
  const finalSources = manualSources.length
    ? manualSources
    : generatedSources.length
      ? generatedSources
      : undefined;

  return {
    src: resolvedSrc,
    alt,
    caption,
    credit,
    srcset: explicitSrcset ?? responsive?.srcset,
    sizes: sizes ?? responsive?.sizes,
    sources: finalSources,
    lightbox,
  };
}

async function normalizeSources(value: unknown): Promise<PictureSource[]> {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: PictureSource[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const rawType = (entry as ImageSourceEntry).type;
    const type = typeof rawType === 'string' ? rawType : undefined;
    const rawMedia = (entry as ImageSourceEntry).media;
    const media = typeof rawMedia === 'string' ? rawMedia : undefined;
    const rawSizes = (entry as ImageSourceEntry).sizes;
    const sizes = typeof rawSizes === 'string' ? rawSizes : undefined;
    const descriptor = getDescriptor(entry as ImageSourceEntry);

    let srcset: string | undefined;
    if (typeof (entry as ImageSourceEntry).srcset === 'string') {
      srcset = await normalizeSrcsetString((entry as ImageSourceEntry).srcset);
    } else if (descriptor && typeof (entry as ImageSourceEntry).src === 'string') {
      const resolved = await resolveAsset((entry as ImageSourceEntry).src as string);
      srcset = `${resolved} ${descriptor}`;
    }

    if (!srcset) {
      continue;
    }

    normalized.push({
      srcset,
      type,
      media,
      sizes,
    });
  }

  return normalized;
}

function getDescriptor(entry: ImageSourceEntry): string | undefined {
  if (typeof entry.descriptor === 'string' && entry.descriptor.trim()) {
    return entry.descriptor.trim();
  }
  if (typeof entry.width === 'number' && Number.isFinite(entry.width) && entry.width > 0) {
    return `${Math.round(entry.width)}w`;
  }
  if (typeof entry.density === 'number' && Number.isFinite(entry.density) && entry.density > 0) {
    return `${entry.density}x`;
  }
  return undefined;
}

async function normalizeSrcsetString(value: unknown): Promise<string | undefined> {
  if (typeof value !== 'string') {
    return undefined;
  }
  const entries = value
    .split(',')
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
  if (entries.length === 0) {
    return undefined;
  }
  const normalized: string[] = [];
  for (const entry of entries) {
    const [path, descriptor] = entry.split(/\s+/, 2);
    if (!path) {
      continue;
    }
    const resolved = await resolveAsset(path);
    normalized.push(descriptor ? `${resolved} ${descriptor}` : resolved);
  }
  return normalized.length ? normalized.join(', ') : undefined;
}

function ariaLabelFor(entry: NormalizedImage, index?: number) {
  if (entry.alt) {
    return `Ampliar imagem: ${entry.alt}`;
  }
  if (typeof index === 'number') {
    return `Ampliar imagem ${index + 1}`;
  }
  return 'Ampliar imagem';
}

function openLightbox(index: number) {
  if (!hasLightbox.value || !figures.value[index]?.lightbox) {
    return;
  }
  const activeElement = document.activeElement;
  previousFocus.value = activeElement instanceof HTMLElement ? activeElement : null;
  activeIndex.value = index;
  nextTick(() => {
    closeButtonRef.value?.focus();
  });
}

function closeLightbox() {
  if (activeIndex.value === null) {
    return;
  }
  activeIndex.value = null;
  nextTick(() => {
    previousFocus.value?.focus();
  });
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isLightboxOpen.value) {
    event.preventDefault();
    closeLightbox();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});

watch(
  () => figures.value.length,
  (length) => {
    if (length === 0 || !hasLightbox.value) {
      activeIndex.value = null;
    }
  }
);

watch(
  () => hasLightbox.value,
  (value) => {
    if (!value) {
      activeIndex.value = null;
    }
  }
);
</script>

<style scoped>
.image-figure {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
  align-items: center;
}

.image-figure__media {
  width: 100%;
}

.image-figure__trigger {
  display: block;
  border: none;
  padding: 0;
  background: none;
  cursor: zoom-in;
  border-radius: var(--md-sys-border-radius-large);
  overflow: hidden;
  box-shadow: var(--md-sys-elevation-level1);
}

.image-figure__trigger--static {
  cursor: default;
}

.image-figure__trigger--static img {
  cursor: default;
}

.image-figure__trigger img {
  display: block;
  width: 100%;
  height: auto;
}

.image-figure__picture {
  display: block;
}

.image-figure__gallery {
  display: grid;
  gap: var(--md-sys-spacing-3);
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.image-figure__trigger--gallery {
  cursor: pointer;
}

.image-figure__caption {
  font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.image-figure__credit {
  font-style: italic;
}

.image-figure__lightbox {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.image-figure__lightbox-backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, black 60%, transparent);
}

.image-figure__lightbox-content {
  position: relative;
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-5);
  max-width: min(960px, 90vw);
  max-height: min(90vh, 720px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
  box-shadow: var(--md-sys-elevation-level3);
}

.image-figure__close {
  align-self: flex-end;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-4);
  border-radius: var(--md-sys-border-radius-medium);
  cursor: pointer;
  font-weight: 600;
}

.image-figure__lightbox-figure {
  display: grid;
  gap: var(--md-sys-spacing-3);
  justify-items: center;
}

.image-figure__lightbox-figure img {
  width: 100%;
  height: auto;
  border-radius: var(--md-sys-border-radius-large);
}
</style>

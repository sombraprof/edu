<template>
  <figure class="image-figure">
    <div v-if="figures.length" class="image-figure__media">
      <button
        v-if="figures.length === 1"
        type="button"
        class="image-figure__trigger"
        @click="openLightbox(0)"
        :aria-label="ariaLabelFor(figures[0])"
        data-test="image-figure-trigger"
      >
        <img :src="figures[0].src" :alt="figures[0].alt" loading="lazy" />
      </button>

      <div v-else class="image-figure__gallery" role="list">
        <button
          v-for="(entry, index) in figures"
          :key="index"
          type="button"
          class="image-figure__trigger image-figure__trigger--gallery"
          @click="openLightbox(index)"
          :aria-label="ariaLabelFor(entry, index)"
          data-test="image-figure-trigger"
        >
          <img :src="entry.src" :alt="entry.alt" loading="lazy" />
        </button>
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
          <img :src="activeFigure.src" :alt="activeFigure.alt" />
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
import { sanitizeHtml } from '@/utils/sanitizeHtml';

type ImageEntry = {
  src?: unknown;
  alt?: unknown;
  caption?: unknown;
  credit?: unknown;
};

type NormalizedImage = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
};

const props = defineProps<{
  src?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  images?: Array<ImageEntry | null | undefined>;
}>();

const activeIndex = ref<number | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);

const figures = computed<NormalizedImage[]>(() => {
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
      alt: props.alt,
      caption: props.caption,
      credit: props.credit,
    });
  }

  return entries
    .map((entry) => normalizeImage(entry))
    .filter((entry): entry is NormalizedImage => Boolean(entry) && Boolean(entry.src));
});

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

const isLightboxOpen = computed(() => activeIndex.value !== null);

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

function normalizeImage(entry: ImageEntry | undefined): NormalizedImage | null {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const src = typeof entry.src === 'string' ? entry.src.trim() : '';
  if (!src) {
    return null;
  }

  const alt = typeof entry.alt === 'string' ? entry.alt : '';
  const caption = sanitizeRichText(entry.caption);
  const credit = sanitizeRichText(entry.credit);

  return {
    src,
    alt,
    caption,
    credit,
  };
}

function sanitizeRichText(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  const sanitized = sanitizeHtml(value);
  return sanitized.trim().length ? sanitized : undefined;
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
  if (!figures.value[index]) {
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
    if (length === 0) {
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

.image-figure__trigger img {
  display: block;
  width: 100%;
  height: auto;
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

<template>
  <section class="lesson-stepper">
    <header class="lesson-stepper__header">
      <h3 v-if="data.title" class="lesson-stepper__title">{{ data.title }}</h3>
      <p v-if="data.summary" class="lesson-stepper__summary">{{ data.summary }}</p>
    </header>

    <ol class="lesson-stepper__indicators" role="list">
      <li
        v-for="(s, i) in steps"
        :key="i"
        class="lesson-stepper__indicator"
        :data-active="i === index ? 'true' : 'false'"
        :aria-current="i === index ? 'step' : undefined"
        @click="go(i)"
      >
        <span class="lesson-stepper__bullet">{{ i + 1 }}</span>
        <span class="lesson-stepper__label">{{ s.title }}</span>
      </li>
    </ol>

    <div class="lesson-stepper__status sr-only" aria-live="polite">{{ liveAnnouncement }}</div>

    <div class="lesson-stepper__content">
      <h4 class="lesson-stepper__step-title">{{ current.title }}</h4>
      <div
        v-if="current.description"
        class="lesson-stepper__desc"
        v-html="current.description"
      ></div>
      <div v-if="current.html" class="lesson-stepper__html" v-html="current.html"></div>

      <div v-if="current.media" class="lesson-stepper__media">
        <ImageFigure
          v-if="current.media.kind === 'image' || current.media.kind === 'gallery'"
          v-bind="current.media.figure"
          class="lesson-stepper__figure"
        />
        <div v-else-if="current.media.kind === 'video'" class="lesson-stepper__video">
          <div class="lesson-stepper__video-frame">
            <iframe
              :src="current.media.src"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="lesson-stepper__video-iframe"
              :title="current.media.title"
              data-test="lesson-stepper-video"
            ></iframe>
          </div>
          <p
            v-if="current.media.caption"
            class="lesson-stepper__media-caption"
            v-html="current.media.caption"
          ></p>
        </div>
        <div
          v-else-if="current.media.kind === 'embed'"
          class="lesson-stepper__embed"
          v-html="current.media.html"
          data-test="lesson-stepper-embed"
        ></div>
        <p
          v-if="current.media.kind === 'embed' && current.media.caption"
          class="lesson-stepper__media-caption"
          v-html="current.media.caption"
        ></p>
      </div>

      <div
        v-else-if="current.embed"
        class="lesson-stepper__embed"
        v-html="current.embed"
        data-test="lesson-stepper-embed"
      ></div>

      <p
        v-if="!current.media && !current.embed && current.mediaFallback"
        class="lesson-stepper__media-fallback"
        data-test="lesson-stepper-media-fallback"
      >
        {{ current.mediaFallback }}
      </p>

      <p
        v-if="!current.media && current.caption"
        class="lesson-stepper__media-caption"
        v-html="current.caption"
      ></p>

      <CodeBlock
        v-if="current.code"
        class="lesson-stepper__code"
        :code="current.code.code"
        :language="current.code.language || 'plaintext'"
        :plainText="isPlainText(current.code.language)"
      />
    </div>

    <div class="lesson-stepper__actions">
      <button
        v-if="autoPlayable"
        type="button"
        class="md-button md-button--text"
        :aria-pressed="isPlaying ? 'true' : 'false'"
        @click="toggleAutoPlay"
        data-test="lesson-stepper-autoplay"
      >
        {{ isPlaying ? 'Pausar autoplay' : 'Iniciar autoplay' }}
      </button>
      <button
        type="button"
        class="md-button md-button--outlined"
        :disabled="index === 0"
        @click="prev()"
      >
        Anterior
      </button>
      <button
        type="button"
        class="md-button md-button--filled"
        :disabled="index === steps.length - 1"
        @click="next()"
      >
        Próximo
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import CodeBlock from './CodeBlock.vue';
import ImageFigure from './ImageFigure.vue';

type StepCode = { code: string; language?: string };

type StepMediaImage = {
  src?: string;
  srcset?: string;
  sizes?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  lightbox?: boolean;
  sources?: unknown;
  images?: Array<Record<string, unknown>>;
};

type StepMediaVideo = {
  type?: string;
  src?: string;
  url?: string;
  title?: string;
  caption?: string;
};

type StepMediaEmbed = {
  type?: string;
  html?: string;
  caption?: string;
};

type StepMediaInput = StepMediaImage | StepMediaVideo | StepMediaEmbed | string | null | undefined;

type ComponentProps<C> = C extends new (...args: any[]) => { $props: infer P } ? P : never;
type ImageFigureProps = ComponentProps<typeof ImageFigure>;

type StepMedia =
  | { kind: 'image' | 'gallery'; figure: ImageFigureProps }
  | { kind: 'video'; src: string; title: string; caption?: string }
  | { kind: 'embed'; html: string; caption?: string };

type Step = {
  title: string;
  description?: string;
  html?: string;
  code?: StepCode;
  caption?: string;
  embed?: string;
  media?: StepMedia;
  mediaFallback?: string;
};

type StepperStepInput = {
  title?: string;
  label?: string;
  description?: string;
  html?: string;
  content?: string;
  code?: string | StepCode;
  language?: string;
  media?: StepMediaInput;
  caption?: string;
  embed?: string;
};

interface StepperData {
  title?: string;
  summary?: string;
  steps: StepperStepInput[];
  autoPlay?:
    | boolean
    | number
    | { enabled?: boolean; autoplay?: boolean; start?: boolean; delay?: number };
  autoPlayDelay?: number | string;
}

const props = defineProps<{ data: StepperData }>();

const steps = computed<Step[]>(() => {
  const raw = Array.isArray(props.data?.steps) ? props.data.steps : [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return undefined;
      const title = String(entry.title ?? entry.label ?? '').trim();
      if (!title) return undefined;

      const rawDescription = sanitizeHtml(entry.description ?? '');
      const description = rawDescription.trim().length ? rawDescription : undefined;
      const rawHtml = sanitizeHtml(entry.html ?? entry.content ?? '');
      const html = rawHtml.trim().length ? rawHtml : undefined;
      const normalizedCode = normalizeStepCode(entry.code, entry.language);
      const caption = sanitizeRichText(entry.caption);
      const embed = sanitizeRichText(entry.embed);
      const normalizedMedia = normalizeStepMedia(entry.media, caption);

      const step: Step = { title };
      if (description) {
        step.description = description;
      }
      if (html) {
        step.html = html;
      }
      if (normalizedCode) {
        step.code = normalizedCode;
      }
      if (caption) {
        step.caption = caption;
      }
      if (embed) {
        step.embed = embed;
      }
      if (normalizedMedia.media) {
        step.media = normalizedMedia.media;
      }
      if (normalizedMedia.fallback) {
        step.mediaFallback = normalizedMedia.fallback;
      }

      return step;
    })
    .filter((s): s is Step => s !== undefined);
});

const index = ref(0);
const current = computed(() => steps.value[index.value] ?? { title: '' });

const autoPlayable = computed(() => steps.value.length > 1);
const isPlaying = ref(false);

const autoPlayDelay = computed(() => {
  const rawDelay =
    props.data?.autoPlayDelay ??
    (typeof props.data?.autoPlay === 'number' ? props.data.autoPlay : undefined);
  const parsedDelay = Number(rawDelay);
  if (Number.isFinite(parsedDelay) && parsedDelay >= 2000) {
    return Math.floor(parsedDelay);
  }

  if (props.data?.autoPlay && typeof props.data.autoPlay === 'object') {
    const nestedDelay = Number(props.data.autoPlay.delay);
    if (Number.isFinite(nestedDelay) && nestedDelay >= 2000) {
      return Math.floor(nestedDelay);
    }
  }

  return 8000;
});

watch(
  () => props.data.autoPlay,
  (value) => {
    const shouldPlay = resolveAutoPlayState(value);
    if (shouldPlay && steps.value.length > 1) {
      isPlaying.value = true;
    } else if (!shouldPlay) {
      isPlaying.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => steps.value.length,
  (length) => {
    if (length === 0) {
      index.value = 0;
      isPlaying.value = false;
      return;
    }
    if (index.value >= length) {
      index.value = 0;
    }
    if (length <= 1) {
      isPlaying.value = false;
    }
  }
);

const stepAnnouncement = computed(() => {
  const total = steps.value.length;
  if (!total) {
    return '';
  }
  const step = steps.value[index.value];
  if (!step) {
    return '';
  }
  return `Passo ${index.value + 1} de ${total}: ${step.title}`;
});

const liveAnnouncement = computed(() => {
  const segments = [stepAnnouncement.value];
  if (isPlaying.value) {
    segments.push('Reprodução automática ativada');
  }
  return segments.filter(Boolean).join('. ');
});

let autoTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => [isPlaying.value, index.value, steps.value.length, autoPlayDelay.value] as const,
  () => {
    clearAutoTimer();
    if (!isPlaying.value || steps.value.length <= 1) {
      return;
    }
    autoTimer = setTimeout(() => {
      next(true);
    }, autoPlayDelay.value);
  }
);

onBeforeUnmount(() => {
  clearAutoTimer();
});

function prev() {
  index.value = Math.max(0, index.value - 1);
  stopAutoPlay();
}

function next(auto = false) {
  if (!steps.value.length) {
    index.value = 0;
    return;
  }
  if (auto) {
    index.value = (index.value + 1) % steps.value.length;
    return;
  }
  index.value = Math.min(steps.value.length - 1, index.value + 1);
  stopAutoPlay();
}

function go(i: number) {
  index.value = i;
  stopAutoPlay();
}

function toggleAutoPlay() {
  if (!autoPlayable.value) {
    return;
  }
  isPlaying.value = !isPlaying.value;
}

function stopAutoPlay() {
  if (isPlaying.value) {
    isPlaying.value = false;
  }
}

function clearAutoTimer() {
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = undefined;
  }
}

function isPlainText(language?: string) {
  if (!language) return true;
  const normalized = language.toLowerCase();
  return normalized === 'plaintext' || normalized === 'pseudocode' || normalized === 'text';
}

function resolveAutoPlayState(value: StepperData['autoPlay']): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value >= 0;
  }
  if (value && typeof value === 'object') {
    if (typeof value.enabled === 'boolean') {
      return value.enabled;
    }
    if (typeof value.autoplay === 'boolean') {
      return value.autoplay;
    }
    if (typeof value.start === 'boolean') {
      return value.start;
    }
    if (typeof value.delay === 'number') {
      return true;
    }
  }
  return false;
}

function normalizeStepCode(
  code: StepperStepInput['code'],
  language: unknown
): StepCode | undefined {
  if (typeof code === 'string' && code.trim().length) {
    return {
      code,
      language: typeof language === 'string' ? language : undefined,
    };
  }

  if (code && typeof code === 'object' && typeof (code as StepCode).code === 'string') {
    return {
      code: (code as StepCode).code,
      language:
        typeof (code as StepCode).language === 'string'
          ? (code as StepCode).language
          : typeof language === 'string'
            ? language
            : undefined,
    };
  }

  return undefined;
}

function sanitizeRichText(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  const sanitized = sanitizeHtml(value);
  return sanitized.trim().length ? sanitized : undefined;
}

function normalizeStepMedia(
  value: StepMediaInput,
  caption?: string
): { media?: StepMedia; fallback?: string } {
  if (!value) {
    return {};
  }

  if (typeof value === 'string') {
    const src = value.trim();
    if (!src) {
      return { fallback: 'Mídia indisponível.' };
    }
    return {
      media: {
        kind: 'image',
        figure: {
          src,
          alt: '',
          caption,
        },
      },
    };
  }

  if (typeof value !== 'object') {
    return { fallback: 'Mídia indisponível.' };
  }

  const mediaObject = value as StepMediaVideo & StepMediaEmbed & StepMediaImage;
  const type = typeof mediaObject.type === 'string' ? mediaObject.type.toLowerCase() : undefined;
  const videoCandidate = value as StepMediaVideo;
  const rawVideoUrl = typeof videoCandidate.url === 'string' ? videoCandidate.url : undefined;
  const hasVideoUrl = Boolean(rawVideoUrl && rawVideoUrl.trim().length);

  if (type === 'video' || hasVideoUrl) {
    const candidate: StepMediaVideo = {
      type: 'video',
      url: hasVideoUrl ? rawVideoUrl : undefined,
      src:
        type === 'video' && typeof videoCandidate.src === 'string' ? videoCandidate.src : undefined,
    };
    const videoSrc = resolveVideoSrc(candidate);
    if (!videoSrc) {
      return { fallback: 'Vídeo indisponível.' };
    }
    const rawTitle = typeof videoCandidate.title === 'string' ? videoCandidate.title.trim() : '';
    const videoTitle = rawTitle.length ? rawTitle : 'Vídeo do passo';
    const videoCaption = sanitizeRichText(videoCandidate.caption) ?? caption;
    return {
      media: {
        kind: 'video',
        src: videoSrc,
        title: videoTitle,
        caption: videoCaption,
      },
    };
  }

  const embedCandidate = value as StepMediaEmbed;
  const hasEmbedHtml =
    typeof embedCandidate.html === 'string' && embedCandidate.html.trim().length > 0;

  if (type === 'embed' || hasEmbedHtml) {
    const html = sanitizeRichText(embedCandidate.html);
    if (!html) {
      return { fallback: 'Conteúdo incorporado indisponível.' };
    }
    const embedCaption = sanitizeRichText(embedCandidate.caption) ?? caption;
    return {
      media: {
        kind: 'embed',
        html,
        caption: embedCaption,
      },
    };
  }

  const gallery = normalizeGalleryEntries(mediaObject as StepMediaImage, caption);
  if (gallery) {
    return {
      media: {
        kind: 'gallery',
        figure: gallery,
      },
    };
  }

  const image = normalizeImageEntry(mediaObject as StepMediaImage, caption);
  if (image) {
    return {
      media: {
        kind: 'image',
        figure: image,
      },
    };
  }

  return { fallback: 'Mídia indisponível.' };
}

function normalizeImageEntry(
  value: StepMediaImage,
  caption?: string
): ImageFigureProps | undefined {
  const src = typeof value?.src === 'string' ? value.src.trim() : '';
  if (!src) {
    return undefined;
  }
  const alt = typeof value.alt === 'string' ? value.alt : '';
  const figureCaption = sanitizeRichText(value.caption) ?? caption;
  const credit = sanitizeRichText(value.credit);
  const srcset = typeof value.srcset === 'string' ? value.srcset : undefined;
  const sizes = typeof value.sizes === 'string' ? value.sizes : undefined;
  const lightbox = value.lightbox === false ? false : undefined;
  const sources = Array.isArray(value.sources)
    ? value.sources.filter((entry) => entry && typeof entry === 'object')
    : undefined;

  return {
    src,
    alt,
    caption: figureCaption,
    credit,
    srcset,
    sizes,
    sources,
    lightbox,
  } as ImageFigureProps;
}

function normalizeGalleryEntries(
  value: StepMediaImage,
  caption?: string
): ImageFigureProps | undefined {
  const entries = Array.isArray(value.images) ? value.images : [];
  const images = entries
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return undefined;
      }
      const src = typeof entry.src === 'string' ? entry.src.trim() : '';
      if (!src) {
        return undefined;
      }
      return {
        src,
        alt: typeof entry.alt === 'string' ? entry.alt : '',
        caption: sanitizeRichText(entry.caption),
        credit: sanitizeRichText(entry.credit),
        srcset: typeof entry.srcset === 'string' ? entry.srcset : undefined,
        sizes: typeof entry.sizes === 'string' ? entry.sizes : undefined,
        lightbox: entry.lightbox === false ? false : undefined,
        sources: Array.isArray(entry.sources)
          ? entry.sources.filter((source) => source && typeof source === 'object')
          : undefined,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  if (!images.length) {
    return undefined;
  }

  return {
    images,
    caption: sanitizeRichText(value.caption) ?? caption,
    credit: sanitizeRichText(value.credit),
    lightbox: value.lightbox === false ? false : undefined,
  } as ImageFigureProps;
}

function resolveVideoSrc(video: StepMediaVideo): string {
  if (typeof video?.url === 'string' && video.url.trim().length) {
    return toEmbedUrl(video.url.trim());
  }

  if (typeof video?.src === 'string' && video.src.trim().length) {
    return video.src.trim();
  }

  return '';
}

function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      const pathMatch = parsed.pathname.match(/\/embed\/([^/]+)/);
      if (pathMatch) {
        return `https://www.youtube.com/embed/${pathMatch[1]}`;
      }
    }

    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  } catch (error) {
    return url;
  }
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.lesson-stepper {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-stepper__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-stepper__summary {
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-stepper__indicators {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--md-sys-spacing-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson-stepper__indicator {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-3);
  align-items: center;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
  cursor: pointer;
}

.lesson-stepper__indicator[data-active='true'] {
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
}

.lesson-stepper__bullet {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-primary) 14%, transparent);
  color: var(--md-sys-color-primary);
  font-weight: 700;
}

.lesson-stepper__label {
  color: var(--md-sys-color-on-surface);
  font-weight: 600;
}

.lesson-stepper__desc {
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-stepper__media {
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.lesson-stepper__figure,
.lesson-stepper__video,
.lesson-stepper__embed {
  width: 100%;
}

.lesson-stepper__video-frame {
  position: relative;
  padding-top: 56.25%;
  border-radius: var(--md-sys-border-radius-large);
  overflow: hidden;
  background: var(--md-sys-color-surface-variant);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-stepper__video-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.lesson-stepper__embed :deep(iframe),
.lesson-stepper__embed :deep(video),
.lesson-stepper__embed :deep(embed) {
  width: 100%;
  min-height: 260px;
  border: 0;
  border-radius: var(--md-sys-border-radius-large);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-stepper__media-caption {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.95rem);
}

.lesson-stepper__media-fallback {
  margin-top: var(--md-sys-spacing-3);
  color: var(--md-sys-color-on-surface-variant);
  font-style: italic;
}

.lesson-stepper__actions {
  display: flex;
  gap: var(--md-sys-spacing-2);
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .lesson-stepper {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

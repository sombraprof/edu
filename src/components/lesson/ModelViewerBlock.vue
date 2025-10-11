<template>
  <section class="model-viewer-block">
    <header v-if="hasHeader" class="model-viewer-block__header">
      <h3 v-if="data.title" class="model-viewer-block__title">{{ data.title }}</h3>
      <p
        v-if="data.description"
        class="model-viewer-block__description"
        v-html="sanitizedDescription"
      ></p>
    </header>

    <div class="model-viewer-block__canvas" :data-state="loadState">
      <AsyncModelViewer
        v-if="isReady"
        class="model-viewer-block__viewer"
        :class="{ 'model-viewer-block__viewer--ar': data.ar }"
        :style="viewerDimensions"
        :src="resolvedSrc"
        :poster="resolvedPoster"
        :ios-src="resolvedIosSrc"
        :alt="altText"
        :auto-rotate="autoRotateEnabled"
        :auto-rotate-delay="autoRotateDelay"
        :camera-controls="cameraControlsEnabled"
        :ar="Boolean(data.ar)"
        :ar-modes="arModesAttribute"
        :shadow-intensity="shadowIntensity"
        :exposure="exposure"
        :environment-image="resolvedEnvironmentImage"
        :camera-orbit="cameraOrbit"
        :camera-target="cameraTarget"
        :field-of-view="zoomSettings.initial"
        :min-field-of-view="zoomSettings.min"
        :max-field-of-view="zoomSettings.max"
        :disable-zoom="zoomSettings.disable"
        :interaction-prompt="interactionPrompt"
        :interaction-prompt-style="interactionPromptStyle"
        :reveal="revealMode"
        :loading="loadingMode"
        :touch-action="touchAction"
      />

      <div
        v-else-if="loadState === 'loading'"
        class="model-viewer-block__placeholder"
        role="status"
        aria-live="polite"
      >
        {{ placeholderLabel }}
      </div>

      <div v-else class="model-viewer-block__error-surface" aria-hidden="true"></div>

      <p v-if="loadState === 'error'" class="model-viewer-block__error" role="alert">
        {{ errorMessage }}
      </p>
    </div>

    <footer
      v-if="data.footnote"
      class="model-viewer-block__footnote"
      v-html="sanitizedFootnote"
    ></footer>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { resolveAsset } from '@/utils/mediaAssets';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

type ZoomConfig = {
  min?: number | string | null;
  max?: number | string | null;
  initial?: number | string | null;
  disable?: boolean;
  disabled?: boolean;
};

type ModelViewerBlockData = {
  type: 'modelViewer';
  title?: string;
  description?: string;
  footnote?: string;
  src?: string;
  poster?: string;
  iosSrc?: string;
  alt?: string;
  autoRotate?: boolean;
  autoRotateDelay?: number;
  cameraControls?: boolean;
  ar?: boolean;
  arModes?: string[];
  shadowIntensity?: number;
  exposure?: number;
  environmentImage?: string;
  cameraOrbit?: string;
  cameraTarget?: string;
  interactionPrompt?: string;
  interactionPromptStyle?: 'auto' | 'basic' | 'none';
  reveal?: 'auto' | 'interaction';
  loading?: 'auto' | 'lazy' | 'eager';
  touchAction?: string;
  zoom?: ZoomConfig | null;
  height?: string | number;
  aspectRatio?: string | number;
  loadingLabel?: string;
  errorLabel?: string;
};

const props = defineProps<{ data: ModelViewerBlockData }>();

const prefersReducedMotion = ref(false);
const resolvedSrc = ref('');
const resolvedPoster = ref<string | undefined>();
const resolvedEnvironmentImage = ref<string | undefined>();
const resolvedIosSrc = ref<string | undefined>();
const loadState = ref<'loading' | 'ready' | 'error'>('loading');
const errorMessage = ref('');

onMounted(() => {
  if (typeof window === 'undefined') {
    return;
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updatePreference = () => {
    prefersReducedMotion.value = mediaQuery.matches;
  };

  updatePreference();
  mediaQuery.addEventListener('change', updatePreference);
  onBeforeUnmount(() => mediaQuery.removeEventListener('change', updatePreference));
});

function normalizeCssLength(raw: unknown): string | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return `${raw}px`;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function normalizeAspectRatio(raw: unknown): string | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return `${raw}`;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function normalizeFieldOfView(raw: unknown): string | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return `${raw}deg`;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

async function resolveOptionalAsset(value: unknown): Promise<string | undefined> {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const resolved = await resolveAsset(trimmed);
    return resolved || undefined;
  } catch (error) {
    console.warn('Falha ao resolver asset 3D', value, error);
    return trimmed;
  }
}

let srcRequestId = 0;
let posterRequestId = 0;
let environmentRequestId = 0;
let iosRequestId = 0;

watch(
  () => props.data.src,
  async (value) => {
    const requestId = ++srcRequestId;
    loadState.value = 'loading';
    resolvedSrc.value = '';
    errorMessage.value = '';

    if (typeof value !== 'string' || value.trim().length === 0) {
      if (requestId === srcRequestId) {
        loadState.value = 'error';
        errorMessage.value = errorLabel.value;
      }
      return;
    }

    try {
      const resolved = await resolveAsset(value);
      if (requestId !== srcRequestId) {
        return;
      }

      if (!resolved) {
        loadState.value = 'error';
        errorMessage.value = errorLabel.value;
        return;
      }

      resolvedSrc.value = resolved ?? '';
      loadState.value = 'ready';
    } catch (error) {
      if (requestId !== srcRequestId) {
        return;
      }

      console.error('Não foi possível carregar o modelo 3D.', error);
      loadState.value = 'error';
      errorMessage.value = errorLabel.value;
    }
  },
  { immediate: true }
);

watch(
  () => props.data.poster,
  async (value) => {
    const requestId = ++posterRequestId;
    const resolved = await resolveOptionalAsset(value);
    if (requestId === posterRequestId) {
      resolvedPoster.value = resolved;
    }
  },
  { immediate: true }
);

watch(
  () => props.data.environmentImage,
  async (value) => {
    const requestId = ++environmentRequestId;
    const resolved = await resolveOptionalAsset(value);
    if (requestId === environmentRequestId) {
      resolvedEnvironmentImage.value = resolved;
    }
  },
  { immediate: true }
);

watch(
  () => props.data.iosSrc,
  async (value) => {
    const requestId = ++iosRequestId;
    const resolved = await resolveOptionalAsset(value);
    if (requestId === iosRequestId) {
      resolvedIosSrc.value = resolved;
    }
  },
  { immediate: true }
);

const AsyncModelViewer = defineAsyncComponent({
  suspensible: false,
  loader: async () => {
    await import('@google/model-viewer');
    return defineComponent({
      name: 'LazyModelViewerElement',
      inheritAttrs: false,
      props: {
        src: { type: String, required: true },
        poster: { type: String, default: undefined },
        iosSrc: { type: String, default: undefined },
        alt: { type: String, default: undefined },
        autoRotate: { type: Boolean, default: false },
        autoRotateDelay: { type: Number, default: undefined },
        cameraControls: { type: Boolean, default: true },
        ar: { type: Boolean, default: false },
        arModes: { type: String, default: undefined },
        shadowIntensity: { type: Number, default: undefined },
        exposure: { type: Number, default: undefined },
        environmentImage: { type: String, default: undefined },
        cameraOrbit: { type: String, default: undefined },
        cameraTarget: { type: String, default: undefined },
        fieldOfView: { type: String, default: undefined },
        minFieldOfView: { type: String, default: undefined },
        maxFieldOfView: { type: String, default: undefined },
        disableZoom: { type: Boolean, default: false },
        interactionPrompt: { type: String, default: undefined },
        interactionPromptStyle: { type: String, default: undefined },
        reveal: { type: String, default: undefined },
        loading: { type: String, default: undefined },
        touchAction: { type: String, default: undefined },
      },
      setup(componentProps, { attrs }) {
        return () => {
          const baseAttrs: Record<string, unknown> = {
            ...attrs,
            src: componentProps.src,
          };

          if (componentProps.poster) {
            baseAttrs.poster = componentProps.poster;
          }
          if (componentProps.iosSrc) {
            baseAttrs['ios-src'] = componentProps.iosSrc;
          }
          if (componentProps.alt) {
            baseAttrs.alt = componentProps.alt;
          }
          if (componentProps.autoRotate) {
            baseAttrs['auto-rotate'] = '';
          }
          if (typeof componentProps.autoRotateDelay === 'number') {
            baseAttrs['auto-rotate-delay'] = componentProps.autoRotateDelay;
          }
          if (componentProps.cameraControls) {
            baseAttrs['camera-controls'] = '';
          }
          if (componentProps.ar) {
            baseAttrs.ar = '';
          }
          if (componentProps.arModes) {
            baseAttrs['ar-modes'] = componentProps.arModes;
          }
          if (typeof componentProps.shadowIntensity === 'number') {
            baseAttrs['shadow-intensity'] = componentProps.shadowIntensity;
          }
          if (typeof componentProps.exposure === 'number') {
            baseAttrs.exposure = componentProps.exposure;
          }
          if (componentProps.environmentImage) {
            baseAttrs['environment-image'] = componentProps.environmentImage;
          }
          if (componentProps.cameraOrbit) {
            baseAttrs['camera-orbit'] = componentProps.cameraOrbit;
          }
          if (componentProps.cameraTarget) {
            baseAttrs['camera-target'] = componentProps.cameraTarget;
          }
          if (componentProps.fieldOfView) {
            baseAttrs['field-of-view'] = componentProps.fieldOfView;
          }
          if (componentProps.minFieldOfView) {
            baseAttrs['min-field-of-view'] = componentProps.minFieldOfView;
          }
          if (componentProps.maxFieldOfView) {
            baseAttrs['max-field-of-view'] = componentProps.maxFieldOfView;
          }
          if (componentProps.disableZoom) {
            baseAttrs['disable-zoom'] = '';
          }
          if (componentProps.interactionPrompt) {
            baseAttrs['interaction-prompt'] = componentProps.interactionPrompt;
          }
          if (componentProps.interactionPromptStyle) {
            baseAttrs['interaction-prompt-style'] = componentProps.interactionPromptStyle;
          }
          if (componentProps.reveal) {
            baseAttrs.reveal = componentProps.reveal;
          }
          if (componentProps.loading) {
            baseAttrs.loading = componentProps.loading;
          }
          if (componentProps.touchAction) {
            baseAttrs['touch-action'] = componentProps.touchAction;
          }

          return h('model-viewer', baseAttrs);
        };
      },
    });
  },
});

const viewerDimensions = computed(() => {
  const styles: Record<string, string> = {};
  const height = normalizeCssLength(props.data.height);
  const aspectRatio = normalizeAspectRatio(props.data.aspectRatio);

  if (height) {
    styles.height = height;
  }
  if (aspectRatio) {
    styles.aspectRatio = aspectRatio;
  }

  return styles;
});

const sanitizedDescription = computed(() => sanitizeHtml(props.data.description ?? ''));
const sanitizedFootnote = computed(() => sanitizeHtml(props.data.footnote ?? ''));
const placeholderLabel = computed(() => {
  const raw = props.data.loadingLabel;
  return typeof raw === 'string' && raw.trim().length > 0
    ? raw.trim()
    : 'Carregando visualização 3D…';
});
const errorLabel = computed(() => {
  const raw = props.data.errorLabel;
  return typeof raw === 'string' && raw.trim().length > 0
    ? raw.trim()
    : 'Não foi possível carregar o modelo 3D informado.';
});

watch(
  () => errorLabel.value,
  (label) => {
    if (loadState.value === 'error') {
      errorMessage.value = label;
    }
  }
);

const hasHeader = computed(() => Boolean(props.data.title) || Boolean(props.data.description));
const autoRotateDelay = computed(() => {
  const value = props.data.autoRotateDelay;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
});
const autoRotateEnabled = computed(
  () => Boolean(props.data.autoRotate) && !prefersReducedMotion.value
);
const cameraControlsEnabled = computed(() => props.data.cameraControls !== false);
const arModesAttribute = computed(() => {
  const modes = props.data.arModes;
  if (!Array.isArray(modes)) {
    return undefined;
  }
  const normalized = modes
    .map((mode) => (typeof mode === 'string' ? mode.trim() : ''))
    .filter((mode) => mode.length > 0);
  return normalized.length ? normalized.join(' ') : undefined;
});
const shadowIntensity = computed(() => {
  const value = props.data.shadowIntensity;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
});
const exposure = computed(() => {
  const value = props.data.exposure;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
});
const cameraOrbit = computed(() => {
  const value = props.data.cameraOrbit;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
});
const cameraTarget = computed(() => {
  const value = props.data.cameraTarget;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
});
const interactionPrompt = computed(() => {
  const value = props.data.interactionPrompt;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
});
const interactionPromptStyle = computed(() => {
  const value = props.data.interactionPromptStyle;
  return value === 'auto' || value === 'basic' || value === 'none' ? value : undefined;
});
const revealMode = computed(() => {
  const value = props.data.reveal;
  return value === 'interaction' ? 'interaction' : value === 'auto' ? 'auto' : undefined;
});
const loadingMode = computed(() => {
  const value = props.data.loading;
  return value === 'lazy' || value === 'eager' || value === 'auto' ? value : undefined;
});
const touchAction = computed(() => {
  const value = props.data.touchAction;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
});
const zoomSettings = computed(() => {
  const config = props.data.zoom ?? {};
  const disable = Boolean((config as ZoomConfig).disable ?? (config as ZoomConfig).disabled);
  const min = normalizeFieldOfView((config as ZoomConfig).min);
  const max = normalizeFieldOfView((config as ZoomConfig).max);
  const initial = normalizeFieldOfView((config as ZoomConfig).initial);
  return {
    disable,
    min,
    max,
    initial,
  };
});
const isReady = computed(() => loadState.value === 'ready' && Boolean(resolvedSrc.value));
const altText = computed(() => {
  const raw = props.data.alt;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }
  if (typeof props.data.title === 'string' && props.data.title.trim().length > 0) {
    return props.data.title.trim();
  }
  return undefined;
});
</script>

<style scoped>
.model-viewer-block {
  display: grid;
  gap: 1.5rem;
}

.model-viewer-block__header {
  display: grid;
  gap: 0.5rem;
}

.model-viewer-block__title {
  font: var(--md-sys-typescale-title-large, 600 1.5rem/1.4 'Roboto', sans-serif);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.model-viewer-block__description,
.model-viewer-block__footnote {
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium, 400 1rem/1.5 'Roboto', sans-serif);
  margin: 0;
}

.model-viewer-block__canvas {
  position: relative;
}

.model-viewer-block__viewer,
.model-viewer-block__placeholder,
.model-viewer-block__error-surface {
  width: 100%;
  min-height: clamp(240px, 55vw, 600px);
  border-radius: var(--md-sys-shape-corner-extra-large, 24px);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-high) 88%, transparent);
  box-shadow: var(--md-sys-elevation-level2, 0 20px 45px rgba(15, 23, 42, 0.16));
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 45%, transparent);
  overflow: hidden;
}

.model-viewer-block__viewer {
  display: block;
}

.model-viewer-block__viewer--ar {
  border-style: dashed;
}

.model-viewer-block__placeholder {
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  padding: 1.5rem;
  background-image: linear-gradient(
    120deg,
    color-mix(in srgb, var(--md-sys-color-surface-container) 75%, transparent) 20%,
    color-mix(in srgb, var(--md-sys-color-surface-container-high) 90%, transparent) 40%,
    color-mix(in srgb, var(--md-sys-color-surface-container) 75%, transparent) 60%
  );
  background-size: 200% 100%;
  animation: model-viewer-block__shimmer 2.4s ease-in-out infinite;
}

.model-viewer-block__error-surface {
  background: color-mix(in srgb, var(--md-sys-color-error-container) 22%, transparent);
}

.model-viewer-block__error {
  margin: 0.75rem 0 0;
  color: var(--md-sys-color-error);
  font: var(--md-sys-typescale-body-medium, 400 1rem/1.5 'Roboto', sans-serif);
}

.model-viewer-block__footnote {
  border-left: 4px solid color-mix(in srgb, var(--md-sys-color-secondary) 30%, transparent);
  padding-left: 1rem;
}

@keyframes model-viewer-block__shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 720px) {
  .model-viewer-block {
    gap: 1.25rem;
  }

  .model-viewer-block__viewer,
  .model-viewer-block__placeholder,
  .model-viewer-block__error-surface {
    min-height: clamp(220px, 65vw, 520px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .model-viewer-block__placeholder {
    animation-duration: 0s;
  }
}
</style>

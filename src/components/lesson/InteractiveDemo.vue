<template>
  <article class="interactive-demo card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        Demo interativa
      </p>
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <div v-if="safeUrl" class="interactive-demo__frame" :style="frameStyle">
      <iframe
        :src="safeUrl"
        :title="data.title || 'Demonstração interativa'"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
      ></iframe>
    </div>

    <p v-else class="text-body-small text-on-surface-variant">
      {{ warningMessage }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  buildEmbedUrl,
  normalizeEmbedPage,
  normalizeEmbedTheme,
  resolveEmbedProvider,
  type EmbedProviderId,
  type EmbedTheme,
  type EmbedViewMode,
} from '@/utils/embedWhitelist';

export interface InteractiveDemoBlockData {
  title?: string;
  description?: string;
  url: string;
  height?: number;
  provider?: EmbedProviderId;
  page?: EmbedViewMode;
  theme?: EmbedTheme;
}

const props = defineProps<{ data: InteractiveDemoBlockData }>();

type EmbedState =
  | { state: 'ready'; src: string; height?: number }
  | { state: 'unsupported-domain'; host: string }
  | { state: 'invalid-protocol'; host: string }
  | { state: 'invalid-url' };

const embedState = computed<EmbedState>(() => {
  if (!props.data.url) {
    return { state: 'invalid-url' };
  }

  try {
    const parsed = new URL(props.data.url);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return { state: 'invalid-protocol', host: parsed.hostname };
    }

    const provider = resolveEmbedProvider(parsed);
    if (!provider) {
      return { state: 'unsupported-domain', host: parsed.hostname };
    }

    const page = normalizeEmbedPage(provider, props.data.page);
    const theme = normalizeEmbedTheme(provider, props.data.theme);
    const src = buildEmbedUrl(parsed, provider, { page, theme });
    const height = props.data.height ?? provider.defaultHeight;

    return {
      state: 'ready',
      src,
      height,
    };
  } catch (error) {
    console.warn('[InteractiveDemo] Invalid URL provided', error);
    return { state: 'invalid-url' };
  }
});

const safeUrl = computed(() => (embedState.value.state === 'ready' ? embedState.value.src : ''));

const frameStyle = computed(() => {
  if (embedState.value.state !== 'ready') {
    return {};
  }
  const height = embedState.value.height;
  if (!height || height <= 0) {
    return {};
  }
  return {
    minHeight: `${height}px`,
  } as const;
});

const warningMessage = computed(() => {
  switch (embedState.value.state) {
    case 'invalid-protocol':
      return `O protocolo utilizado por ${embedState.value.host} não é suportado.`;
    case 'unsupported-domain':
      return `O domínio ${embedState.value.host} não está na lista de provedores permitidos.`;
    case 'invalid-url':
    default:
      return 'Não foi possível carregar o recurso externo informado.';
  }
});
</script>

<style scoped>
.interactive-demo {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.interactive-demo__frame {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline);
}

.interactive-demo__frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>

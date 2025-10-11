<template>
  <article class="design-embed card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        Protótipo interativo
      </p>
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <div v-if="embedState.state === 'ready'" class="design-embed__controls">
      <span class="design-embed__chip">
        {{ embedState.provider.label }}
      </span>
      <span v-if="pageLabel" class="design-embed__chip"> Modo: {{ pageLabel }} </span>
      <span v-if="themeLabel" class="design-embed__chip"> Tema: {{ themeLabel }} </span>
    </div>

    <div v-if="embedState.state === 'ready'" class="design-embed__frame" :style="frameStyle">
      <iframe
        :src="embedState.src"
        :title="iframeTitle"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      ></iframe>
    </div>
    <p v-else class="design-embed__message text-body-small text-on-surface-variant">
      {{ warningMessage }}
    </p>

    <section v-if="resolvedHints.length" class="design-embed__hints">
      <h4 class="text-title-small font-semibold text-on-surface">Dicas de interação</h4>
      <ul class="design-embed__hint-list">
        <li v-for="hint in resolvedHints" :key="hint">{{ hint }}</li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  buildEmbedUrl,
  getEmbedProviderById,
  normalizeEmbedPage,
  normalizeEmbedTheme,
  resolveEmbedProvider,
  type EmbedProviderId,
  type EmbedProviderPreset,
  type EmbedTheme,
  type EmbedViewMode,
} from '@/utils/embedWhitelist';

const DESIGN_EMBED_PROVIDER_IDS = ['figma', 'miro', 'framer'] as const;
export type DesignEmbedProviderId = (typeof DESIGN_EMBED_PROVIDER_IDS)[number];

export interface DesignEmbedBlockData {
  title?: string;
  description?: string;
  url: string;
  provider?: DesignEmbedProviderId;
  page?: EmbedViewMode;
  theme?: EmbedTheme;
  height?: number;
  hints?: string[];
}

const props = defineProps<{ data: DesignEmbedBlockData }>();

type ReadyEmbedState = {
  state: 'ready';
  src: string;
  provider: EmbedProviderPreset & { id: DesignEmbedProviderId };
  page?: EmbedViewMode;
  theme?: EmbedTheme;
  height?: number;
};

type EmbedState =
  | ReadyEmbedState
  | { state: 'unsupported-domain'; host: string }
  | { state: 'unsupported-provider'; provider: string }
  | { state: 'invalid-protocol'; host: string }
  | { state: 'invalid-url' };

const pageLabels: Record<EmbedViewMode, string> = {
  embed: 'Incorporado',
  present: 'Apresentação',
  preview: 'Pré-visualização',
  view: 'Visualização',
  board: 'Quadro',
};

const themeLabels: Record<EmbedTheme, string> = {
  light: 'Claro',
  dark: 'Escuro',
  auto: 'Automático',
};

const defaultHints: Record<DesignEmbedProviderId, string[]> = {
  figma: [
    'Use o scroll para navegar entre as telas e setas para alternar frames.',
    'Clique duas vezes em um componente para inspecionar detalhes.',
  ],
  miro: [
    'Utilize o zoom (Ctrl/Cmd + scroll) para explorar o quadro.',
    'Arraste mantendo o botão direito para navegar rapidamente.',
  ],
  framer: [
    'Pressione “P” para ativar o modo de apresentação.',
    'Use as setas do teclado para avançar nas interações.',
  ],
};

const embedState = computed<EmbedState>(() => {
  const rawUrl = props.data.url?.trim();
  if (!rawUrl) {
    return { state: 'invalid-url' };
  }

  try {
    const parsed = new URL(rawUrl);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return { state: 'invalid-protocol', host: parsed.hostname };
    }

    const provider = resolveEmbedProvider(parsed);
    if (!provider) {
      return { state: 'unsupported-domain', host: parsed.hostname };
    }

    if (!isDesignEmbedProvider(provider.id)) {
      return { state: 'unsupported-provider', provider: provider.label };
    }

    const page = normalizeEmbedPage(provider, props.data.page);
    const theme = normalizeEmbedTheme(provider, props.data.theme);
    const src = buildEmbedUrl(parsed, provider, { page, theme });
    const height = props.data.height ?? provider.defaultHeight;

    return {
      state: 'ready',
      src,
      provider: provider as EmbedProviderPreset & { id: DesignEmbedProviderId },
      page,
      theme,
      height,
    } satisfies ReadyEmbedState;
  } catch (error) {
    console.warn('[DesignEmbed] Invalid URL provided', error);
    return { state: 'invalid-url' };
  }
});

const frameStyle = computed(() => {
  if (embedState.value.state !== 'ready') {
    return {};
  }
  const height = embedState.value.height;
  if (!height || height <= 0) {
    return {};
  }
  return { minHeight: `${height}px` } as const;
});

const pageLabel = computed(() => {
  if (embedState.value.state !== 'ready') {
    return '';
  }
  const page = embedState.value.page;
  return page ? (pageLabels[page] ?? page) : '';
});

const themeLabel = computed(() => {
  if (embedState.value.state !== 'ready') {
    return '';
  }
  const theme = embedState.value.theme;
  return theme ? (themeLabels[theme] ?? theme) : '';
});

const configuredProvider = computed(() => {
  const forced = props.data.provider;
  if (forced && isDesignEmbedProvider(forced)) {
    const match = getEmbedProviderById(forced as EmbedProviderId);
    if (match && isDesignEmbedProvider(match.id)) {
      return match;
    }
  }
  if (embedState.value.state === 'ready') {
    return embedState.value.provider;
  }
  return null;
});

const resolvedHints = computed(() => {
  const customHints = props.data.hints?.filter(
    (hint) => typeof hint === 'string' && hint.trim().length > 0
  );
  if (customHints && customHints.length > 0) {
    return customHints;
  }

  const provider = configuredProvider.value;
  if (!provider || !isDesignEmbedProvider(provider.id)) {
    return [];
  }

  return defaultHints[provider.id];
});

const iframeTitle = computed(() => props.data.title || 'Protótipo interativo');

const warningMessage = computed(() => {
  switch (embedState.value.state) {
    case 'invalid-protocol':
      return `O protocolo utilizado por ${embedState.value.host} não é suportado.`;
    case 'unsupported-domain':
      return `O domínio ${embedState.value.host} não está na lista de provedores permitidos.`;
    case 'unsupported-provider':
      return `${embedState.value.provider} não é suportado neste bloco.`;
    case 'invalid-url':
    default:
      return 'Não foi possível carregar o protótipo informado.';
  }
});

function isDesignEmbedProvider(id: EmbedProviderId | string): id is DesignEmbedProviderId {
  return DESIGN_EMBED_PROVIDER_IDS.includes(id as DesignEmbedProviderId);
}
</script>

<style scoped>
.design-embed {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.design-embed__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.design-embed__chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
}

.design-embed__frame {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-highest);
}

.design-embed__frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.design-embed__hints {
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface-container-high);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.design-embed__hint-list {
  list-style: disc;
  padding-left: 1.5rem;
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.design-embed__message {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container);
}
</style>

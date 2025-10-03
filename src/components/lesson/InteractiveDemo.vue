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
      Não foi possível carregar o recurso externo informado.
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface InteractiveDemoBlockData {
  title?: string;
  description?: string;
  url: string;
  height?: number;
}

const props = defineProps<{ data: InteractiveDemoBlockData }>();

const safeUrl = computed(() => {
  try {
    const parsed = new URL(props.data.url);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch (error) {
    console.warn('[InteractiveDemo] Invalid URL provided', error);
    return '';
  }
});

const frameStyle = computed(() => {
  if (!props.data.height) {
    return {};
  }
  return {
    minHeight: `${props.data.height}px`,
  } as const;
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

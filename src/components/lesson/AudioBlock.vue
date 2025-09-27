<template>
  <article class="md-audio-block card">
    <header class="md-audio-block__header">
      <span class="md-audio-block__icon" aria-hidden="true">
        <AudioLines class="md-icon md-icon--md" />
      </span>
      <div class="md-audio-block__titles">
        <p class="md-audio-block__supporting">Conteúdo em áudio</p>
        <h3 class="md-audio-block__title">{{ title }}</h3>
      </div>
    </header>
    <audio
      v-if="resolvedSrc"
      class="md-audio-block__player"
      controls
      :aria-label="`Reproduzir o áudio ${title}`"
    >
      <source :src="resolvedSrc" :type="mediaType" />
      O seu navegador não suporta o elemento de áudio.
    </audio>
    <p v-else class="md-audio-block__fallback">
      Não foi possível localizar o arquivo de áudio informado.
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AudioLines } from 'lucide-vue-next';

interface AudioBlockProps {
  title: string;
  src: string;
}

const props = defineProps<AudioBlockProps>();

const normalizedSource = computed(() => props.src?.trim() ?? '');

const resolvedSrc = computed(() => {
  const value = normalizedSource.value;
  if (!value) {
    return '';
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const path = value.startsWith('/') ? value.slice(1) : value;
  return `${base}/${path}`;
});

const mediaType = computed(() => {
  const value = normalizedSource.value.toLowerCase();
  if (value.endsWith('.wav')) return 'audio/wav';
  if (value.endsWith('.ogg')) return 'audio/ogg';
  if (value.endsWith('.m4a')) return 'audio/mp4';
  return 'audio/mpeg';
});
</script>

<style scoped>
.md-audio-block {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
  padding: clamp(1.5rem, 3vw, 2rem);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-high) 92%, transparent);
}

.md-audio-block__header {
  display: flex;
  align-items: center;
  gap: var(--md-sys-spacing-4);
}

.md-audio-block__icon {
  display: inline-grid;
  place-items: center;
  height: 3rem;
  width: 3rem;
  border-radius: 1rem;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent);
}

.md-audio-block__titles {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-1);
}

.md-audio-block__supporting {
  margin: 0;
  font-size: var(--md-sys-typescale-label-medium-size);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 80%, transparent);
  text-transform: uppercase;
}

.md-audio-block__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  font-weight: 600;
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  color: var(--md-sys-color-on-surface);
}

.md-audio-block__player {
  width: 100%;
  accent-color: var(--md-sys-color-primary);
  border-radius: 0.75rem;
  background: var(--md-sys-color-surface-container);
  padding: var(--md-sys-spacing-2);
}

.md-audio-block__fallback {
  margin: 0;
  color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 90%, transparent);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
</style>

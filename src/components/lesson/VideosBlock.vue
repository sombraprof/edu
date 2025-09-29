<template>
  <section class="lesson-videos">
    <header class="lesson-videos__header">
      <h3 class="lesson-videos__title">{{ data.title }}</h3>
    </header>

    <div v-if="videos.length" class="lesson-videos__grid">
      <article v-for="(video, index) in videos" :key="index" class="lesson-videos__item">
        <h4 class="lesson-videos__item-title">{{ video.title }}</h4>

        <div class="lesson-videos__frame">
          <iframe
            :src="video.src"
            class="lesson-videos__iframe"
            :title="`Vídeo: ${video.title}`"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>

        <p v-if="video.caption" class="lesson-videos__caption" v-html="video.caption"></p>
      </article>
    </div>

    <p v-else class="lesson-videos__empty">Nenhum vídeo disponível.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface VideoItem {
  title?: string;
  src?: string;
  url?: string;
  caption?: string;
}

interface VideosData {
  title: string;
  videos?: VideoItem[];
}

const props = defineProps<{
  data: VideosData;
}>();

const videos = computed(() => {
  if (!Array.isArray(props.data.videos)) {
    return [] as Array<{ title: string; src: string; caption: string }>;
  }

  return props.data.videos
    .map((video, index) => {
      const src = resolveVideoSrc(video);
      return {
        title: video.title?.trim().length ? video.title : `Vídeo ${index + 1}`,
        caption: sanitizeHtml(video.caption),
        src,
      };
    })
    .filter((video) => Boolean(video.src));
});

function resolveVideoSrc(video: VideoItem): string {
  if (typeof video.src === 'string' && video.src.trim().length) {
    return video.src;
  }

  if (typeof video.url === 'string' && video.url.trim().length) {
    return toEmbedUrl(video.url.trim());
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
.lesson-videos {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-videos__header {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.lesson-videos__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-videos__grid {
  display: grid;
  gap: var(--md-sys-spacing-4);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.lesson-videos__item {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-videos__item-title {
  font-size: var(--md-sys-typescale-title-large-size, 1.25rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-videos__frame {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  border-radius: var(--md-sys-border-radius-large);
  overflow: hidden;
  background: var(--md-sys-color-surface-variant);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-videos__iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.lesson-videos__caption {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.95rem);
}

.lesson-videos__empty {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
}

@media (max-width: 640px) {
  .lesson-videos {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

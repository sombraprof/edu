<template>
  <div class="card p-6 my-8">
    <h3 class="md-typescale-headline-small font-semibold text-on-surface mb-4">
      {{ data.title }}
    </h3>

    <div v-if="videos.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="(video, index) in videos" :key="index" class="card p-4 space-y-4">
        <h4 class="md-typescale-title-large font-semibold text-on-surface mb-2">
          {{ video.title }}
        </h4>
        <div
          class="aspect-video w-full overflow-hidden"
          :style="{ borderRadius: 'var(--md-sys-border-radius-large)' }"
        >
          <iframe
            class="w-full h-full"
            :src="video.src"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <p v-if="video.caption" class="md-typescale-body-medium text-on-surface-variant">
          {{ video.caption }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
    return [];
  }

  return props.data.videos
    .map((video) => {
      const src = resolveVideoSrc(video);
      return {
        title: video.title ?? 'Vídeo',
        caption: video.caption,
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

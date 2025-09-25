<template>
  <div class="card p-6 my-8">
    <h3 class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">
      {{ data.title }}
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="(video, index) in data.videos" :key="index" class="card p-4">
        <h4 class="text-title-large font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface VideoItem {
  title: string;
  src: string;
}

interface VideosData {
  title: string;
  videos: VideoItem[];
}

defineProps<{
  data: VideosData;
}>();
</script>

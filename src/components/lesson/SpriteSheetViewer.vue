<template>
  <section class="sprite-viewer">
    <header class="sprite-viewer__header">
      <h3 v-if="data.title" class="sprite-viewer__title">{{ data.title }}</h3>
      <p v-if="data.description" class="sprite-viewer__description">{{ data.description }}</p>
    </header>

    <div class="sprite-viewer__stage">
      <div
        class="sprite-viewer__frame"
        :style="frameStyle"
        role="img"
        :aria-label="ariaLabel"
      ></div>
      <p class="sprite-viewer__counter">{{ frame + 1 }} / {{ totalFrames }}</p>
    </div>

    <div class="sprite-viewer__actions">
      <button type="button" class="md-button md-button--outlined" @click="prev">Anterior</button>
      <button type="button" class="md-button md-button--tonal" @click="togglePlay">
        {{ playing ? 'Pausar' : 'Reproduzir' }}
      </button>
      <button type="button" class="md-button md-button--outlined" @click="next">Próximo</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

interface SpriteData {
  title?: string;
  description?: string;
  src: string;
  frameWidth: number;
  frameHeight: number;
  cols?: number;
  rows?: number;
  frameCount?: number;
  fps?: number;
}

const props = defineProps<{ data: SpriteData }>();

const cols = computed(() => props.data.cols || Math.max(1, Math.floor(props.data.frameCount || 1)));
const rows = computed(() => props.data.rows || 1);
const totalFrames = computed(() => props.data.frameCount || cols.value * rows.value);

const frame = ref(0);
const playing = ref(false);
let timer: number | undefined;

const frameStyle = computed(() => {
  const fw = props.data.frameWidth;
  const fh = props.data.frameHeight;
  const c = Math.max(1, cols.value);
  const index = frame.value % totalFrames.value;
  const cx = index % c;
  const cy = Math.floor(index / c);
  const posX = -cx * fw;
  const posY = -cy * fh;
  return {
    width: `${fw}px`,
    height: `${fh}px`,
    backgroundImage: `url(${props.data.src})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${posX}px ${posY}px`,
  } as Record<string, string>;
});

const ariaLabel = computed(() => `Quadro ${frame.value + 1} de ${totalFrames.value}`);

function next() {
  frame.value = (frame.value + 1) % totalFrames.value;
}
function prev() {
  frame.value = (frame.value - 1 + totalFrames.value) % totalFrames.value;
}

function togglePlay() {
  playing.value = !playing.value;
  setupTimer();
}

function setupTimer() {
  if (typeof window === 'undefined') return;
  if (timer) {
    window.clearInterval(timer);
    timer = undefined;
  }
  if (playing.value) {
    const fps = Math.max(1, props.data.fps || 8);
    timer = window.setInterval(() => {
      next();
    }, 1000 / fps);
  }
}

onMounted(setupTimer);
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<style scoped>
.sprite-viewer {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}
.sprite-viewer__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
}
.sprite-viewer__description {
  color: var(--md-sys-color-on-surface-variant);
}

.sprite-viewer__stage {
  display: grid;
  justify-items: center;
  gap: var(--md-sys-spacing-2);
}
.sprite-viewer__frame {
  image-rendering: pixelated;
  box-shadow: var(--md-sys-elevation-level1);
  background-color: var(--md-sys-color-surface);
}
.sprite-viewer__counter {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.sprite-viewer__actions {
  display: flex;
  gap: var(--md-sys-spacing-2);
  justify-content: center;
}

@media (max-width: 640px) {
  .sprite-viewer {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

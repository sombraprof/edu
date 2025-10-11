<template>
  <section class="whiteboard-block">
    <header v-if="block.title || block.description" class="whiteboard-block__header">
      <h3 v-if="block.title" class="whiteboard-block__title">{{ block.title }}</h3>
      <p v-if="block.description" class="whiteboard-block__description">{{ block.description }}</p>
    </header>

    <div ref="stageEl" class="whiteboard-block__stage">
      <div
        v-if="showCanvas"
        class="whiteboard-block__canvas-wrapper"
        :style="canvasWrapperStyle"
        role="img"
        :aria-label="canvasAriaLabel"
      >
        <canvas ref="canvasEl" class="whiteboard-block__canvas"></canvas>
        <p v-if="canvasStatusMessage" class="whiteboard-block__status">{{ canvasStatusMessage }}</p>
      </div>

      <figure v-else-if="activeImage" class="whiteboard-block__image">
        <img
          :src="activeImage.src"
          :alt="activeImage.alt || block.title || 'Quadro colaborativo'"
          :width="activeImage.width"
          :height="activeImage.height"
        />
        <figcaption v-if="activeSnapshot?.description" class="whiteboard-block__caption">
          {{ activeSnapshot.description }}
        </figcaption>
      </figure>

      <p v-else class="whiteboard-block__status">Nenhum snapshot disponível.</p>
    </div>

    <div
      v-if="hasSnapshots"
      class="whiteboard-block__controls"
      role="group"
      aria-label="Controles do replay do quadro"
    >
      <button
        type="button"
        class="md-button md-button--outlined"
        @click="prevSnapshot"
        :disabled="loadingSnapshot || normalizedSnapshots.length <= 1"
      >
        Anterior
      </button>
      <button
        type="button"
        class="md-button md-button--tonal"
        @click="togglePlayback"
        :disabled="normalizedSnapshots.length <= 1"
      >
        {{ isPlaying ? 'Pausar' : 'Reproduzir' }}
      </button>
      <button
        type="button"
        class="md-button md-button--outlined"
        @click="nextSnapshot"
        :disabled="loadingSnapshot || normalizedSnapshots.length <= 1"
      >
        Próximo
      </button>
    </div>

    <div v-if="hasSnapshots" class="whiteboard-block__timeline">
      <label class="whiteboard-block__slider-label" :for="sliderId">
        Etapa {{ currentSnapshotIndex + 1 }} de {{ normalizedSnapshots.length }} —
        {{ currentSnapshotLabel }}
      </label>
      <input
        :id="sliderId"
        v-model.number="currentSnapshotIndex"
        class="whiteboard-block__slider"
        type="range"
        min="0"
        :max="Math.max(0, normalizedSnapshots.length - 1)"
        :disabled="loadingSnapshot || normalizedSnapshots.length <= 1"
        aria-valuemin="1"
        :aria-valuemax="normalizedSnapshots.length"
        :aria-valuenow="currentSnapshotIndex + 1"
      />

      <ul class="whiteboard-block__snapshot-list">
        <li
          v-for="(snapshot, index) in normalizedSnapshots"
          :key="snapshot.id"
          :class="[
            'whiteboard-block__snapshot',
            { 'whiteboard-block__snapshot--active': index === currentSnapshotIndex },
          ]"
        >
          <div class="whiteboard-block__snapshot-header">
            <span class="whiteboard-block__snapshot-index">{{ index + 1 }}</span>
            <span class="whiteboard-block__snapshot-title">{{ snapshot.label }}</span>
          </div>
          <p v-if="snapshot.description" class="whiteboard-block__snapshot-description">
            {{ snapshot.description }}
          </p>
          <button
            v-if="snapshot.state || snapshot.commands?.length"
            type="button"
            class="whiteboard-block__snapshot-export"
            @click="copySnapshot(snapshot)"
          >
            Copiar snapshot
          </button>
        </li>
      </ul>
    </div>

    <div v-if="block.allowOfflineEdit && canEdit" class="whiteboard-block__editor">
      <h4 class="whiteboard-block__editor-title">Modo offline</h4>
      <p class="whiteboard-block__editor-description">
        Desenhe livremente; as mudanças ficam apenas no seu navegador.
      </p>
      <div class="whiteboard-block__editor-toolbar">
        <label class="whiteboard-block__editor-field">
          <span>Cor do traço</span>
          <input type="color" v-model="brushColor" :disabled="!isEditing" />
        </label>
        <label class="whiteboard-block__editor-field">
          <span>Espessura</span>
          <input type="range" min="1" max="64" v-model.number="brushWidth" :disabled="!isEditing" />
        </label>
        <button type="button" class="md-button md-button--outlined" @click="toggleEditing">
          {{ isEditing ? 'Finalizar edição' : 'Entrar em edição' }}
        </button>
        <button
          type="button"
          class="md-button md-button--text"
          @click="clearCanvas"
          :disabled="!fabricReady"
        >
          Limpar quadro
        </button>
        <button
          type="button"
          class="md-button md-button--text"
          @click="exportCurrentSnapshot"
          :disabled="!fabricReady"
        >
          Exportar JSON
        </button>
      </div>
      <textarea
        v-if="lastExport"
        class="whiteboard-block__export-preview"
        readonly
        :value="lastExport"
        aria-label="Último snapshot exportado"
      ></textarea>
      <p v-if="exportStatus" class="whiteboard-block__export-status">{{ exportStatus }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';

interface WhiteboardImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface WhiteboardCommand {
  type: string;
  state?: unknown;
  delayMs?: number;
}

interface WhiteboardSnapshot {
  id?: string;
  label?: string;
  description?: string;
  durationMs?: number;
  state?: unknown;
  json?: unknown;
  snapshot?: unknown;
  fabric?: unknown;
  commands?: WhiteboardCommand[];
  image?: WhiteboardImage;
}

interface WhiteboardPlayback {
  autoplay?: boolean;
  delayMs?: number;
  loop?: boolean;
}

interface WhiteboardBlockData {
  title?: string;
  description?: string;
  height?: number;
  backgroundColor?: string;
  allowOfflineEdit?: boolean;
  image?: WhiteboardImage;
  playback?: WhiteboardPlayback;
  snapshots?: WhiteboardSnapshot[];
}

interface FabricCanvas {
  dispose(): void;
  loadFromJSON(json: unknown, callback?: () => void): void;
  renderAll(): void;
  clear(): void;
  setWidth(width: number): void;
  setHeight(height: number): void;
  setBackgroundColor(color: string, callback?: () => void): void;
  toJSON(properties?: string[]): unknown;
  isDrawingMode: boolean;
  freeDrawingBrush?: { color: string; width: number };
}

interface FabricModule {
  Canvas: new (element: HTMLCanvasElement, options?: Record<string, unknown>) => FabricCanvas;
}

const props = defineProps<{ data: WhiteboardBlockData }>();
const block = computed(() => props.data);

interface NormalizedSnapshot {
  id: string;
  label: string;
  description?: string;
  durationMs: number;
  state?: unknown;
  commands?: WhiteboardCommand[];
  image?: WhiteboardImage;
}

const stageEl = ref<HTMLElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
const sliderId = `whiteboard-slider-${Math.random().toString(36).slice(2)}`;

const defaultDuration = computed(() => Math.max(600, block.value.playback?.delayMs ?? 2400));

const normalizedSnapshots = computed<NormalizedSnapshot[]>(() => {
  const snapshots = Array.isArray(block.value.snapshots) ? block.value.snapshots : [];
  return snapshots
    .map((snapshot, index) => {
      const state = snapshot.state ?? snapshot.json ?? snapshot.snapshot ?? snapshot.fabric;
      const commands = Array.isArray(snapshot.commands)
        ? snapshot.commands.filter((command) => command && typeof command.type === 'string')
        : undefined;
      const image = normalizeImage(snapshot.image);
      if (!state && !image && !commands?.length) {
        return null;
      }
      return {
        id:
          typeof snapshot.id === 'string' && snapshot.id.trim().length > 0
            ? snapshot.id
            : `snapshot-${index + 1}`,
        label:
          typeof snapshot.label === 'string' && snapshot.label.trim().length > 0
            ? snapshot.label
            : `Snapshot ${index + 1}`,
        description: typeof snapshot.description === 'string' ? snapshot.description : undefined,
        durationMs:
          typeof snapshot.durationMs === 'number' && snapshot.durationMs > 0
            ? snapshot.durationMs
            : defaultDuration.value,
        state,
        commands,
        image,
      } satisfies NormalizedSnapshot;
    })
    .filter((snapshot): snapshot is NormalizedSnapshot => Boolean(snapshot));
});

const hasSnapshots = computed(() => normalizedSnapshots.value.length > 0);
const hasCanvasSnapshots = computed(() =>
  normalizedSnapshots.value.some((snapshot) => snapshot.state || snapshot.commands)
);

const activeSnapshot = computed(() => normalizedSnapshots.value[currentSnapshotIndex.value]);
const activeImage = computed<WhiteboardImage | undefined>(() => {
  if (hasCanvasSnapshots.value) {
    return activeSnapshot.value?.image || normalizeImage(block.value.image);
  }
  return activeSnapshot.value?.image || normalizeImage(block.value.image);
});

const currentSnapshotLabel = computed(() => activeSnapshot.value?.label ?? 'Sem rótulo');

const currentSnapshotIndex = ref(0);
const isPlaying = ref(Boolean(block.value.playback?.autoplay));
const loadingSnapshot = ref(false);
const exportStatus = ref('');
const lastExport = ref('');

const showCanvas = computed(() => hasCanvasSnapshots.value);
const canvasStatusMessage = computed(() => {
  if (loadError.value) {
    return loadError.value;
  }
  if (loadingSnapshot.value) {
    return 'Carregando etapa…';
  }
  if (showCanvas.value && !fabricReady.value) {
    return 'Inicializando quadro…';
  }
  return '';
});

const canvasAriaLabel = computed(() => {
  const title = block.value.title ? `Quadro "${block.value.title}"` : 'Quadro colaborativo';
  return `${title}. ${currentSnapshotLabel.value}`;
});

const brushColor = ref('#0b57d0');
const brushWidth = ref(8);
const isEditing = ref(false);
const fabricReady = ref(false);
const isFabricLoading = ref(false);
const loadError = ref('');

const canvasHeight = ref(Math.max(320, block.value.height ?? 480));
const canvasWrapperStyle = computed(() => ({ height: `${canvasHeight.value}px` }));

let resizeObserver: ResizeObserver | null = null;
let playbackTimer: number | undefined;
const fabricCanvas = shallowRef<FabricCanvas | null>(null);
let loadQueue: Promise<void> = Promise.resolve();

const canEdit = computed(() => typeof window !== 'undefined');

function normalizeImage(image: WhiteboardImage | undefined): WhiteboardImage | undefined {
  if (!image || typeof image !== 'object') return undefined;
  if (typeof image.src !== 'string' || image.src.trim().length === 0) {
    return undefined;
  }
  return {
    src: image.src,
    alt: typeof image.alt === 'string' ? image.alt : undefined,
    width: typeof image.width === 'number' ? image.width : undefined,
    height: typeof image.height === 'number' ? image.height : undefined,
  } satisfies WhiteboardImage;
}

function stopPlayback() {
  isPlaying.value = false;
  if (playbackTimer) {
    window.clearTimeout(playbackTimer);
    playbackTimer = undefined;
  }
}

function schedulePlayback() {
  if (typeof window === 'undefined') return;
  if (playbackTimer) {
    window.clearTimeout(playbackTimer);
    playbackTimer = undefined;
  }
  if (!isPlaying.value || normalizedSnapshots.value.length <= 1) {
    return;
  }
  const snapshot = activeSnapshot.value;
  const delay = Math.max(400, snapshot?.durationMs ?? defaultDuration.value);
  playbackTimer = window.setTimeout(() => {
    nextSnapshot();
  }, delay);
}

async function ensureFabric() {
  if (fabricCanvas.value || isFabricLoading.value || typeof window === 'undefined') {
    return fabricCanvas.value;
  }
  if (!canvasEl.value) return null;
  if (!hasCanvasSnapshots.value) return null;
  try {
    isFabricLoading.value = true;
    const module = (await import('fabric')) as FabricModule & { fabric?: FabricModule };
    const FabricCanvasCtor =
      typeof module.Canvas === 'function'
        ? module.Canvas
        : module.fabric && typeof module.fabric.Canvas === 'function'
          ? module.fabric.Canvas
          : undefined;
    if (typeof FabricCanvasCtor !== 'function') {
      throw new Error('Não foi possível carregar a biblioteca do quadro.');
    }
    const canvas = new FabricCanvasCtor(canvasEl.value, {
      backgroundColor: block.value.backgroundColor ?? '#ffffff',
      selection: false,
    });
    fabricCanvas.value = canvas;
    fabricReady.value = true;
    updateCanvasDimensions();
    applyBrushSettings();
    return canvas;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Falha ao carregar o quadro.';
    return null;
  } finally {
    isFabricLoading.value = false;
  }
}

function updateCanvasDimensions() {
  const canvas = fabricCanvas.value;
  if (!canvas || !canvasEl.value) return;
  const element = stageEl.value;
  const width = element ? element.clientWidth : canvasEl.value.clientWidth;
  if (width > 0) {
    canvas.setWidth(width);
  }
  canvas.setHeight(canvasHeight.value);
  if (block.value.backgroundColor) {
    canvas.setBackgroundColor(block.value.backgroundColor, () => canvas.renderAll());
  } else {
    canvas.renderAll();
  }
}

function queueSnapshotLoad(snapshot?: NormalizedSnapshot) {
  if (!snapshot || !hasCanvasSnapshots.value) return;
  loadQueue = loadQueue.then(async () => {
    const canvas = await ensureFabric();
    if (!canvas) return;
    loadingSnapshot.value = true;
    loadError.value = '';
    try {
      await applySnapshot(canvas, snapshot);
    } finally {
      loadingSnapshot.value = false;
    }
  });
}

function applySnapshot(canvas: FabricCanvas, snapshot: NormalizedSnapshot) {
  const applyState = (state: unknown) =>
    new Promise<void>((resolve, reject) => {
      try {
        canvas.loadFromJSON(state ?? { objects: [] }, () => {
          if (block.value.backgroundColor) {
            canvas.setBackgroundColor(block.value.backgroundColor, () => canvas.renderAll());
          } else {
            canvas.renderAll();
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });

  const runCommands = async () => {
    if (!snapshot.commands || snapshot.commands.length === 0) {
      if (snapshot.state) {
        await applyState(snapshot.state);
      }
      return;
    }
    for (const command of snapshot.commands) {
      const delay =
        typeof command.delayMs === 'number' && command.delayMs > 0 ? command.delayMs : 0;
      if (command.state) {
        await applyState(command.state);
      }
      if (delay > 0 && typeof window !== 'undefined') {
        await new Promise<void>((resolve) => window.setTimeout(resolve, delay));
      }
    }
  };

  return runCommands().catch((error) => {
    loadError.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o snapshot.';
  });
}

function nextSnapshot() {
  const total = normalizedSnapshots.value.length;
  if (total === 0) return;
  const nextIndex = currentSnapshotIndex.value + 1;
  if (nextIndex >= total) {
    if (block.value.playback?.loop) {
      currentSnapshotIndex.value = 0;
    } else {
      stopPlayback();
      return;
    }
  } else {
    currentSnapshotIndex.value = nextIndex;
  }
}

function prevSnapshot() {
  const total = normalizedSnapshots.value.length;
  if (total === 0) return;
  if (currentSnapshotIndex.value === 0) {
    currentSnapshotIndex.value = total - 1;
  } else {
    currentSnapshotIndex.value -= 1;
  }
}

function togglePlayback() {
  if (isPlaying.value) {
    stopPlayback();
  } else {
    isPlaying.value = true;
    schedulePlayback();
  }
}

function toggleEditing() {
  isEditing.value = !isEditing.value;
  applyBrushSettings();
}

function applyBrushSettings() {
  const canvas = fabricCanvas.value;
  if (!canvas) return;
  canvas.isDrawingMode = isEditing.value;
  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = brushColor.value;
    canvas.freeDrawingBrush.width = brushWidth.value;
  }
}

function clearCanvas() {
  const canvas = fabricCanvas.value;
  if (!canvas) return;
  canvas.clear();
  if (block.value.backgroundColor) {
    canvas.setBackgroundColor(block.value.backgroundColor, () => canvas.renderAll());
  } else {
    canvas.renderAll();
  }
}

async function exportCurrentSnapshot() {
  const canvas = fabricCanvas.value;
  if (!canvas) return;
  const payload = JSON.stringify(canvas.toJSON(), null, 2);
  lastExport.value = payload;
  exportStatus.value = '';
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload);
      exportStatus.value = 'Snapshot copiado para a área de transferência.';
      return;
    } catch (error) {
      exportStatus.value =
        error instanceof Error
          ? error.message
          : 'Não foi possível copiar automaticamente. Copie manualmente.';
    }
  }
  if (!exportStatus.value) {
    exportStatus.value = 'Copie manualmente o JSON abaixo.';
  }
}

async function copySnapshot(snapshot: NormalizedSnapshot) {
  const payloadSource = snapshot.state ?? snapshot.commands ?? null;
  if (!payloadSource) return;
  const payload = JSON.stringify(payloadSource, null, 2);
  lastExport.value = payload;
  exportStatus.value = '';
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload);
      exportStatus.value = 'Snapshot copiado para a área de transferência.';
      return;
    } catch (error) {
      exportStatus.value =
        error instanceof Error
          ? error.message
          : 'Não foi possível copiar automaticamente. Copie manualmente.';
    }
  }
  if (!exportStatus.value) {
    exportStatus.value = 'Copie manualmente o JSON abaixo.';
  }
}

watch(
  () => block.value.height,
  (height) => {
    const parsed = typeof height === 'number' && height > 0 ? height : 0;
    if (parsed > 0) {
      canvasHeight.value = Math.max(320, parsed);
      nextTick(() => updateCanvasDimensions());
    }
  }
);

watch(hasCanvasSnapshots, (shouldInit) => {
  if (!shouldInit) {
    stopPlayback();
  }
  nextTick(() => {
    if (shouldInit) {
      void ensureFabric().then(() => queueSnapshotLoad(activeSnapshot.value));
    }
  });
});

watch(normalizedSnapshots, (snapshots) => {
  if (snapshots.length === 0) {
    currentSnapshotIndex.value = 0;
    stopPlayback();
    return;
  }
  if (currentSnapshotIndex.value >= snapshots.length) {
    currentSnapshotIndex.value = snapshots.length - 1;
  }
  queueSnapshotLoad(activeSnapshot.value);
});

watch(currentSnapshotIndex, () => {
  exportStatus.value = '';
  queueSnapshotLoad(activeSnapshot.value);
  schedulePlayback();
});

watch(isPlaying, () => {
  schedulePlayback();
});

watch([brushColor, brushWidth, isEditing], applyBrushSettings);

onMounted(() => {
  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    if (stageEl.value) {
      resizeObserver.observe(stageEl.value);
    }
  }
  if (hasCanvasSnapshots.value) {
    void ensureFabric().then(() => queueSnapshotLoad(activeSnapshot.value));
  }
});

onBeforeUnmount(() => {
  stopPlayback();
  if (resizeObserver && stageEl.value) {
    resizeObserver.unobserve(stageEl.value);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  fabricCanvas.value?.dispose();
  fabricCanvas.value = null;
});
</script>

<style scoped>
.whiteboard-block {
  background-color: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  box-shadow: var(--md-sys-elevation-level1);
  display: grid;
  gap: var(--md-sys-spacing-5);
}

.whiteboard-block__header {
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.whiteboard-block__title {
  margin: 0;
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
}

.whiteboard-block__description {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.whiteboard-block__stage {
  position: relative;
}

.whiteboard-block__canvas-wrapper {
  position: relative;
  border-radius: var(--md-sys-border-radius-medium);
  overflow: hidden;
  background: var(--md-sys-color-surface);
  display: grid;
  place-items: center;
}

.whiteboard-block__canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.whiteboard-block__image {
  margin: 0;
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.whiteboard-block__image img {
  width: 100%;
  border-radius: var(--md-sys-border-radius-medium);
  box-shadow: var(--md-sys-elevation-level1);
}

.whiteboard-block__caption {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
}

.whiteboard-block__status {
  position: absolute;
  inset: auto 0 0 0;
  margin: 0;
  text-align: center;
  padding: var(--md-sys-spacing-2);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
  color: var(--md-sys-color-on-inverse-surface);
  font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
}

.whiteboard-block__controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
  justify-content: center;
}

.whiteboard-block__timeline {
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.whiteboard-block__slider-label {
  font-weight: 600;
}

.whiteboard-block__slider {
  width: 100%;
}

.whiteboard-block__snapshot-list {
  display: grid;
  gap: var(--md-sys-spacing-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.whiteboard-block__snapshot {
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-border-radius-medium);
  padding: var(--md-sys-spacing-3);
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.whiteboard-block__snapshot--active {
  border-color: var(--md-sys-color-primary);
  background: color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent);
}

.whiteboard-block__snapshot-header {
  display: flex;
  gap: var(--md-sys-spacing-2);
  align-items: center;
  font-weight: 600;
}

.whiteboard-block__snapshot-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font-size: 0.875rem;
}

.whiteboard-block__snapshot-title {
  flex: 1;
}

.whiteboard-block__snapshot-description {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.whiteboard-block__snapshot-export {
  justify-self: start;
  border: none;
  background: none;
  padding: 0;
  color: var(--md-sys-color-primary);
  font-weight: 600;
  cursor: pointer;
}

.whiteboard-block__editor {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.whiteboard-block__editor-title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
}

.whiteboard-block__editor-description {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.whiteboard-block__editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
  align-items: center;
}

.whiteboard-block__editor-field {
  display: grid;
  gap: var(--md-sys-spacing-1);
  font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
}

.whiteboard-block__export-preview {
  width: 100%;
  min-height: 160px;
  resize: vertical;
  padding: var(--md-sys-spacing-2);
  border-radius: var(--md-sys-border-radius-small);
  border: 1px solid var(--md-sys-color-outline);
  font-family: var(--md-sys-typescale-code-font, 'JetBrains Mono', monospace);
  font-size: 0.875rem;
}

.whiteboard-block__export-status {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

@media (max-width: 600px) {
  .whiteboard-block {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

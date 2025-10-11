<template>
  <section class="video-annotation">
    <header v-if="data.title || description" class="video-annotation__header">
      <h3 v-if="data.title" class="video-annotation__title">{{ data.title }}</h3>
      <p v-if="description" class="video-annotation__description" v-html="description"></p>
    </header>

    <div class="video-annotation__layout">
      <div class="video-annotation__player" :class="{ 'video-annotation__player--html5': isHtml5 }">
        <template v-if="isHtml5">
          <video
            ref="html5Video"
            class="video-annotation__html5"
            controls
            preload="metadata"
            :poster="data.video.poster"
            @timeupdate="onTimeUpdate"
            @seeked="onSeek"
          >
            <source
              v-if="data.video.src"
              :src="data.video.src"
              :type="data.video.type || 'video/mp4'"
            />
            <track
              v-for="(track, index) in captionTracks"
              :key="`caption-${index}`"
              kind="subtitles"
              :src="track.src"
              :srclang="track.srclang"
              :label="track.label"
              :default="track.default || false"
            />
            Seu navegador não suporta o elemento de vídeo.
          </video>
        </template>
        <iframe
          v-else
          class="video-annotation__embed"
          :src="embedUrl"
          title="Player de vídeo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>

      <aside class="video-annotation__timeline" aria-label="Linha do tempo de anotações">
        <ul>
          <li
            v-for="item in timelineItems"
            :key="item.id"
            :class="{
              'timeline-item': true,
              'timeline-item--active': isActiveItem(item),
              'timeline-item--checkpoint': item.kind === 'checkpoint',
              'timeline-item--completed': reachedCheckpoints.has(item.id),
            }"
            :data-test="`timeline-${item.kind}-${item.id}`"
          >
            <button type="button" class="timeline-item__button" @click="navigateTo(item)">
              <span class="timeline-item__time">{{ formatTimestamp(item.time) }}</span>
              <span class="timeline-item__label">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </aside>
    </div>

    <section
      v-if="activeAnnotation || activeCheckpoint"
      class="video-annotation__annotation"
      aria-live="polite"
    >
      <header class="video-annotation__annotation-header">
        <h4 class="video-annotation__annotation-title">
          {{ activeAnnotation?.label || activeCheckpoint?.label }}
        </h4>
        <span class="video-annotation__timestamp">{{
          formatTimestamp(activeAnnotation?.time || activeCheckpoint?.time || 0)
        }}</span>
      </header>

      <div
        v-if="activeAnnotation && activeAnnotation.type === 'note'"
        class="video-annotation__note"
        v-html="activeAnnotation.body"
      ></div>

      <div
        v-else-if="activeAnnotation && activeAnnotation.type === 'question'"
        class="video-annotation__question"
      >
        <p class="video-annotation__question-prompt">{{ activeAnnotation.question?.prompt }}</p>

        <ul class="video-annotation__question-options">
          <li v-for="option in activeAnnotation.question?.options || []" :key="option.id">
            <label class="video-annotation__option">
              <input
                :type="activeAnnotation.question?.multiple ? 'checkbox' : 'radio'"
                :name="`question-${activeAnnotation.id}`"
                :value="option.id"
                :checked="isOptionSelected(activeAnnotation.id, option.id)"
                @change="onAnswer(activeAnnotation, option.id)"
              />
              <span>{{ option.text }}</span>
            </label>
          </li>
        </ul>

        <button
          v-if="activeAnnotation.question?.multiple"
          type="button"
          class="video-annotation__submit"
          @click="submitAnswer(activeAnnotation.id)"
        >
          Enviar resposta
        </button>

        <p
          v-if="answerState(activeAnnotation.id).submitted"
          class="video-annotation__feedback"
          :class="{
            'video-annotation__feedback--correct': isAnswerCorrect(activeAnnotation.id),
            'video-annotation__feedback--incorrect': !isAnswerCorrect(activeAnnotation.id),
          }"
        >
          {{ isAnswerCorrect(activeAnnotation.id) ? 'Resposta correta!' : 'Tente novamente.' }}
        </p>

        <p
          v-if="
            answerState(activeAnnotation.id).submitted && activeAnnotation.question?.explanation
          "
          class="video-annotation__explanation"
        >
          {{ activeAnnotation.question?.explanation }}
        </p>
      </div>

      <div v-else-if="activeCheckpoint" class="video-annotation__checkpoint">
        <p v-if="activeCheckpoint.description" v-html="activeCheckpoint.description"></p>
        <p v-else>Checkpoint alcançado! Registre o progresso dos estudantes antes de seguir.</p>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, shallowRef, watch } from 'vue';
import { createVideoSync, formatTimestamp } from '@/utils/videoSync';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface CaptionTrack {
  src: string;
  label?: string;
  srclang?: string;
  default?: boolean;
}

interface TimelineItem {
  id: string;
  label: string;
  time: number;
  kind: 'annotation' | 'checkpoint';
}

interface QuestionOption {
  id: string;
  text: string;
  correct?: boolean;
}

interface AnnotationQuestion {
  prompt: string;
  explanation?: string;
  multiple?: boolean;
  options: QuestionOption[];
}

interface AnnotationItem {
  id: string;
  label: string;
  time: number;
  type: 'note' | 'question';
  body?: string;
  question?: AnnotationQuestion;
}

interface CheckpointItem {
  id: string;
  label: string;
  time: number;
  description?: string;
}

interface VideoAnnotationData {
  title?: string;
  description?: string;
  video: {
    provider: 'youtube' | 'vimeo' | 'html5';
    url?: string;
    videoId?: string;
    src?: string;
    type?: string;
    poster?: string;
    captions?: CaptionTrack[];
  };
  annotations?: Array<{
    id?: string;
    label: string;
    time: number;
    type?: 'note' | 'question';
    body?: string;
    question?: AnnotationQuestion;
  }>;
  checkpoints?: Array<{
    id?: string;
    label: string;
    time: number;
    description?: string;
  }>;
}

const props = defineProps<{ data: VideoAnnotationData }>();

const html5Video = ref<HTMLVideoElement | null>(null);
const currentTime = ref(0);
const activeAnnotationId = ref<string | null>(null);
const activeCheckpointId = ref<string | null>(null);
const reachedCheckpoints = reactive(new Set<string>());
const embedStartAt = ref(0);
const responses = reactive<Record<string, { selected: string[]; submitted: boolean }>>({});
const syncController = shallowRef(createVideoSync([]));

const description = computed(() => sanitizeHtml(props.data.description));

const isHtml5 = computed(() => props.data.video.provider === 'html5');

const captionTracks = computed(() => {
  if (!Array.isArray(props.data.video.captions)) {
    return [] as CaptionTrack[];
  }
  return props.data.video.captions.filter((track): track is CaptionTrack => Boolean(track?.src));
});

const annotations = computed<AnnotationItem[]>(() => {
  if (!Array.isArray(props.data.annotations)) {
    return [];
  }

  return props.data.annotations
    .filter((item) => typeof item.time === 'number' && item.time >= 0)
    .map((item, index) => ({
      id: item.id ?? `annotation-${index + 1}`,
      label: item.label,
      time: item.time,
      type:
        item.type === 'question' && item.question
          ? ('question' as AnnotationItem['type'])
          : ('note' as AnnotationItem['type']),
      body: item.body ? sanitizeHtml(item.body) : undefined,
      question: item.question,
    }))
    .sort((a, b) => a.time - b.time);
});

const checkpoints = computed<CheckpointItem[]>(() => {
  if (!Array.isArray(props.data.checkpoints)) {
    return [];
  }

  return props.data.checkpoints
    .filter((item) => typeof item.time === 'number' && item.time >= 0)
    .map((item, index) => ({
      id: item.id ?? `checkpoint-${index + 1}`,
      label: item.label,
      time: item.time,
      description: item.description ? sanitizeHtml(item.description) : undefined,
    }))
    .sort((a, b) => a.time - b.time);
});

const timelineItems = computed<TimelineItem[]>(() => {
  return [
    ...annotations.value.map((annotation) => ({
      id: annotation.id,
      label: annotation.label,
      time: annotation.time,
      kind: 'annotation' as const,
    })),
    ...checkpoints.value.map((checkpoint) => ({
      id: checkpoint.id,
      label: checkpoint.label,
      time: checkpoint.time,
      kind: 'checkpoint' as const,
    })),
  ].sort((a, b) => a.time - b.time);
});

const activeAnnotation = computed(() => {
  if (!activeAnnotationId.value) {
    return null;
  }
  return annotations.value.find((annotation) => annotation.id === activeAnnotationId.value) ?? null;
});

const activeCheckpoint = computed(() => {
  if (!activeCheckpointId.value) {
    return null;
  }
  return checkpoints.value.find((checkpoint) => checkpoint.id === activeCheckpointId.value) ?? null;
});

const embedUrl = computed(() => {
  if (isHtml5.value) {
    return '';
  }

  const base = resolveEmbedUrl(props.data.video);
  if (!base) {
    return '';
  }

  if (!embedStartAt.value) {
    return base;
  }

  return withStartAt(base, embedStartAt.value, props.data.video.provider);
});

watch(
  () => [annotations.value, checkpoints.value],
  () => {
    syncController.value = createVideoSync(
      [
        ...annotations.value.map((annotation) => ({
          id: annotation.id,
          time: annotation.time,
          onTrigger: () => {
            activeCheckpointId.value = null;
            activeAnnotationId.value = annotation.id;
            if (annotation.type === 'question') {
              ensureResponse(annotation.id);
            }
          },
        })),
        ...checkpoints.value.map((checkpoint) => ({
          id: checkpoint.id,
          time: checkpoint.time,
          onTrigger: () => {
            activeAnnotationId.value = null;
            activeCheckpointId.value = checkpoint.id;
            reachedCheckpoints.add(checkpoint.id);
          },
        })),
      ],
      { retriggerOnSeek: true }
    );
    syncController.value.update(currentTime.value);
  },
  { immediate: true }
);

function onTimeUpdate(event: Event) {
  const target = event.target as HTMLVideoElement | null;
  currentTime.value = target?.currentTime ?? 0;
  syncController.value.update(currentTime.value);
}

function onSeek(event: Event) {
  const target = event.target as HTMLVideoElement | null;
  const time = target?.currentTime ?? 0;
  currentTime.value = time;
  syncController.value.seek(time);
  syncController.value.update(time);
}

function navigateTo(item: TimelineItem) {
  if (item.kind === 'annotation') {
    activeAnnotationId.value = item.id;
    activeCheckpointId.value = null;
  } else {
    activeCheckpointId.value = item.id;
    activeAnnotationId.value = null;
    reachedCheckpoints.add(item.id);
  }

  embedStartAt.value = Math.floor(item.time);

  currentTime.value = item.time;
  syncController.value.seek(item.time);
  syncController.value.update(item.time);

  if (isHtml5.value && html5Video.value) {
    html5Video.value.currentTime = item.time;
    html5Video.value.focus();
  }
}

function isActiveItem(item: TimelineItem) {
  if (item.kind === 'annotation' && activeAnnotationId.value === item.id) {
    return true;
  }

  if (item.kind === 'checkpoint' && activeCheckpointId.value === item.id) {
    return true;
  }

  return reachedCheckpoints.has(item.id);
}

function ensureResponse(annotationId: string) {
  if (!responses[annotationId]) {
    responses[annotationId] = { selected: [], submitted: false };
  }

  return responses[annotationId];
}

function onAnswer(annotation: AnnotationItem, optionId: string) {
  const response = ensureResponse(annotation.id);
  if (annotation.question?.multiple) {
    if (response.selected.includes(optionId)) {
      response.selected = response.selected.filter((id) => id !== optionId);
    } else {
      response.selected = [...response.selected, optionId];
    }
    return;
  }

  response.selected = [optionId];
  response.submitted = true;
}

function submitAnswer(annotationId: string) {
  const response = ensureResponse(annotationId);
  response.submitted = true;
}

function isOptionSelected(annotationId: string, optionId: string) {
  return ensureResponse(annotationId).selected.includes(optionId);
}

function answerState(annotationId: string) {
  return ensureResponse(annotationId);
}

function isAnswerCorrect(annotationId: string) {
  const annotation = annotations.value.find((item) => item.id === annotationId);
  if (!annotation?.question) {
    return false;
  }

  const response = ensureResponse(annotationId);
  if (!response.submitted) {
    return false;
  }

  const correctOptions = annotation.question.options.filter((option) => option.correct);
  if (!correctOptions.length) {
    return true;
  }

  const selected = new Set(response.selected);
  if (selected.size !== correctOptions.length) {
    return false;
  }

  return correctOptions.every((option) => selected.has(option.id));
}

function resolveEmbedUrl(video: VideoAnnotationData['video']): string {
  if (video.provider === 'youtube') {
    if (video.videoId) {
      return `https://www.youtube.com/embed/${video.videoId}`;
    }
    if (video.url) {
      const id = extractYouTubeId(video.url);
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }
  }

  if (video.provider === 'vimeo') {
    if (video.videoId) {
      return `https://player.vimeo.com/video/${video.videoId}`;
    }
    if (video.url) {
      const id = extractVimeoId(video.url);
      if (id) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }
  }

  return video.url ?? '';
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (id) {
        return id;
      }
      const match = parsed.pathname.match(/\/embed\/([^/]+)/);
      if (match) {
        return match[1];
      }
    }

    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }
  } catch (error) {
    return null;
  }

  return null;
}

function extractVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/(\d+)/);
    if (match) {
      return match[1];
    }
  } catch (error) {
    return null;
  }
  return null;
}

function withStartAt(
  url: string,
  time: number,
  provider: VideoAnnotationData['video']['provider']
): string {
  const seconds = Math.max(0, Math.floor(time));
  if (provider === 'youtube') {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}start=${seconds}`;
  }

  if (provider === 'vimeo') {
    return `${url}#t=${seconds}s`;
  }

  return url;
}
</script>

<style scoped>
.video-annotation {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.video-annotation__header {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.video-annotation__title {
  font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.video-annotation__description {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 1rem);
}

.video-annotation__layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(200px, 1fr);
  gap: var(--md-sys-spacing-5);
  align-items: start;
}

.video-annotation__player {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-large);
  overflow: hidden;
  box-shadow: var(--md-sys-elevation-level1);
}

.video-annotation__player--html5 {
  padding: var(--md-sys-spacing-1);
}

.video-annotation__html5,
.video-annotation__embed {
  width: 100%;
  display: block;
  border: 0;
  border-radius: var(--md-sys-border-radius-large);
  background: black;
  min-height: 320px;
}

.video-annotation__html5 {
  height: 100%;
}

.video-annotation__timeline ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.timeline-item {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-medium);
  box-shadow: var(--md-sys-elevation-level1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.timeline-item--checkpoint {
  border-left: 4px solid var(--md-sys-color-tertiary);
}

.timeline-item--active,
.timeline-item--completed {
  box-shadow: var(--md-sys-elevation-level2);
  transform: translateY(-1px);
}

.timeline-item__button {
  width: 100%;
  padding: var(--md-sys-spacing-3);
  background: transparent;
  border: none;
  display: flex;
  gap: var(--md-sys-spacing-3);
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.timeline-item__time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--md-sys-color-primary);
}

.timeline-item__label {
  flex: 1;
}

.video-annotation__annotation {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
  box-shadow: var(--md-sys-elevation-level1);
}

.video-annotation__annotation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-annotation__annotation-title {
  font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
  font-weight: 600;
  margin: 0;
}

.video-annotation__timestamp {
  font-variant-numeric: tabular-nums;
  color: var(--md-sys-color-on-surface-variant);
}

.video-annotation__note :deep(p) {
  margin-bottom: var(--md-sys-spacing-2);
}

.video-annotation__question-prompt {
  font-weight: 600;
  margin-bottom: var(--md-sys-spacing-3);
}

.video-annotation__question-options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.video-annotation__option {
  display: flex;
  align-items: center;
  gap: var(--md-sys-spacing-2);
  background: var(--md-sys-color-surface-container-low);
  padding: var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-medium);
}

.video-annotation__submit {
  align-self: flex-start;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: var(--md-sys-border-radius-medium);
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-4);
  cursor: pointer;
}

.video-annotation__feedback {
  font-weight: 600;
}

.video-annotation__feedback--correct {
  color: var(--md-sys-color-tertiary);
}

.video-annotation__feedback--incorrect {
  color: var(--md-sys-color-error);
}

.video-annotation__explanation {
  color: var(--md-sys-color-on-surface-variant);
}

@media (max-width: 960px) {
  .video-annotation__layout {
    grid-template-columns: 1fr;
  }

  .video-annotation__timeline {
    order: 3;
  }
}
</style>

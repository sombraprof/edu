<template>
  <section class="lesson-flashcards">
    <header class="lesson-flashcards__header">
      <h3 v-if="data.title" class="lesson-flashcards__title">{{ data.title }}</h3>
      <p v-if="data.description" class="lesson-flashcards__description">{{ data.description }}</p>
    </header>

    <div
      class="lesson-flashcards__viewer"
      @keydown.left.prevent="prev()"
      @keydown.right.prevent="next()"
    >
      <div
        class="lesson-flashcards__card"
        :data-flipped="flipped ? 'true' : 'false'"
        tabindex="0"
        @click="toggle()"
        @keyup.space.prevent="toggle()"
        @keyup.enter.prevent="toggle()"
      >
        <div
          class="lesson-flashcards__face lesson-flashcards__face--front"
          v-html="current.front"
        ></div>
        <div
          class="lesson-flashcards__face lesson-flashcards__face--back"
          v-html="current.back"
        ></div>
      </div>
      <p class="lesson-flashcards__counter">{{ index + 1 }} / {{ cards.length }}</p>
    </div>

    <div class="lesson-flashcards__actions">
      <button type="button" class="md-button md-button--outlined" @click="prev()">Anterior</button>
      <button type="button" class="md-button md-button--tonal" @click="toggle()">
        {{ flipped ? 'Ver frente' : 'Ver verso' }}
      </button>
      <button type="button" class="md-button md-button--outlined" @click="next()">Próximo</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

type Flashcard = { front: string; back: string };
interface FlashcardsData {
  title?: string;
  description?: string;
  shuffle?: boolean;
  cards: Array<Flashcard | { question?: string; answer?: string } | string>;
}

const props = defineProps<{ data: FlashcardsData }>();

function normalizeCards(): Flashcard[] {
  const raw = Array.isArray(props.data?.cards) ? props.data.cards : [];
  const mapped = raw
    .map((entry) => {
      if (typeof entry === 'string') {
        const front = sanitizeHtml(entry);
        if (!front) return undefined;
        return { front, back: '' } as Flashcard;
      }
      const front = sanitizeHtml((entry as any)?.front ?? (entry as any)?.question ?? '');
      const back = sanitizeHtml((entry as any)?.back ?? (entry as any)?.answer ?? '');
      if (!front) return undefined;
      return { front, back } as Flashcard;
    })
    .filter((c): c is Flashcard => Boolean(c));

  const shouldShuffle = props.data?.shuffle !== false;
  return shouldShuffle ? shuffle(mapped) : mapped;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const cards = ref<Flashcard[]>(normalizeCards());
onMounted(() => {
  cards.value = normalizeCards();
});

const index = ref(0);
const flipped = ref(false);

const current = computed(() => cards.value[index.value] ?? { front: '', back: '' });

function next() {
  flipped.value = false;
  index.value = (index.value + 1) % Math.max(cards.value.length, 1);
}

function prev() {
  flipped.value = false;
  index.value =
    (index.value - 1 + Math.max(cards.value.length, 1)) % Math.max(cards.value.length, 1);
}

function toggle() {
  flipped.value = !flipped.value;
}
</script>

<style scoped>
.lesson-flashcards {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.lesson-flashcards__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-flashcards__description {
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-flashcards__viewer {
  display: grid;
  justify-items: center;
  gap: var(--md-sys-spacing-2);
}

.lesson-flashcards__card {
  position: relative;
  width: min(680px, 100%);
  min-height: 160px;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  box-shadow: var(--md-sys-elevation-level1);
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
  outline: none;
}

.lesson-flashcards__card:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent);
}

.lesson-flashcards__card[data-flipped='true'] {
  transform: rotateY(180deg);
}

.lesson-flashcards__face {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  padding: var(--md-sys-spacing-6);
  backface-visibility: hidden;
  color: var(--md-sys-color-on-surface);
}

.lesson-flashcards__face--back {
  transform: rotateY(180deg);
  color: var(--md-sys-color-on-surface);
}

.lesson-flashcards__counter {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.lesson-flashcards__actions {
  display: flex;
  gap: var(--md-sys-spacing-2);
  justify-content: center;
}

@media (max-width: 640px) {
  .lesson-flashcards {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

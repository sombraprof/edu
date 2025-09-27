<template>
  <article class="legacy-section">
    <header v-if="title || iconComponent" class="legacy-section__header">
      <span class="legacy-section__chip" aria-hidden="true">
        <component :is="iconComponent" class="legacy-section__chip-icon" />
      </span>
      <div class="legacy-section__text">
        <span v-if="idLabel" class="legacy-section__eyebrow">{{ idLabel }}</span>
        <h3 v-if="title" class="legacy-section__title">{{ title }}</h3>
      </div>
    </header>

    <div class="legacy-section__body" v-html="html"></div>
  </article>
</template>

<script setup lang="ts">
// Presents sanitised legacy sections with Material Design 3 styling and iconography.
import { computed } from 'vue';
import {
  GraduationCap,
  Target,
  ClipboardList,
  BookOpen,
  Lightbulb,
  Users,
  Layers,
  Sparkles,
  Info,
} from 'lucide-vue-next';

type Props = {
  id?: string;
  title?: string;
  html: string;
};

const props = defineProps<Props>();

const title = computed(() => props.title ?? '');
const id = computed(() => props.id ?? '');
const html = computed(() => props.html ?? '');

const iconRegistry: Record<string, any> = {
  ementa: GraduationCap,
  'plano-aula': Target,
  'plano-voo': Target,
  checklist: ClipboardList,
  'boas-praticas': Lightbulb,
  'comparativo-paradigmas': Layers,
  recursos: BookOpen,
  bibliografia: BookOpen,
  introducao: Sparkles,
  equipe: Users,
};

const iconComponent = computed(() => iconRegistry[id.value] ?? Info);

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const idLabel = computed(() => (id.value ? toTitleCase(id.value) : ''));
</script>

<style scoped>
.legacy-section {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-large);
  background-color: var(--md-sys-color-surface);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 45%, transparent);
  box-shadow: var(--shadow-elevation-1);
}

html[data-theme='dark'] .legacy-section {
  background-color: var(--md-sys-color-surface-container);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 35%, transparent);
  box-shadow: var(--shadow-elevation-2);
}

.legacy-section__header {
  display: flex;
  align-items: center;
  gap: var(--md-sys-spacing-3);
}

.legacy-section__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--md-sys-border-radius-full);
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  box-shadow: var(--shadow-elevation-1);
}

.legacy-section__chip-icon {
  width: var(--md-sys-icon-size-small);
  height: var(--md-sys-icon-size-small);
}

.legacy-section__text {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-1);
}

.legacy-section__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 85%, transparent);
}

.legacy-section__title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.legacy-section__body {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
  color: var(--md-sys-color-on-surface-variant);
}

.legacy-section__body > :deep([data-legacy-card]) {
  background-color: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
  box-shadow: var(--shadow-elevation-1);
  padding: var(--md-sys-spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

html[data-theme='dark'] .legacy-section__body > :deep([data-legacy-card]) {
  background-color: var(--md-sys-color-surface-container-high);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 35%, transparent);
  box-shadow: var(--shadow-elevation-2);
}

.legacy-section__body :deep(h3),
.legacy-section__body :deep(h4) {
  font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.legacy-section__body :deep(p) {
  margin: 0;
}

.legacy-section__body :deep(ul),
.legacy-section__body :deep(ol) {
  margin: 0;
  padding-left: 1.25rem;
}

.legacy-section__body :deep(li + li) {
  margin-top: var(--md-sys-spacing-1);
}

.legacy-section__body :deep(code),
.legacy-section__body :deep(pre) {
  font-family:
    'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}

.legacy-section__body :deep(pre) {
  background-color: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-medium);
  padding: var(--md-sys-spacing-4);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
  overflow-x: auto;
}

html[data-theme='dark'] .legacy-section__body :deep(pre) {
  background-color: color-mix(in srgb, var(--md-sys-color-surface-container-high) 90%, transparent);
}

.legacy-section__body :deep(code-text) {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: var(--md-sys-border-radius-small);
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-primary) 10%,
    var(--md-sys-color-surface) 90%
  );
  color: var(--md-sys-color-on-surface);
  font-family:
    'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}

.legacy-section__body :deep(blockquote) {
  border-left: 4px solid var(--md-sys-color-primary);
  padding-left: var(--md-sys-spacing-4);
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 80%, transparent);
}

.legacy-section__body :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}

.legacy-section__body :deep(.legacy-section__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.35rem;
  border-radius: var(--md-sys-border-radius-full);
  background-color: color-mix(in srgb, var(--md-sys-color-primary-container) 65%, transparent);
  color: var(--md-sys-color-on-primary-container);
  font-size: 0.8rem;
}

.legacy-section__body :deep([data-legacy-grid]) {
  display: grid;
  gap: var(--md-sys-spacing-4);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.legacy-section__body :deep([data-legacy-grid] > [data-legacy-card]) {
  background-color: var(--md-sys-color-surface);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 35%, transparent);
  border-radius: var(--md-sys-border-radius-large);
  box-shadow: var(--shadow-elevation-1);
  padding: var(--md-sys-spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

html[data-theme='dark'] .legacy-section__body :deep([data-legacy-grid] > [data-legacy-card]) {
  background-color: var(--md-sys-color-surface-container-high);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 30%, transparent);
  box-shadow: var(--shadow-elevation-2);
}

.legacy-section__body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-medium);
  overflow: hidden;
}

.legacy-section__body :deep(th),
.legacy-section__body :deep(td) {
  padding: var(--md-sys-spacing-3);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 50%, transparent);
  text-align: left;
}
</style>

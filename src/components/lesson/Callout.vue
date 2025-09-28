<template>
  <article class="callout" :class="variantClass">
    <div v-if="icon" class="callout__icon" aria-hidden="true">
      <component :is="icon" />
    </div>

    <div class="callout__content">
      <h5 v-if="title" class="callout__title">{{ title }}</h5>

      <div v-if="hasRichContent" class="callout__rich">
        <template v-for="(block, index) in richBlocks" :key="index">
          <p v-if="block.type === 'paragraph'" v-html="sanitize(block.text)"></p>

          <ul v-else-if="block.type === 'list' && !block.ordered" role="list">
            <li
              v-for="(item, itemIndex) in block.items"
              :key="itemIndex"
              v-html="sanitize(item)"
            ></li>
          </ul>

          <ol v-else-if="block.type === 'list' && block.ordered" role="list">
            <li
              v-for="(item, itemIndex) in block.items"
              :key="itemIndex"
              v-html="sanitize(item)"
            ></li>
          </ol>

          <CodeBlock
            v-else-if="block.type === 'code'"
            class="callout__code"
            :code="block.code"
            :language="resolveCodeLanguage(block.language)"
            :plainText="isPlainText(block.language)"
          />

          <Roadmap
            v-else-if="block.type === 'roadmap'"
            class="callout__roadmap"
            :steps="block.steps"
          />

          <div v-else-if="block.type === 'video'" class="callout__video">
            <div class="callout__video-frame">
              <iframe
                :src="block.src"
                title="Video player"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <p v-if="block.title" class="callout__video-title">{{ block.title }}</p>
          </div>
        </template>
      </div>

      <div v-else class="callout__body" v-html="safeContent"></div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ListChecks,
  AlertOctagon,
} from 'lucide-vue-next';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import CodeBlock from './CodeBlock.vue';
import Roadmap from './Roadmap.vue';

type RichParagraph = {
  type: 'paragraph';
  text: string;
};

type RichList = {
  type: 'list';
  ordered?: boolean;
  items: string[];
};

type RichCode = {
  type: 'code';
  code: string;
  language?: string;
};

type RichRoadmap = {
  type: 'roadmap';
  steps: Array<{ title: string; description?: string }>;
};

type RichVideo = {
  type: 'video';
  src: string;
  title?: string;
};

type RichContentBlock = RichParagraph | RichList | RichCode | RichRoadmap | RichVideo;

const props = withDefaults(
  defineProps<{
    variant?: 'info' | 'academic' | 'good-practice' | 'warning' | 'task' | 'error';
    title?: string;
    content?: string | RichContentBlock[];
  }>(),
  {
    variant: 'info',
    content: '',
  }
);

const KNOWN_VARIANTS = ['info', 'academic', 'good-practice', 'warning', 'task', 'error'] as const;

type Variant = (typeof KNOWN_VARIANTS)[number];

const resolvedVariant = computed<Variant>(() => {
  const variant = props.variant ?? 'info';
  return (KNOWN_VARIANTS as readonly string[]).includes(variant) ? (variant as Variant) : 'info';
});

const icon = computed(() => {
  switch (resolvedVariant.value) {
    case 'info':
      return Info;
    case 'good-practice':
      return CheckCircle2;
    case 'warning':
      return AlertTriangle;
    case 'academic':
      return BookOpen;
    case 'task':
      return ListChecks;
    case 'error':
      return AlertOctagon;
    default:
      return Info;
  }
});

const variantClass = computed(() => `callout--${resolvedVariant.value}`);

const richBlocks = computed(() => (Array.isArray(props.content) ? props.content : []));
const hasRichContent = computed(() => richBlocks.value.length > 0);

function sanitize(value: string): string {
  return sanitizeHtml(value);
}

const safeContent = computed(() =>
  Array.isArray(props.content) ? '' : sanitize(props.content ?? '')
);

function resolveCodeLanguage(language?: string): string {
  return typeof language === 'string' && language.trim().length > 0 ? language : 'plaintext';
}

function isPlainText(language?: string) {
  if (!language) {
    return true;
  }
  const normalized = language.toLowerCase();
  return normalized === 'plaintext' || normalized === 'pseudocode' || normalized === 'text';
}
</script>

<style scoped>
.callout {
  --callout-bg: var(--md-sys-color-surface-container);
  --callout-border: color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  --callout-text: var(--md-sys-color-on-surface);
  --callout-accent: var(--md-sys-color-primary);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-large);
  background: var(--callout-bg);
  border: 1px solid var(--callout-border);
  color: var(--callout-text);
  box-shadow: var(--shadow-elevation-1);
  align-items: start;
}

.callout__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--md-sys-border-radius-full);
  background: color-mix(in srgb, var(--callout-accent) 14%, transparent);
  color: var(--callout-accent);
}

.callout__icon :deep(svg) {
  width: 1.5rem;
  height: 1.5rem;
}

.callout__content {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.callout__title {
  font-size: var(--md-sys-typescale-title-large-size, 1.25rem);
  font-weight: 600;
  line-height: 1.3;
  color: inherit;
}

.callout__rich,
.callout__body {
  color: color-mix(in srgb, var(--callout-text) 92%, transparent);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.callout__rich ul,
.callout__rich ol {
  padding-left: 1.25rem;
  display: grid;
  gap: var(--md-sys-spacing-1);
}

.callout__rich ol {
  list-style: decimal;
}

.callout__rich ul {
  list-style: disc;
}

.callout__code {
  --code-block-spacing: var(--md-sys-spacing-3);
}

.callout__roadmap {
  margin-top: var(--md-sys-spacing-1);
}

.callout__video {
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.callout__video-frame {
  position: relative;
  padding-top: 56.25%;
  border-radius: var(--md-sys-border-radius-large);
  overflow: hidden;
  box-shadow: var(--shadow-elevation-1);
}

.callout__video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.callout__video-title {
  margin: 0;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.callout :deep(strong) {
  color: inherit;
}

.callout :deep(a) {
  color: var(--callout-accent);
  text-decoration: underline;
}

.callout--info {
  --callout-bg: var(--md-sys-color-primary-container);
  --callout-border: color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent);
  --callout-text: var(--md-sys-color-on-primary-container);
  --callout-accent: var(--md-sys-color-primary);
}

.callout--good-practice {
  --callout-bg: var(--md-sys-color-tertiary-container);
  --callout-border: color-mix(in srgb, var(--md-sys-color-tertiary) 40%, transparent);
  --callout-text: var(--md-sys-color-on-tertiary-container);
  --callout-accent: var(--md-sys-color-tertiary);
}

.callout--warning {
  --callout-bg: var(--md-sys-color-warning-container, #fff3cd);
  --callout-border: color-mix(in srgb, var(--md-sys-color-warning, #f59e0b) 40%, transparent);
  --callout-text: var(--md-sys-color-on-warning-container, #7c5800);
  --callout-accent: var(--md-sys-color-warning, #f59e0b);
}

.callout--academic {
  --callout-bg: var(--md-sys-color-secondary-container);
  --callout-border: color-mix(in srgb, var(--md-sys-color-secondary) 40%, transparent);
  --callout-text: var(--md-sys-color-on-secondary-container);
  --callout-accent: var(--md-sys-color-secondary);
}

.callout--task {
  --callout-bg: var(--md-sys-color-surface-container-high);
  --callout-border: color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
  --callout-text: var(--md-sys-color-on-surface);
  --callout-accent: var(--md-sys-color-primary);
}

.callout--error {
  --callout-bg: var(--md-sys-color-error-container);
  --callout-border: color-mix(in srgb, var(--md-sys-color-error) 40%, transparent);
  --callout-text: var(--md-sys-color-on-error-container);
  --callout-accent: var(--md-sys-color-error);
}

@media (max-width: 640px) {
  .callout {
    grid-template-columns: 1fr;
  }

  .callout__icon {
    width: 2.25rem;
    height: 2.25rem;
  }
}
</style>

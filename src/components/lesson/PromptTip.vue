<template>
  <article class="prompt-tip card md-stack md-stack-4">
    <header v-if="hasHeader" class="prompt-tip__header md-stack md-stack-2">
      <div class="prompt-tip__header-copy md-stack md-stack-1">
        <p
          v-if="data.audience"
          class="prompt-tip__audience text-label-medium uppercase tracking-[0.18em]"
        >
          Para {{ audienceLabel }}
        </p>
        <h3 v-if="data.title" class="prompt-tip__title text-title-medium font-semibold">
          {{ data.title }}
        </h3>
        <p v-if="data.description" class="prompt-tip__description text-body-medium">
          {{ data.description }}
        </p>
      </div>
      <ul v-if="hasTags" class="prompt-tip__tags md-stack md-stack-1" role="list">
        <li v-for="tag in data.tags" :key="tag" class="prompt-tip__tag-item">
          <span class="prompt-tip__tag">{{ tag }}</span>
        </li>
      </ul>
    </header>

    <section class="prompt-tip__content md-stack md-stack-3">
      <div class="prompt-tip__prompt">
        <pre class="prompt-tip__prompt-text" aria-label="Sugestão de prompt">{{ data.prompt }}</pre>
        <Md3Button
          class="prompt-tip__copy-button"
          variant="text"
          icon
          type="button"
          :aria-label="copied ? 'Copiado!' : 'Copiar prompt'"
          @click="copyPrompt"
        >
          <template #leading>
            <span class="md-icon md-icon--md" aria-hidden="true">
              <Check v-if="copied" />
              <Copy v-else />
            </span>
          </template>
          <span class="prompt-tip__copy-label">{{ copied ? 'Copiado!' : 'Copiar' }}</span>
        </Md3Button>
        <span v-if="copied" class="prompt-tip__feedback" role="status" aria-live="polite">
          Prompt copiado com sucesso.
        </span>
      </div>

      <section
        v-if="hasTips"
        class="prompt-tip__tips md-stack md-stack-2"
        aria-label="Variações sugeridas"
      >
        <h4 class="prompt-tip__tips-title text-title-small font-semibold">Variações rápidas</h4>
        <ul class="prompt-tip__tips-list md-stack md-stack-1" role="list">
          <li
            v-for="(tip, index) in data.tips"
            :key="`${index}-${tip}`"
            class="prompt-tip__tips-item"
          >
            {{ tip }}
          </li>
        </ul>
      </section>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Copy, Check } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

export interface PromptTipBlockData {
  prompt: string;
  title?: string;
  description?: string;
  tips?: string[];
  tags?: string[];
  audience?: string;
}

const props = defineProps<{ data: PromptTipBlockData }>();

const copied = ref(false);

const hasTags = computed(() => Boolean(props.data.tags?.length));
const hasTips = computed(() => Boolean(props.data.tips?.length));
const hasHeader = computed(() =>
  Boolean(
    props.data.title || props.data.description || props.data.tags?.length || props.data.audience
  )
);

const audienceLabel = computed(() => {
  if (!props.data.audience) {
    return '';
  }

  const label = props.data.audience.trim();
  if (!label) {
    return '';
  }

  return label.charAt(0).toUpperCase() + label.slice(1);
});

const copyPrompt = () => {
  navigator.clipboard.writeText(props.data.prompt).then(() => {
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};
</script>

<style scoped>
:host {
  display: block;
}

.prompt-tip {
  position: relative;
  padding: 1.75rem;
  border-radius: 20px;
  border: 1px solid rgba(16, 163, 127, 0.35);
  background: linear-gradient(135deg, #f7f8fb 0%, #eef1f7 45%, #e4e9f5 100%);
  color: var(--md-sys-color-on-surface, #0f172a);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
}

:global(html[data-theme='dark']) :host .prompt-tip {
  background: linear-gradient(135deg, #343541 0%, #444654 45%, #202123 100%);
  color: #f7f7f8;
  border-color: rgba(16, 163, 127, 0.45);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45);
}

.prompt-tip__header {
  align-items: flex-start;
}

.prompt-tip__audience {
  letter-spacing: 0.18em;
  color: rgba(16, 163, 127, 0.85);
}

.prompt-tip__description {
  color: color-mix(in srgb, currentColor 88%, transparent 12%);
}

.prompt-tip__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.prompt-tip__tag-item {
  list-style: none;
}

.prompt-tip__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
  background: rgba(16, 163, 127, 0.16);
  border: 1px solid rgba(16, 163, 127, 0.35);
}

:global(html[data-theme='dark']) :host .prompt-tip__tag {
  color: #f7f7f8;
  background: rgba(16, 163, 127, 0.22);
  border-color: rgba(16, 163, 127, 0.55);
}

.prompt-tip__prompt {
  position: relative;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(16, 163, 127, 0.25);
  background: rgba(255, 255, 255, 0.86);
  color: inherit;
}

:global(html[data-theme='dark']) :host .prompt-tip__prompt {
  background: rgba(32, 33, 35, 0.85);
  border-color: rgba(16, 163, 127, 0.45);
}

.prompt-tip__prompt-text {
  margin: 0;
  font-family: var(
    --md-sys-typescale-body-large-font,
    'Fira Code',
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    'Liberation Mono',
    'Courier New',
    monospace
  );
  font-size: 0.95rem;
  line-height: 1.55;
  white-space: pre-wrap;
}

.prompt-tip__copy-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  --md3-button-icon-size: 1.1rem;
}

.prompt-tip__copy-label {
  font-weight: 600;
}

.prompt-tip__feedback {
  position: absolute;
  bottom: 0.9rem;
  right: 1rem;
  font-size: 0.75rem;
  color: rgba(16, 163, 127, 0.85);
}

:global(html[data-theme='dark']) :host .prompt-tip__feedback {
  color: rgba(125, 255, 224, 0.85);
}

.prompt-tip__tips-title {
  color: color-mix(in srgb, currentColor 92%, transparent 8%);
}

.prompt-tip__tips-list {
  margin: 0;
  padding-left: 1rem;
}

.prompt-tip__tips-item {
  color: color-mix(in srgb, currentColor 88%, transparent 12%);
}
</style>

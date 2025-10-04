<template>
  <article class="prompt-tip md-stack md-stack-5">
    <header class="prompt-tip__header md-stack md-stack-3">
      <div class="prompt-tip__badge" aria-hidden="true">
        <span class="prompt-tip__badge-icon md-icon md-icon--md">
          <Sparkles />
        </span>
        <span class="prompt-tip__badge-label">Estude com IA</span>
      </div>

      <div class="prompt-tip__header-copy md-stack md-stack-1">
        <p class="prompt-tip__intro text-body-small">
          Cole o texto abaixo em uma LLM de sua preferência para revisar o conteúdo da aula e
          aprofundar seus estudos.
        </p>
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

    <section class="prompt-tip__content md-stack md-stack-4">
      <div class="prompt-tip__prompt">
        <p :id="instructionsId" class="prompt-tip__prompt-instructions text-body-small">
          Compartilhe este prompt com uma IA generativa (como ChatGPT, Gemini ou Copilot) e siga as
          orientações sugeridas na resposta.
        </p>
        <pre
          class="prompt-tip__prompt-text"
          role="textbox"
          tabindex="0"
          :aria-labelledby="instructionsId"
          >{{ promptText }}</pre
        >
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
import { computed, ref, getCurrentInstance } from 'vue';
import { Copy, Check, Sparkles } from 'lucide-vue-next';
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
const instance = getCurrentInstance();
const instructionsId = `prompt-tip-instructions-${instance?.uid ?? Math.random().toString(36).slice(2)}`;

const promptText = computed(() => props.data.prompt?.trimEnd() ?? '');
const hasTags = computed(() => Boolean(props.data.tags?.length));
const hasTips = computed(() => Boolean(props.data.tips?.length));

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

const copyPrompt = async () => {
  const text = props.data.prompt?.trim();
  if (!text) {
    return;
  }

  try {
    if ('clipboard' in navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Erro ao copiar prompt', error);
  }
};
</script>

<style scoped>
:host {
  display: block;
}

.prompt-tip {
  --prompt-tip-radius: 24px;
  --prompt-tip-border: color-mix(
    in srgb,
    var(--md-sys-color-outline-variant, var(--md-sys-color-outline, #cbd5f5)) 65%,
    transparent
  );
  --prompt-tip-surface: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-high, var(--md-sys-color-surface, #ffffff)) 82%,
    var(--md-sys-color-surface, #ffffff) 18%
  );
  --prompt-tip-shadow: color-mix(in srgb, var(--md-sys-color-on-surface, #0f172a) 12%, transparent);
  display: grid;
  gap: var(--md-sys-spacing-6, 1.5rem);
  padding: clamp(1.5rem, 1.8vw + 1rem, 2rem);
  border-radius: var(--prompt-tip-radius);
  border: 1px solid var(--prompt-tip-border);
  background: var(--prompt-tip-surface);
  color: var(--md-sys-color-on-surface, #0f172a);
  box-shadow: 0 16px 36px var(--prompt-tip-shadow);
}

.prompt-tip__header {
  align-items: flex-start;
}

.prompt-tip__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--md-sys-spacing-2, 0.5rem);
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-primary, #2563eb) 16%, transparent);
  color: color-mix(
    in srgb,
    var(--md-sys-color-primary, #2563eb) 82%,
    var(--md-sys-color-on-surface, #0f172a) 18%
  );
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.prompt-tip__badge-icon {
  display: inline-flex;
}

.prompt-tip__badge-icon :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}

.prompt-tip__badge-label {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
}

.prompt-tip__header-copy {
  margin: 0;
}

.prompt-tip__intro {
  margin: 0;
  color: color-mix(in srgb, currentColor 78%, transparent 22%);
}

.prompt-tip__audience {
  letter-spacing: 0.18em;
  color: color-mix(
    in srgb,
    var(--md-sys-color-primary, #2563eb) 70%,
    var(--md-sys-color-on-surface, #0f172a) 30%
  );
}

.prompt-tip__title {
  margin: 0;
}

.prompt-tip__description {
  margin: 0;
  color: color-mix(in srgb, currentColor 88%, transparent 12%);
}

.prompt-tip__tags {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, max-content));
  justify-content: flex-start;
  justify-items: start;
  gap: var(--md-sys-spacing-2, 0.5rem);
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
  font-size: 0.8rem;
  font-weight: 600;
  color: color-mix(
    in srgb,
    var(--md-sys-color-on-secondary-container, var(--md-sys-color-on-surface)) 90%,
    var(--md-sys-color-on-surface, #0f172a) 10%
  );
  background: color-mix(in srgb, var(--md-sys-color-secondary-container, #e0e8ff) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-secondary, #4c51bf) 35%, transparent);
}

.prompt-tip__content {
  position: relative;
}

.prompt-tip__prompt {
  position: relative;
  padding: clamp(1.1rem, 1vw + 0.9rem, 1.5rem);
  border-radius: 18px;
  border: 1px solid
    color-mix(
      in srgb,
      var(--md-sys-color-outline-variant, var(--md-sys-color-outline, #cbd5f5)) 60%,
      transparent
    );
  background: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-highest, #f4f6fb) 88%,
    var(--md-sys-color-surface, #ffffff) 12%
  );
  box-shadow: 0 12px 26px
    color-mix(in srgb, var(--md-sys-color-on-surface, #0f172a) 10%, transparent);
  color: inherit;
  overflow: hidden;
}

.prompt-tip__prompt-instructions {
  margin: 0 0 1rem;
  color: color-mix(in srgb, currentColor 76%, transparent 24%);
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
  word-break: break-word;
  overflow-x: auto;
  padding-right: 2.75rem;
}

.prompt-tip__copy-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  --md3-button-icon-size: 1.15rem;
}

.prompt-tip__feedback {
  position: absolute;
  inset-block-end: 0.85rem;
  inset-inline-end: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: color-mix(
    in srgb,
    var(--md-sys-color-primary, #2563eb) 78%,
    var(--md-sys-color-on-surface, #0f172a) 22%
  );
}

.prompt-tip__tips-title {
  margin: 0;
  color: color-mix(in srgb, currentColor 92%, transparent 8%);
}

.prompt-tip__tips-list {
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: var(--md-sys-spacing-1, 0.25rem);
}

.prompt-tip__tips-item {
  color: color-mix(in srgb, currentColor 88%, transparent 12%);
}

@media (max-width: 768px) {
  .prompt-tip {
    padding: clamp(1.25rem, 4vw, 1.75rem);
  }

  .prompt-tip__prompt {
    padding: clamp(1rem, 3vw, 1.35rem);
  }

  .prompt-tip__prompt-text {
    padding-right: 2.25rem;
  }
}
</style>

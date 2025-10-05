<template>
  <section class="callout-editor md-stack md-stack-4">
    <header class="callout-editor__header">
      <div class="callout-editor__headline">
        <h3 class="md-typescale-title-medium font-semibold text-on-surface">Callout</h3>
        <p class="text-sm text-on-surface-variant">
          Ajuste as mensagens destacadas apresentadas durante a aula.
        </p>
      </div>
      <div
        class="pill-group callout-editor__mode-toggle"
        role="group"
        aria-label="Selecionar modo de edição do conteúdo"
      >
        <button
          type="button"
          class="pill-item"
          :class="{ 'pill-item--active': editingMode === 'text' }"
          :aria-pressed="editingMode === 'text'"
          @click="setEditingMode('text')"
        >
          Texto
        </button>
        <button
          type="button"
          class="pill-item"
          :class="{ 'pill-item--active': editingMode === 'json' }"
          :aria-pressed="editingMode === 'json'"
          @click="setEditingMode('json')"
        >
          JSON
        </button>
      </div>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Variante</span>
        <select
          v-model="block.variant"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <option value="">Selecione</option>
          <option v-for="option in variantOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-2 md:col-span-2">
        <span class="md-typescale-label-large text-on-surface">Título</span>
        <input
          v-model="block.title"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </label>
    </div>

    <div v-if="isJsonMode" class="callout-editor__pane">
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Conteúdo (JSON)</span>
        <textarea
          v-model="structuredDraft"
          rows="12"
          class="rounded-3xl border border-outline bg-surface-container-high p-4 font-mono text-sm text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          spellcheck="false"
          aria-describedby="callout-json-help"
        ></textarea>
      </label>
      <p id="callout-json-help" class="text-xs text-on-surface-variant">
        Use este modo para listas, parágrafos encadeados ou conteúdos avançados. Altere o JSON
        conforme necessário; alterações válidas são aplicadas imediatamente.
      </p>
      <p v-if="structuredError" class="text-xs text-error">{{ structuredError }}</p>
    </div>
    <div v-else class="callout-editor__pane">
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Conteúdo</span>
        <textarea
          v-model="textContent"
          rows="6"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Escreva os parágrafos do callout. Use uma linha em branco para separar blocos."
        ></textarea>
      </label>
      <p class="text-xs text-on-surface-variant">
        Para estruturar o conteúdo em lista ou múltiplos blocos, alterne para o modo JSON.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';

type EditingMode = 'text' | 'json';

interface CalloutBlock {
  variant?: string;
  title?: string;
  content?: unknown;
  richContent?: unknown;
}

const props = defineProps<{ block: CalloutBlock }>();
const block = toRef(props, 'block');

const variantOptions = [
  { value: 'info', label: 'Informativo' },
  { value: 'academic', label: 'Acadêmico' },
  { value: 'good-practice', label: 'Boa prática' },
  { value: 'warning', label: 'Alerta' },
  { value: 'task', label: 'Tarefa' },
  { value: 'error', label: 'Erro' },
] as const;

const editingMode = ref<EditingMode>('text');

const structuredValue = computed(() => {
  const value = block.value?.richContent ?? block.value?.content;
  if (typeof value === 'string' || value === undefined) {
    return undefined;
  }
  return value;
});

const hasStructuredContent = computed(() => structuredValue.value !== undefined);
const isJsonMode = computed(() => editingMode.value === 'json');

watch(
  hasStructuredContent,
  (value) => {
    if (value) {
      editingMode.value = 'json';
    }
  },
  { immediate: true }
);

const textContent = computed({
  get: () => {
    const raw = block.value?.content;
    return typeof raw === 'string' ? raw : '';
  },
  set: (value: string) => {
    if (!block.value) return;
    block.value.content = value;
    if (block.value.richContent !== undefined) {
      delete (block.value as Record<string, unknown>).richContent;
    }
  },
});

const structuredDraft = ref('');
const structuredError = ref('');
let syncingStructured = false;

function formatStructured(value: unknown) {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch (error) {
    return '';
  }
}

watch(
  structuredValue,
  (value) => {
    syncingStructured = true;
    if (value === undefined) {
      structuredDraft.value = '';
      structuredError.value = '';
      if (editingMode.value === 'json') {
        editingMode.value = 'text';
      }
      syncingStructured = false;
      return;
    }
    structuredDraft.value = formatStructured(value);
    structuredError.value = '';
    syncingStructured = false;
  },
  { immediate: true, deep: true }
);

watch(structuredDraft, (value) => {
  if (!hasStructuredContent.value || syncingStructured) {
    return;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed === null || typeof parsed !== 'object') {
      throw new Error('invalid');
    }
    commitStructuredContent(parsed);
    structuredError.value = '';
  } catch (error) {
    structuredError.value = 'JSON inválido. Ajuste a estrutura e tente novamente.';
  }
});

function commitStructuredContent(parsed: unknown) {
  if (!block.value) {
    return;
  }

  if (block.value.richContent && typeof block.value.richContent !== 'string') {
    block.value.richContent = parsed;
  } else {
    block.value.content = parsed;
    if (typeof block.value.richContent !== 'string') {
      delete (block.value as Record<string, unknown>).richContent;
    }
  }
}

function convertPlainToStructured(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return [] as unknown[];
  }
  return trimmed.split(/\n{2,}/).map((chunk) => ({ type: 'paragraph', text: chunk.trim() }));
}

function convertStructuredToPlain(value: unknown): string {
  if (!value) return '';
  const lines: string[] = [];

  const visit = (entry: unknown) => {
    if (!entry) return;
    if (typeof entry === 'string') {
      if (entry.trim()) {
        lines.push(entry.trim());
      }
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach(visit);
      return;
    }
    if (typeof entry === 'object') {
      const record = entry as Record<string, unknown>;
      if (typeof record.text === 'string' && record.text.trim()) {
        lines.push(record.text.trim());
      }
      if (Array.isArray(record.items)) {
        record.items.forEach((item) => {
          if (typeof item === 'string') {
            lines.push(`• ${item.trim()}`);
          } else if (item && typeof item === 'object' && 'text' in item) {
            const text = String((item as Record<string, unknown>).text ?? '').trim();
            if (text) {
              lines.push(`• ${text}`);
            }
          }
        });
      }
      if (record.content) {
        visit(record.content);
      }
    }
  };

  visit(value);
  return lines.join('\n\n');
}

function clearStructuredContent() {
  if (!block.value) {
    return;
  }

  if (typeof block.value.content !== 'string') {
    delete (block.value as Record<string, unknown>).content;
  }
  if (typeof block.value.richContent !== 'string') {
    delete (block.value as Record<string, unknown>).richContent;
  }
}

function setEditingMode(mode: EditingMode) {
  if (mode === editingMode.value) {
    return;
  }

  if (mode === 'json') {
    if (!hasStructuredContent.value) {
      const structured = convertPlainToStructured(textContent.value);
      commitStructuredContent(structured);
    }
    editingMode.value = 'json';
    return;
  }

  const plain = convertStructuredToPlain(structuredValue.value);
  clearStructuredContent();
  textContent.value = plain;
  structuredDraft.value = '';
  structuredError.value = '';
  editingMode.value = 'text';
}
</script>

<style scoped>
.callout-editor {
  padding: 1.25rem;
  border-radius: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  background: color-mix(in srgb, var(--md-sys-color-surface) 88%, transparent 12%);
}

.callout-editor__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.callout-editor__headline {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 12rem;
}

.callout-editor__mode-toggle {
  align-self: flex-start;
}

.callout-editor__pane {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.callout-editor__pane textarea {
  min-height: 7.5rem;
}
</style>

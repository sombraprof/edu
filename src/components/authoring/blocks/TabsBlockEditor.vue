<template>
  <section class="md-stack md-stack-4">
    <header class="md-stack md-stack-1">
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Conjunto de abas</h3>
      <p class="text-sm text-on-surface-variant">
        Agrupe conteúdos relacionados em abas. Cada aba pode conter texto formatado ou um trecho de
        código destacado.
      </p>
    </header>

    <label class="flex flex-col gap-2">
      <span class="md-typescale-label-large text-on-surface">Título do bloco</span>
      <input
        v-model="state.title"
        type="text"
        class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        autofocus
      />
    </label>

    <section
      class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-3"
    >
      <header class="flex items-center justify-between">
        <div>
          <h4 class="text-title-small font-semibold text-on-surface">Abas</h4>
          <p class="text-sm text-on-surface-variant">
            Defina o rótulo e o conteúdo apresentado em cada aba.
          </p>
        </div>
        <Md3Button type="button" variant="tonal" @click="addTab">
          <template #leading>
            <Plus class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Nova aba
        </Md3Button>
      </header>

      <div v-if="state.tabs.length" class="flex flex-col gap-4">
        <article
          v-for="(tab, index) in state.tabs"
          :key="tab.id"
          class="rounded-3xl border border-outline bg-surface p-4 md-stack md-stack-3"
        >
          <header class="flex items-center justify-between gap-3">
            <h5 class="text-title-small font-semibold text-on-surface">Aba {{ index + 1 }}</h5>
            <Md3Button
              v-if="state.tabs.length > 1"
              type="button"
              variant="text"
              class="text-error"
              @click="removeTab(index)"
            >
              <template #leading>
                <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Remover
            </Md3Button>
          </header>

          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Rótulo</span>
            <input
              v-model="tab.label"
              type="text"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>

          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Tipo de conteúdo</span>
            <select
              v-model="tab.mode"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <option value="text">Texto formatado (HTML)</option>
              <option value="code">Trecho de código</option>
            </select>
          </label>

          <template v-if="tab.mode === 'code'">
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Linguagem</span>
              <input
                v-model="tab.language"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="ex.: javascript, python, plaintext"
              />
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Código</span>
              <textarea
                v-model="tab.content"
                rows="6"
                class="rounded-3xl border border-outline bg-surface p-3 font-mono text-sm text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Cole o trecho que será exibido"
              ></textarea>
            </label>
          </template>
          <template v-else>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface"
                >Conteúdo (HTML permitido)</span
              >
              <textarea
                v-model="tab.content"
                rows="5"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Parágrafos, listas ou outros elementos HTML simples"
              ></textarea>
            </label>
          </template>
        </article>
      </div>
      <p v-else class="rounded-3xl bg-surface p-4 text-sm text-on-surface-variant">
        Adicione ao menos uma aba para exibir este bloco na aula.
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

type TabMode = 'text' | 'code';

interface EditableTab {
  id: string;
  label: string;
  mode: TabMode;
  content: string;
  language: string;
}

interface TabsBlockInput {
  type?: string;
  title?: string;
  tabs?: Array<
    | string
    | {
        id?: string;
        label?: string;
        title?: string;
        content?: string;
        html?: string;
        code?: string;
        language?: string;
      }
  >;
}

const props = defineProps<{ block: TabsBlockInput }>();
const emit = defineEmits<{ (event: 'update:block', value: TabsBlockInput): void }>();

function createKey(prefix = 'tab'): string {
  const globalCrypto =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `${prefix}-${globalCrypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTab(): EditableTab {
  return {
    id: createKey(),
    label: 'Nova aba',
    mode: 'text',
    content: '',
    language: '',
  };
}

function normalizeTabs(block: TabsBlockInput): EditableTab[] {
  const raw = Array.isArray(block?.tabs) ? block.tabs : [];
  if (!raw.length) {
    return [createTab()];
  }
  return raw.map((entry, index) => {
    if (typeof entry === 'string') {
      return {
        id: createKey(`tab-${index + 1}`),
        label: entry,
        mode: 'text',
        content: '',
        language: '',
      };
    }
    const label =
      typeof entry?.label === 'string' && entry.label.trim()
        ? entry.label
        : typeof entry?.title === 'string'
          ? entry.title
          : '';
    const code = typeof entry?.code === 'string' ? entry.code : '';
    const html =
      typeof entry?.html === 'string'
        ? entry.html
        : typeof entry?.content === 'string'
          ? entry.content
          : '';
    const hasCode = code.trim().length > 0;
    return {
      id: entry?.id ? String(entry.id) : createKey(`tab-${index + 1}`),
      label,
      mode: hasCode ? 'code' : 'text',
      content: hasCode ? code : html,
      language: hasCode && typeof entry?.language === 'string' ? entry.language : '',
    };
  });
}

function normalizeState(block: TabsBlockInput) {
  return {
    type: typeof block?.type === 'string' ? block.type : 'tabs',
    title: typeof block?.title === 'string' ? block.title : '',
    tabs: normalizeTabs(block),
  };
}

const state = reactive(normalizeState(props.block));

let syncing = false;

watch(
  () => props.block,
  (value) => {
    syncing = true;
    const next = normalizeState(value ?? {});
    state.type = next.type;
    state.title = next.title;
    state.tabs = next.tabs;
    syncing = false;
  },
  { deep: true }
);

watch(
  state,
  () => {
    if (syncing) return;
    emit('update:block', {
      type: state.type || 'tabs',
      title: state.title,
      tabs: state.tabs.map((tab) => {
        if (tab.mode === 'code') {
          return {
            id: tab.id,
            label: tab.label,
            code: tab.content,
            language: tab.language || undefined,
          };
        }
        return {
          id: tab.id,
          label: tab.label,
          content: tab.content,
        };
      }),
    });
  },
  { deep: true }
);

function addTab() {
  state.tabs = [...state.tabs, createTab()];
}

function removeTab(index: number) {
  if (state.tabs.length <= 1) return;
  state.tabs = state.tabs.filter((_, i) => i !== index);
}
</script>

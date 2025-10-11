<template>
  <article class="code-playground card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        Laboratório de código
      </p>
      <div class="md-stack md-stack-1">
        <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
          {{ data.title }}
        </h3>
        <p v-if="data.description" class="text-body-medium text-on-surface-variant">
          {{ data.description }}
        </p>
      </div>
    </header>

    <section class="code-playground__editor">
      <div v-if="showFallback" class="code-playground__fallback md-stack md-stack-2">
        <div class="code-playground__fallback-header">
          <AlertCircle class="md-icon md-icon--sm text-error" aria-hidden="true" />
          <p class="text-body-small text-on-surface-variant">
            Não foi possível carregar o editor completo. Utilize o fallback simplificado abaixo.
          </p>
        </div>
        <textarea
          v-model="code"
          class="code-playground__textarea"
          :rows="fallbackRows"
          spellcheck="false"
        ></textarea>
      </div>
      <div v-else class="code-playground__editor-shell">
        <div v-if="!editorReady" class="code-playground__loading" role="status">
          <LoaderCircle
            class="md-icon md-icon--lg animate-spin text-on-surface-variant"
            aria-hidden="true"
          />
          <p class="text-body-small text-on-surface-variant">Carregando editor...</p>
        </div>
        <div
          ref="editorContainer"
          class="code-playground__monaco"
          aria-label="Editor de código"
        ></div>
      </div>
    </section>

    <footer class="code-playground__controls">
      <div class="code-playground__actions">
        <Md3Button type="button" variant="filled" :disabled="runDisabled" @click="execute">
          <template #leading>
            <Play class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          {{ runLabel }}
        </Md3Button>
        <Md3Button type="button" variant="outlined" :disabled="resetDisabled" @click="reset">
          <template #leading>
            <RotateCcw class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          {{ resetLabel }}
        </Md3Button>
      </div>
      <p class="text-body-small text-on-surface-variant">
        Linguagem selecionada: <strong>{{ languageLabel }}</strong>
      </p>
    </footer>

    <section class="code-playground__output" aria-live="polite">
      <h4 class="text-title-small font-semibold text-on-surface">Saída</h4>
      <p v-if="status === 'idle'" class="text-body-small text-on-surface-variant">
        Clique em "{{ runLabel }}" para executar o código.
      </p>
      <div v-else-if="status === 'running'" class="code-playground__status">
        <LoaderCircle
          class="md-icon md-icon--sm animate-spin text-on-surface-variant"
          aria-hidden="true"
        />
        <span class="text-body-small text-on-surface-variant">Executando...</span>
      </div>
      <pre
        v-else-if="status === 'success'"
        class="code-playground__log"
      ><code>{{ output }}</code></pre>
      <div v-else class="code-playground__error" role="alert">
        <AlertCircle class="md-icon md-icon--sm" aria-hidden="true" />
        <div>
          <p class="font-semibold">Erro ao executar o código</p>
          <p class="text-body-small">{{ errorMessage }}</p>
        </div>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { loader } from '@monaco-editor/loader';
import { transform } from 'sucrase';
import { AlertCircle, LoaderCircle, Play, RotateCcw } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

loader.config({
  monaco: () => import('monaco-editor/esm/vs/editor/editor.api'),
});

export interface CodePlaygroundBlockData {
  title?: string;
  description?: string;
  initialCode?: string;
  language?: 'javascript' | 'typescript' | 'js' | 'ts';
  runLabel?: string;
  resetLabel?: string;
  fallbackRows?: number;
}

const props = defineProps<{ data: CodePlaygroundBlockData }>();

const editorContainer = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
const editorDisposables: Array<{ dispose: () => void }> = [];
const monacoApi = shallowRef<typeof Monaco | null>(null);
const code = ref(props.data.initialCode ?? '');
const status = ref<'idle' | 'running' | 'success' | 'error'>('idle');
const output = ref('');
const errorMessage = ref('');
const workerFailed = ref(false);
const editorReady = ref(false);
const fallbackRows = computed(() => {
  const raw = props.data.fallbackRows;
  const numeric = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.max(8, Math.round(numeric));
  }
  return 12;
});

const language = computed<'javascript' | 'typescript'>(() => {
  const requested = (props.data.language ?? 'javascript').toLowerCase();
  return requested === 'typescript' || requested === 'ts' ? 'typescript' : 'javascript';
});

const languageLabel = computed(() =>
  language.value === 'typescript' ? 'TypeScript' : 'JavaScript'
);
const runLabel = computed(() => props.data.runLabel ?? 'Executar');
const resetLabel = computed(() => props.data.resetLabel ?? 'Restaurar código');
const showFallback = computed(() => workerFailed.value);
const runDisabled = computed(() => status.value === 'running' || code.value.trim().length === 0);
const resetDisabled = computed(
  () => status.value === 'running' || code.value === (props.data.initialCode ?? '')
);

watch(
  () => props.data.initialCode,
  (next) => {
    const normalized = next ?? '';
    if (normalized !== code.value) {
      code.value = normalized;
      editorInstance.value?.setValue(normalized);
    }
  }
);

watch(language, (nextLanguage) => {
  const editor = editorInstance.value;
  const monaco = monacoApi.value;
  if (!editor || !monaco) return;
  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, nextLanguage);
  }
});

async function setupEditor() {
  if (typeof window === 'undefined' || showFallback.value) {
    return;
  }
  if (!editorContainer.value) {
    return;
  }
  try {
    const monaco = await loader.init();
    monacoApi.value = monaco;
    if (!editorContainer.value) {
      return;
    }

    const editor = monaco.editor.create(editorContainer.value, {
      value: code.value,
      language: language.value,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      tabSize: 2,
      scrollBeyondLastLine: false,
    });

    const disposable = editor.onDidChangeModelContent(() => {
      code.value = editor.getValue();
    });
    editorDisposables.push(disposable);

    editorInstance.value = editor;
    editorReady.value = true;
  } catch (error) {
    console.error('[CodePlayground] Falha ao carregar Monaco', error);
    workerFailed.value = true;
  }
}

onMounted(() => {
  void setupEditor();
});

onBeforeUnmount(() => {
  editorDisposables.splice(0).forEach((disposable) => {
    try {
      disposable.dispose();
    } catch (error) {
      console.warn('[CodePlayground] Falha ao liberar listener do Monaco', error);
    }
  });
  editorInstance.value?.dispose();
});

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'boolean' || value === null || value === undefined) {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

function createSandboxConsole(logs: string[]) {
  const push = (...args: unknown[]) => {
    logs.push(args.map((item) => formatValue(item)).join(' '));
  };
  return {
    log: (...args: unknown[]) => push(...args),
    info: (...args: unknown[]) => push(...args),
    warn: (...args: unknown[]) => push(...args),
    error: (...args: unknown[]) => push(...args),
  };
}

async function execute() {
  if (runDisabled.value) return;
  status.value = 'running';
  output.value = '';
  errorMessage.value = '';

  try {
    let compiled = code.value;
    if (language.value === 'typescript') {
      compiled = transform(compiled, {
        transforms: ['typescript'],
      }).code;
    }

    const logs: string[] = [];
    const sandboxConsole = createSandboxConsole(logs);
    const print = (...args: unknown[]) => {
      logs.push(args.map((item) => formatValue(item)).join(' '));
    };

    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
      ...args: string[]
    ) => (...fnArgs: unknown[]) => unknown;
    const runner = new AsyncFunction('console', 'print', `'use strict';\n${compiled}`);
    const result = await runner(sandboxConsole, print);

    if (typeof result !== 'undefined') {
      logs.push(`=> ${formatValue(result)}`);
    }

    output.value = logs.length ? logs.join('\n') : 'Execução concluída sem saída.';
    status.value = 'success';
  } catch (error) {
    status.value = 'error';
    errorMessage.value = error instanceof Error ? error.message : String(error);
  }
}

function reset() {
  code.value = props.data.initialCode ?? '';
  editorInstance.value?.setValue(code.value);
  status.value = 'idle';
  output.value = '';
  errorMessage.value = '';
}
</script>

<style scoped>
.code-playground {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.code-playground__editor {
  position: relative;
  min-height: 320px;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  overflow: hidden;
  background: var(--md-sys-color-surface-container-highest);
}

.code-playground__editor-shell {
  position: relative;
  height: 320px;
}

.code-playground__loading {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--md-sys-color-surface) 80%, transparent 20%);
  z-index: 1;
}

.code-playground__monaco {
  height: 100%;
}

.code-playground__fallback {
  padding: 1rem;
  height: 100%;
}

.code-playground__fallback-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-playground__textarea {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  padding: 1rem;
  font-family: var(--md-sys-typescale-code, 'JetBrains Mono', 'Fira Code', monospace);
  font-size: 0.95rem;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  resize: vertical;
}

.code-playground__controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.code-playground__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.code-playground__output {
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  padding: 1rem;
  background: var(--md-sys-color-surface-container-lowest);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.code-playground__log {
  margin: 0;
  max-height: 200px;
  overflow: auto;
  border-radius: 0.75rem;
  background: var(--md-sys-color-surface-container-high);
  padding: 1rem;
  font-family: var(--md-sys-typescale-code, 'JetBrains Mono', 'Fira Code', monospace);
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--md-sys-color-on-surface);
}

.code-playground__error {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent 88%);
  padding: 1rem;
  color: var(--md-sys-color-on-error-container);
}

.code-playground__status {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>

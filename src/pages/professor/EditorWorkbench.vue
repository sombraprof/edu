<template>
  <section class="page flow">
    <header class="card p-6 md:p-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col gap-3">
          <span class="chip chip--outlined self-start text-primary">Iteração 3</span>
          <h1 class="md-typescale-headline-small font-semibold text-on-surface">
            Editor visual de aulas e exercícios
          </h1>
          <p class="supporting-text text-on-surface-variant">
            Converta JSON válido em uma estrutura editável, ajuste metadados, revise blocos
            principais e exporte novamente para commit.
          </p>
        </div>
        <div class="rounded-3xl bg-[var(--md-sys-color-surface-container-high)] p-4">
          <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
            Próximo aprimoramento
          </p>
          <p class="md-typescale-title-large font-semibold text-on-surface">
            Validações automatizadas
          </p>
          <p class="mt-2 text-sm text-on-surface-variant">
            Integração com os scripts CLI garantirá feedback de conformidade antes do commit.
          </p>
        </div>
      </div>
    </header>

    <TeacherModeGate>
      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Carregar JSON para edição
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Utilize o mesmo payload gerado na ingestão ou exportado dos scripts CLI. O editor mantém
            campos desconhecidos intactos ao salvar.
          </p>
        </header>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <form class="flex flex-col gap-4" @submit.prevent>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Conteúdo bruto</span>
              <textarea
                v-model="rawInput"
                rows="16"
                class="rounded-3xl border border-outline bg-surface p-4 font-mono text-sm text-on-surface shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Cole aqui o JSON de uma aula, exercício ou suplemento"
              ></textarea>
            </label>

            <div class="flex flex-wrap gap-3">
              <button type="button" class="btn btn-tonal" :disabled="!rawInput" @click="formatRaw">
                Formatar JSON
              </button>
              <label class="btn btn-outlined inline-flex cursor-pointer items-center gap-2">
                <UploadCloud class="md-icon md-icon--sm" aria-hidden="true" />
                <span>Importar arquivo</span>
                <input
                  id="editor-file-input"
                  type="file"
                  accept="application/json"
                  class="sr-only"
                  @change="handleFileInput"
                />
              </label>
              <button
                type="button"
                class="btn btn-filled"
                :disabled="!rawInput"
                @click="loadForEditing"
              >
                Carregar no editor
              </button>
            </div>
            <p v-if="lastFileName" class="text-sm text-on-surface-variant">
              Último arquivo carregado: <strong>{{ lastFileName }}</strong>
              <span v-if="lastUploadedAt"> · {{ lastUploadedAt }}</span>
            </p>
            <p v-if="parseError" class="rounded-2xl bg-error/10 p-3 text-sm text-error">
              {{ parseError }}
            </p>
          </form>

          <div
            class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-highest)] p-5"
          >
            <h3 class="md-typescale-title-medium font-semibold text-on-surface">Dicas rápidas</h3>
            <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-on-surface-variant">
              <li>Garanta que o JSON passou pela validação da ingestão antes de editar.</li>
              <li>Campos desconhecidos não são exibidos aqui, mas permanecem no JSON exportado.</li>
              <li>
                Use o painel de blocos para editar <code>lessonPlan</code>,
                <code>contentBlock</code>, <code>cardGrid</code> e <code>callout</code>.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="lessonModel" class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Metadados principais
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Ajuste informações gerais da aula. Listas são salvas linha a linha; deixe campos vazios
            para limpar entradas.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Título</span>
            <input
              v-model="lessonModel.title"
              type="text"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Resumo</span>
            <textarea
              v-model="lessonModel.summary"
              rows="3"
              class="min-h-[3.5rem] rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            ></textarea>
          </label>
          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Objetivo geral</span>
            <textarea
              v-model="lessonModel.objective"
              rows="3"
              class="min-h-[3.5rem] rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            ></textarea>
          </label>
          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Modalidade</span>
            <input
              v-model="lessonModel.modality"
              type="text"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="in-person, remote, híbrida..."
            />
          </label>
          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Duração (minutos)</span>
            <input
              v-model.number="lessonModel.duration"
              type="number"
              min="0"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </label>
          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Tags</span>
            <textarea
              v-model="tagsField"
              rows="2"
              class="min-h-[3.5rem] rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="Uma tag por linha"
            ></textarea>
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <MetadataListEditor label="Objetivos específicos" v-model="objectivesField" />
          <MetadataListEditor label="Competências" v-model="competenciesField" />
          <MetadataListEditor label="Habilidades" v-model="skillsField" />
          <MetadataListEditor label="Resultados esperados" v-model="outcomesField" />
          <MetadataListEditor label="Pré-requisitos" v-model="prerequisitesField" />
        </div>
      </section>

      <section v-if="lessonModel" class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Validação automática do schema
          </h2>
          <p class="supporting-text text-on-surface-variant">
            O editor reaproveita o <code>lesson.schema.json</code> para checar consistência enquanto
            você edita.
          </p>
        </header>

        <div
          class="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-surface-container-high p-4 md:flex-row md:items-start md:justify-between"
        >
          <div class="flex items-start gap-3">
            <component
              :is="validationIcon"
              class="md-icon"
              :class="validationIconClass"
              aria-hidden="true"
            />
            <div>
              <p class="md-typescale-title-medium font-semibold text-on-surface">
                {{ validationSummary.title }}
              </p>
              <p class="mt-1 text-sm text-on-surface-variant">
                {{ validationSummary.description }}
              </p>
            </div>
          </div>
          <p class="text-xs text-on-surface-variant md:self-center">
            Atualiza automaticamente a cada edição.
          </p>
        </div>

        <ul v-if="validationSummary.errors.length" class="space-y-3">
          <li
            v-for="(error, index) in validationSummary.errors"
            :key="index"
            class="rounded-3xl border border-outline-variant bg-surface p-4 text-sm text-on-surface"
          >
            <p class="font-medium text-error">{{ error.message }}</p>
            <p v-if="error.instancePath" class="mt-1 text-xs text-on-surface-variant">
              Caminho: <code>{{ error.instancePath }}</code>
            </p>
            <p v-if="error.hint" class="mt-1 text-xs text-on-surface-variant">
              {{ error.hint }}
            </p>
          </li>
        </ul>
        <p
          v-else-if="validationSummary.state === 'valid'"
          class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant"
        >
          Tudo certo! Use a exportação abaixo ou volte para a ingestão para novos arquivos.
        </p>
        <p v-else class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
          Carregue um JSON válido para verificar conformidade com o schema oficial.
        </p>
      </section>

      <section v-if="lessonModel" class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">Blocos de conteúdo</h2>
          <p class="supporting-text text-on-surface-variant">
            Selecione um bloco para editar. Alterações são aplicadas imediatamente na estrutura
            carregada.
          </p>
        </header>

        <div
          v-if="Array.isArray(lessonModel.blocks) && lessonModel.blocks.length"
          class="grid gap-6 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)]"
        >
          <nav class="flex flex-col gap-2">
            <button
              v-for="(block, index) in lessonModel.blocks"
              :key="index"
              type="button"
              class="rounded-3xl border p-3 text-left transition"
              :class="[
                selectedBlockIndex === index
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant bg-surface-container-high text-on-surface',
              ]"
              @click="selectedBlockIndex = index"
            >
              <p class="md-typescale-label-large flex items-center justify-between">
                <span>{{ formatBlockTitle(block, index) }}</span>
                <PenSquare class="md-icon md-icon--sm" aria-hidden="true" />
              </p>
              <p class="mt-1 text-xs text-on-surface-variant">{{ block.type ?? 'bloco' }}</p>
            </button>
          </nav>

          <div class="flex flex-col gap-4">
            <template v-if="selectedBlock">
              <component :is="blockEditorComponent" :block="selectedBlock" />
            </template>
            <p v-else class="text-sm text-on-surface-variant">
              Selecione um bloco para visualizar os detalhes.
            </p>
          </div>
        </div>
        <p v-else class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
          Nenhum bloco encontrado. Importe um JSON com a propriedade <code>blocks</code> para
          habilitar a edição visual.
        </p>
      </section>

      <section v-if="lessonModel" class="card flex flex-col gap-4 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Exportar JSON revisado
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Copie o conteúdo atualizado para aplicar em um commit ou carregar novamente na
            ferramenta de ingestão.
          </p>
        </header>
        <textarea
          :value="formattedOutput"
          readonly
          rows="16"
          class="rounded-3xl border border-outline bg-surface-container-high p-4 font-mono text-sm text-on-surface"
        ></textarea>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="btn btn-filled inline-flex items-center gap-2"
            @click="copyFormatted"
          >
            <ClipboardCopy class="md-icon md-icon--sm" aria-hidden="true" />
            <span>{{ copyLabel }}</span>
          </button>
          <button type="button" class="btn btn-tonal" @click="downloadJson">Baixar arquivo</button>
        </div>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, shallowRef } from 'vue';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  PenSquare,
  UploadCloud,
} from 'lucide-vue-next';
import lessonSchema from '../../../schemas/lesson.schema.json';
import { createAjvInstance, formatAjvErrors, type FormattedAjvError } from './utils/validation';
import TeacherModeGate from '../../components/TeacherModeGate.vue';

interface LessonPlanCard {
  icon?: string;
  title?: string;
  content?: string;
}

interface LessonPlanBlock {
  type: 'lessonPlan';
  title?: string;
  unit?: { title?: string; content?: string };
  cards?: LessonPlanCard[];
  [key: string]: unknown;
}

interface CalloutBlock {
  type: 'callout';
  variant?: string;
  title?: string;
  content?: string;
  [key: string]: unknown;
}

interface CardGridItem {
  title?: string;
  content?: string;
  eyebrow?: string;
  [key: string]: unknown;
}

interface CardGridBlock {
  type: 'cardGrid';
  title?: string;
  eyebrow?: string;
  cards?: CardGridItem[];
  [key: string]: unknown;
}

interface ParagraphItem {
  type: 'paragraph';
  text?: string;
  [key: string]: unknown;
}

interface ContentBlock {
  type: 'contentBlock';
  title?: string;
  eyebrow?: string;
  lead?: string;
  content?: Array<ParagraphItem | Record<string, unknown>>;
  [key: string]: unknown;
}

type KnownBlock =
  | LessonPlanBlock
  | CalloutBlock
  | CardGridBlock
  | ContentBlock
  | Record<string, unknown>;

interface LessonEditorModel {
  [key: string]: any;
  title?: string;
  summary?: string;
  objective?: string;
  modality?: string;
  duration?: number | null;
  tags?: string[];
  objectives?: string[];
  competencies?: string[];
  skills?: string[];
  outcomes?: string[];
  prerequisites?: string[];
  blocks?: KnownBlock[];
}

type LessonArrayField = 'objectives' | 'competencies' | 'skills' | 'outcomes' | 'prerequisites';

const MetadataListEditor = defineAsyncComponent(
  () => import('./components/MetadataListEditor.vue')
);
const LessonPlanEditor = defineAsyncComponent(
  () => import('./components/blocks/LessonPlanEditor.vue')
);
const CalloutEditor = defineAsyncComponent(() => import('./components/blocks/CalloutEditor.vue'));
const CardGridEditor = defineAsyncComponent(() => import('./components/blocks/CardGridEditor.vue'));
const ContentBlockEditor = defineAsyncComponent(
  () => import('./components/blocks/ContentBlockEditor.vue')
);

const rawInput = ref('');
const parseError = ref('');
const lastFileName = ref('');
const lastUploadedAt = ref('');
const lessonModel = shallowRef<LessonEditorModel | null>(null);
const selectedBlockIndex = ref(0);
const copyLabel = ref('Copiar JSON');

const tagsField = computed({
  get() {
    if (!lessonModel.value?.tags) return '';
    return lessonModel.value.tags.join('\n');
  },
  set(value: string) {
    if (!lessonModel.value) return;
    const tags = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    lessonModel.value.tags = tags;
  },
});

const objectivesField = useArrayField('objectives');
const competenciesField = useArrayField('competencies');
const skillsField = useArrayField('skills');
const outcomesField = useArrayField('outcomes');
const prerequisitesField = useArrayField('prerequisites');

const UnsupportedBlockEditor = defineAsyncComponent(
  () => import('./components/blocks/UnsupportedBlockEditor.vue')
);

const ajv = createAjvInstance();
const lessonValidator = ajv.compile(lessonSchema as Record<string, unknown>);

const selectedBlock = computed<KnownBlock | null>(() => {
  if (!lessonModel.value?.blocks) return null;
  return lessonModel.value.blocks[selectedBlockIndex.value] ?? null;
});

const blockEditorComponent = computed(() => {
  if (!selectedBlock.value || typeof selectedBlock.value !== 'object') {
    return UnsupportedBlockEditor;
  }
  switch (selectedBlock.value.type) {
    case 'lessonPlan':
      return LessonPlanEditor;
    case 'callout':
      return CalloutEditor;
    case 'cardGrid':
      return CardGridEditor;
    case 'contentBlock':
      return ContentBlockEditor;
    default:
      return UnsupportedBlockEditor;
  }
});

const formattedOutput = computed(() => {
  if (!lessonModel.value) return '';
  return JSON.stringify(lessonModel.value, null, 2);
});

type ValidationState = 'idle' | 'valid' | 'invalid';

const validationSummary = computed(() => {
  if (!lessonModel.value) {
    return {
      state: 'idle' as ValidationState,
      title: 'Aguardando conteúdo',
      description: 'Carregue um JSON válido para iniciar a validação automática.',
      errors: [] as FormattedAjvError[],
    };
  }

  const isValid = lessonValidator(lessonModel.value);
  const errors = isValid ? [] : formatAjvErrors(lessonValidator.errors ?? []);

  return {
    state: (isValid ? 'valid' : 'invalid') as ValidationState,
    title: isValid ? 'Schema atendido' : 'Ajustes necessários',
    description: isValid
      ? 'Nenhuma violação encontrada no `lesson.schema.json`. Continue com a revisão visual.'
      : 'Revise os pontos listados abaixo e ajuste o conteúdo antes de exportar.',
    errors,
  };
});

const validationIcon = computed(() => {
  switch (validationSummary.value.state) {
    case 'valid':
      return CheckCircle2;
    case 'invalid':
      return AlertTriangle;
    default:
      return UploadCloud;
  }
});

const validationIconClass = computed(() => {
  switch (validationSummary.value.state) {
    case 'valid':
      return 'text-success';
    case 'invalid':
      return 'text-error';
    default:
      return 'text-on-surface-variant';
  }
});

function useArrayField(field: LessonArrayField) {
  return computed({
    get() {
      const list = lessonModel.value?.[field];
      if (!Array.isArray(list)) return '';
      return list.join('\n');
    },
    set(value: string) {
      if (!lessonModel.value) return;
      const items = value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      lessonModel.value[field] = items;
    },
  });
}

function formatRaw() {
  try {
    if (!rawInput.value) return;
    const parsed = JSON.parse(rawInput.value);
    rawInput.value = JSON.stringify(parsed, null, 2);
    parseError.value = '';
  } catch (error) {
    parseError.value = 'Não foi possível formatar: JSON inválido.';
  }
}

async function handleFileInput(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const [file] = input.files;
  const text = await file.text();
  rawInput.value = text;
  lastFileName.value = file.name;
  lastUploadedAt.value = new Date().toLocaleString();
  parseError.value = '';
  input.value = '';
}

function loadForEditing() {
  if (!rawInput.value) return;
  try {
    const parsed = JSON.parse(rawInput.value) as LessonEditorModel;
    lessonModel.value = parsed;
    parseError.value = '';
    selectedBlockIndex.value = 0;
    copyLabel.value = 'Copiar JSON';
  } catch (error) {
    parseError.value = 'Não foi possível interpretar o JSON. Revise a estrutura e tente novamente.';
  }
}

async function copyFormatted() {
  if (!formattedOutput.value) return;
  await navigator.clipboard.writeText(formattedOutput.value);
  copyLabel.value = 'Copiado!';
  setTimeout(() => {
    copyLabel.value = 'Copiar JSON';
  }, 2000);
}

function downloadJson() {
  if (!formattedOutput.value) return;
  const blob = new Blob([formattedOutput.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${lessonModel.value?.id ?? 'conteudo'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatBlockTitle(block: KnownBlock, index: number) {
  if (typeof block !== 'object' || !block) return `Bloco ${index + 1}`;
  if ('title' in block && block.title) {
    return String(block.title);
  }
  if (
    'unit' in block &&
    block.unit &&
    typeof block.unit === 'object' &&
    'title' in block.unit &&
    block.unit?.title
  ) {
    return String(block.unit.title);
  }
  return `Bloco ${index + 1}`;
}
</script>

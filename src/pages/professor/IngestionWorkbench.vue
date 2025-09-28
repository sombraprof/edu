<template>
  <section class="page flow">
    <header class="card p-6 md:p-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col gap-3">
          <span class="chip chip--outlined self-start text-primary">Iteração 2</span>
          <h1 class="md-typescale-headline-small font-semibold text-on-surface">
            Ingestão e validação de conteúdo JSON
          </h1>
          <p class="supporting-text text-on-surface-variant">
            Faça upload ou cole JSON gerado por LLMs, valide contra os schemas oficiais e prepare o
            pacote antes de abrir um commit.
          </p>
        </div>
        <div class="rounded-3xl bg-[var(--md-sys-color-surface-container-high)] p-4">
          <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
            Próximos aprimoramentos
          </p>
          <p class="md-typescale-title-large font-semibold text-on-surface">
            Editor visual de blocos
          </p>
          <p class="mt-2 text-sm text-on-surface-variant">
            A próxima iteração adicionará edição granular dos blocos com pré-visualização inline.
          </p>
        </div>
      </div>
    </header>

    <TeacherModeGate>
      <section class="card p-6 md:p-8">
        <header class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="flex flex-col gap-2">
            <h2 class="md-typescale-title-large font-semibold text-on-surface">
              Checklist operacional antes de iniciar
            </h2>
            <p class="supporting-text text-on-surface-variant">
              Garanta que você está trabalhando sobre a versão mais recente do conteúdo antes de
              preparar um novo lote de aulas ou exercícios.
            </p>
          </div>
          <Md3Button variant="tonal" :as="RouterLink" :to="{ name: 'professor-dashboard' }">
            Voltar para o painel
          </Md3Button>
        </header>
        <ol class="mt-6 space-y-4 text-on-surface">
          <li
            v-for="step in checklist"
            :key="step.title"
            class="rounded-3xl border border-outline-variant p-4"
          >
            <header class="flex items-center gap-3">
              <component :is="step.icon" class="md-icon" aria-hidden="true" />
              <div>
                <h3 class="md-typescale-title-medium font-semibold">{{ step.title }}</h3>
                <p class="md-typescale-body-small text-on-surface-variant">
                  {{ step.description }}
                </p>
              </div>
            </header>
            <pre
              v-if="step.command"
              class="mt-3 overflow-x-auto rounded-2xl bg-surface-variant/40 p-3 text-sm"
            >
<code>{{ step.command }}</code>
            </pre>
          </li>
        </ol>
      </section>

      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Enviar ou colar JSON para validação
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Selecione o schema correspondente ao conteúdo e carregue um arquivo `.json` ou cole o
            texto gerado.
          </p>
        </header>

        <div class="flex flex-col gap-6 lg:flex-row">
          <form class="flex flex-1 flex-col gap-4" @submit.prevent>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Tipo de artefato</span>
              <select
                v-model="selectedSchemaKey"
                class="rounded-2xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <option v-for="option in schemaOptions" :key="option.key" :value="option.key">
                  {{ option.label }}
                </option>
              </select>
              <p class="text-sm text-on-surface-variant">{{ selectedSchema.description }}</p>
              <p class="text-xs text-on-surface-variant">
                Destino sugerido: <code>{{ selectedSchema.targetPath }}</code>
              </p>
            </label>

            <div
              class="rounded-3xl border-2 border-dashed border-outline-variant bg-surface-container-high p-6"
            >
              <label
                class="flex cursor-pointer flex-col items-center gap-3 text-center"
                for="ingestion-file-input"
              >
                <UploadCloud class="md-icon" aria-hidden="true" />
                <div>
                  <p class="md-typescale-title-medium font-semibold text-on-surface">
                    Importar arquivo JSON
                  </p>
                  <p class="md-typescale-body-small text-on-surface-variant">
                    Clique ou arraste um arquivo `.json` com o conteúdo gerado.
                  </p>
                </div>
                <input
                  id="ingestion-file-input"
                  type="file"
                  accept="application/json"
                  class="sr-only"
                  @change="handleFileInput"
                />
              </label>
              <p v-if="lastFileName" class="mt-4 text-center text-sm text-on-surface-variant">
                Último arquivo carregado: <strong>{{ lastFileName }}</strong>
                <span v-if="lastUploadedAt"> · {{ lastUploadedAt }}</span>
              </p>
            </div>

            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Conteúdo bruto</span>
              <textarea
                v-model="rawInput"
                rows="14"
                class="rounded-3xl border border-outline bg-surface p-4 font-mono text-sm text-on-surface shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Cole aqui o JSON gerado pelo LLM ou ferramentas externas"
              ></textarea>
            </label>

            <div class="flex flex-wrap gap-3">
              <Md3Button type="button" variant="filled" :disabled="!canFormat" @click="formatJson">
                Formatar JSON
              </Md3Button>
              <Md3Button type="button" variant="tonal" :disabled="!rawInput" @click="clearInput">
                Limpar
              </Md3Button>
              <Md3Button
                type="button"
                variant="outlined"
                :disabled="!formattedPreview"
                @click="copyFormatted"
              >
                <template #leading>
                  <ClipboardCopy class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                <span>{{ copyLabel }}</span>
              </Md3Button>
            </div>
          </form>

          <aside class="flex w-full max-w-xl flex-col gap-4">
            <div class="rounded-3xl border border-outline-variant bg-surface-container-high p-6">
              <header class="flex items-center gap-3">
                <component
                  :is="statusIcon"
                  class="md-icon"
                  :class="statusIconClass"
                  aria-hidden="true"
                />
                <div>
                  <p class="md-typescale-title-medium font-semibold text-on-surface">
                    {{ statusTitle }}
                  </p>
                  <p class="md-typescale-body-small text-on-surface-variant">
                    {{ statusDescription }}
                  </p>
                </div>
              </header>

              <ul v-if="validationErrors.length" class="mt-4 space-y-3 text-sm text-on-surface">
                <li
                  v-for="(error, index) in validationErrors"
                  :key="`${error.instancePath}-${index}`"
                  class="rounded-2xl border border-outline-variant bg-surface p-3"
                >
                  <p class="font-medium text-error">{{ error.message }}</p>
                  <p v-if="error.hint" class="mt-1 text-xs text-on-surface-variant">
                    {{ error.hint }}
                  </p>
                </li>
              </ul>

              <p
                v-else-if="status === 'valid'"
                class="mt-4 rounded-2xl bg-success-container p-3 text-sm text-on-success"
              >
                Estrutura válida! O conteúdo pode seguir para revisão e commit.
              </p>
            </div>

            <div class="rounded-3xl border border-outline-variant bg-surface-container-high p-6">
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Próximos passos sugeridos
              </h3>
              <ol class="mt-4 space-y-3 text-sm text-on-surface">
                <li
                  v-for="nextStep in nextSteps"
                  :key="nextStep.title"
                  class="rounded-2xl bg-surface p-3"
                >
                  <p class="font-medium">{{ nextStep.title }}</p>
                  <p class="text-on-surface-variant">{{ nextStep.description }}</p>
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <section class="card p-6 md:p-8">
        <div class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">Documentação viva</h2>
          <p class="supporting-text text-on-surface-variant">
            As decisões e aprendizados desta iteração estão sendo registrados continuamente para
            facilitar ajustes futuros.
          </p>
        </div>
        <ul class="mt-6 grid gap-4 md:grid-cols-2">
          <li
            v-for="doc in livingDocs"
            :key="doc.href"
            class="rounded-3xl border border-outline-variant bg-surface-container-high p-5"
          >
            <h3 class="md-typescale-title-medium font-semibold text-on-surface">{{ doc.title }}</h3>
            <p class="mt-2 text-sm text-on-surface-variant">{{ doc.description }}</p>
            <Md3Button
              class="mt-4"
              variant="text"
              as="a"
              :href="doc.href"
              target="_blank"
              rel="noreferrer"
            >
              Abrir documento
              <template #trailing>
                <ExternalLink class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
            </Md3Button>
          </li>
        </ul>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ExternalLink,
  UploadCloud,
  GitPullRequest,
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  ClipboardCopy,
  GitBranch,
} from 'lucide-vue-next';
import { createAjvInstance, formatAjvErrors, type FormattedAjvError } from './utils/validation';
import lessonSchema from '../../../schemas/lesson.schema.json';
import lessonsIndexSchema from '../../../schemas/lessons-index.schema.json';
import exercisesIndexSchema from '../../../schemas/exercises-index.schema.json';
import supplementsIndexSchema from '../../../schemas/supplements-index.schema.json';
import TeacherModeGate from '../../components/TeacherModeGate.vue';
import Md3Button from '@/components/Md3Button.vue';

type SchemaKey = 'lesson' | 'lessons-index' | 'exercises-index' | 'supplements-index';

const schemaOptions: Array<{
  key: SchemaKey;
  label: string;
  description: string;
  schema: Record<string, unknown>;
  targetPath: string;
}> = [
  {
    key: 'lesson',
    label: 'Aula completa (`lesson.schema.json`)',
    description:
      'Representação estruturada de uma aula com blocos, atividades e metadados de proveniência.',
    schema: lessonSchema as Record<string, unknown>,
    targetPath: 'src/content/courses/<curso>/lessons/<slug>.json',
  },
  {
    key: 'lessons-index',
    label: 'Manifesto de aulas (`lessons-index.schema.json`)',
    description: 'Lista ordenada de aulas com título, slug, carga horária e metadados.',
    schema: lessonsIndexSchema as Record<string, unknown>,
    targetPath: 'src/content/courses/<curso>/lessons.json',
  },
  {
    key: 'exercises-index',
    label: 'Manifesto de exercícios (`exercises-index.schema.json`)',
    description: 'Catálogo de exercícios apontando para os JSON individuais.',
    schema: exercisesIndexSchema as Record<string, unknown>,
    targetPath: 'src/content/courses/<curso>/exercises.json',
  },
  {
    key: 'supplements-index',
    label: 'Manifesto de suplementos (`supplements-index.schema.json`)',
    description: 'Relaciona materiais complementares com autoria e formato.',
    schema: supplementsIndexSchema as Record<string, unknown>,
    targetPath: 'src/content/courses/<curso>/supplements.json',
  },
];

const ajv = createAjvInstance();

const validators: Record<SchemaKey, ReturnType<typeof ajv.compile>> = {
  lesson: ajv.compile(schemaOptions[0].schema),
  'lessons-index': ajv.compile(schemaOptions[1].schema),
  'exercises-index': ajv.compile(schemaOptions[2].schema),
  'supplements-index': ajv.compile(schemaOptions[3].schema),
};

const checklist = [
  {
    title: 'Atualize sua cópia da branch `main`',
    description:
      'Evite conflitos trazendo as atualizações mais recentes antes de iniciar uma nova rodada.',
    icon: RefreshCw,
    command: 'git checkout main && git pull --rebase',
  },
  {
    title: 'Crie uma branch dedicada para a iteração',
    description: 'Organize o trabalho em branches temáticas para facilitar revisão e PRs menores.',
    icon: GitBranch,
    command: 'git checkout -b feature/professor-ingestao-json',
  },
  {
    title: 'Revise o guia de autoria e os schemas de referência',
    description:
      'Confirme quais blocos e metadados são obrigatórios para o tipo de conteúdo escolhido.',
    icon: FileJson,
    command: null,
  },
  {
    title: 'Planeje a publicação e o PR correspondente',
    description:
      'Defina responsáveis pela revisão cruzada e prepare as mensagens de commit com contexto.',
    icon: GitPullRequest,
    command: null,
  },
];

const selectedSchemaKey = ref<SchemaKey>('lesson');
const rawInput = ref('');
const lastFileName = ref<string | null>(null);
const lastUploadedAt = ref<string | null>(null);
const copyLabel = ref('Copiar JSON formatado');

const selectedSchema = computed(
  () => schemaOptions.find((option) => option.key === selectedSchemaKey.value)!
);

const parsed = computed<unknown | null>(() => {
  if (!rawInput.value.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawInput.value);
  } catch (error) {
    return null;
  }
});

const parseError = computed(() => {
  if (!rawInput.value.trim()) {
    return null;
  }

  try {
    JSON.parse(rawInput.value);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Erro ao interpretar o JSON fornecido.';
  }
});

const status = computed<'idle' | 'parse-error' | 'invalid' | 'valid'>(() => {
  if (!rawInput.value.trim()) {
    return 'idle';
  }

  if (parseError.value) {
    return 'parse-error';
  }

  if (!parsed.value) {
    return 'parse-error';
  }

  const validator = validators[selectedSchemaKey.value];
  const isValid = validator(parsed.value);
  return isValid ? 'valid' : 'invalid';
});

const validationErrors = computed<FormattedAjvError[]>(() => {
  if (status.value !== 'invalid' || !parsed.value) {
    return [];
  }

  const validator = validators[selectedSchemaKey.value];
  validator(parsed.value);
  const errors = validator.errors ?? [];
  return formatAjvErrors(errors);
});

const statusTitle = computed(() => {
  switch (status.value) {
    case 'parse-error':
      return 'Erro ao interpretar o JSON';
    case 'invalid':
      return 'Validação pendente de ajustes';
    case 'valid':
      return 'JSON validado com sucesso';
    default:
      return 'Aguardando conteúdo';
  }
});

const statusDescription = computed(() => {
  switch (status.value) {
    case 'parse-error':
      return parseError.value ?? 'Revise a estrutura do JSON antes de validar.';
    case 'invalid':
      return 'O JSON não atende ao schema selecionado. Revise os erros listados.';
    case 'valid':
      return `Schema "${selectedSchema.value.label}" atendido. Continue com os próximos passos.`;
    default:
      return 'Carregue um arquivo ou cole o JSON para iniciar a validação.';
  }
});

const statusIcon = computed(() => {
  switch (status.value) {
    case 'parse-error':
    case 'invalid':
      return AlertTriangle;
    case 'valid':
      return CheckCircle2;
    default:
      return UploadCloud;
  }
});

const statusIconClass = computed(() => {
  switch (status.value) {
    case 'parse-error':
    case 'invalid':
      return 'text-error';
    case 'valid':
      return 'text-success';
    default:
      return 'text-on-surface-variant';
  }
});

const canFormat = computed(() => Boolean(parsed.value));

const formattedPreview = computed(() => {
  if (!parsed.value) {
    return '';
  }

  return JSON.stringify(parsed.value, null, 2);
});

const nextSteps = reactive([
  {
    title: 'Rodar `npm run validate:content` localmente',
    description:
      'Garante que validadores customizados (scripts e lint-staged) também aprovam o conteúdo.',
  },
  {
    title: 'Atualizar manifestos e wrappers',
    description:
      'Inclua a aula/exercício nos índices correspondentes e gere os componentes Vue quando necessário.',
  },
  {
    title: 'Abrir PR com metadados de proveniência',
    description:
      'Descreva a origem do material (LLM, fontes de apoio) e anexe relatórios de validação.',
  },
]);

const livingDocs = [
  {
    title: 'Plano do módulo Professor',
    description: 'Roadmap completo e decisões por iteração do ambiente administrativo.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/README.md',
  },
  {
    title: 'Registro da Iteração 2',
    description: 'Histórico de validações, fluxos testados e pendências identificadas.',
    href: 'https://github.com/tiagosombra/edu/blob/main/docs/professor-module/iteration-02.md',
  },
];

function handleFileInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }

  lastFileName.value = file.name;
  lastUploadedAt.value = new Date().toLocaleString();

  const reader = new FileReader();
  reader.onload = () => {
    rawInput.value = typeof reader.result === 'string' ? reader.result : '';
  };
  reader.readAsText(file);
  input.value = '';
}

function formatJson() {
  if (!formattedPreview.value) {
    return;
  }

  rawInput.value = formattedPreview.value;
}

function clearInput() {
  rawInput.value = '';
  lastFileName.value = null;
  lastUploadedAt.value = null;
  copyLabel.value = 'Copiar JSON formatado';
}

async function copyFormatted() {
  if (!formattedPreview.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(formattedPreview.value);
    copyLabel.value = 'Copiado!';
    setTimeout(() => {
      copyLabel.value = 'Copiar JSON formatado';
    }, 2000);
  } catch (error) {
    copyLabel.value = 'Não foi possível copiar';
    setTimeout(() => {
      copyLabel.value = 'Copiar JSON formatado';
    }, 2000);
  }
}
</script>

<template>
  <section class="page flow">
    <header class="card md3-surface-section">
      <div class="flex flex-col md3-gap-lg md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col md3-gap-sm">
          <span class="chip chip--outlined self-start text-primary">Iteração 4</span>
          <h1 class="md-typescale-headline-small font-semibold text-on-surface">
            Validações automatizadas e relatórios
          </h1>
          <p class="supporting-text text-on-surface-variant">
            Rode os scripts oficiais, cole os logs para acompanhamento e importe os relatórios
            gerados antes de preparar o pacote para commit.
          </p>
        </div>
        <div class="md3-surface-callout">
          <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">
            Objetivo da iteração
          </p>
          <p class="md-typescale-title-large font-semibold text-on-surface">
            Unificar checklist de validação
          </p>
          <p class="md3-stack-xs text-sm text-on-surface-variant">
            Resultados e logs ficam centralizados nesta área até a integração completa com o backend
            auxiliar.
          </p>
        </div>
      </div>
    </header>

    <TeacherModeGate>
      <section class="card md3-surface-section">
        <header class="flex flex-col md3-gap-xs">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Preparar o workspace local
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Garanta que os scripts rodem sobre a versão mais recente do repositório e registre o
            contexto da execução.
          </p>
        </header>
        <ol class="md3-stack-md md3-space-y-sm text-sm text-on-surface">
          <li>
            <code class="rounded-xl bg-[var(--md-sys-color-surface-container-highest)] px-2 py-1"
              >git checkout main</code
            >
            e
            <code class="rounded-xl bg-[var(--md-sys-color-surface-container-highest)] px-2 py-1"
              >git pull --rebase</code
            >
            para atualizar os conteúdos.
          </li>
          <li>
            Crie uma nova branch de trabalho (<code
              class="rounded-xl bg-[var(--md-sys-color-surface-container-highest)] px-2 py-1"
              >git checkout -b feat/professor-validacao</code
            >) antes de iniciar alterações.
          </li>
          <li>
            Certifique-se de ter executado
            <code class="rounded-xl bg-[var(--md-sys-color-surface-container-highest)] px-2 py-1"
              >npm install</code
            >
            após atualizar dependências.
          </li>
          <li>
            Registre no campo de notas qualquer ajuste manual feito antes ou depois dos scripts
            (ex.: edição de JSON, migração de blocos).
          </li>
        </ol>
        <label class="md3-stack-lg flex flex-col md3-gap-xs">
          <span class="md-typescale-label-large text-on-surface">Notas da rodada</span>
          <textarea
            v-model="notes"
            rows="3"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="Descreva decisões, pendências ou ajustes feitos fora dos scripts oficiais."
          ></textarea>
        </label>
      </section>

      <section class="card md3-surface-section flex flex-col md3-gap-lg">
        <header class="flex flex-col md3-gap-xs">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Executar scripts de validação e relatórios
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Cole abaixo a saída de cada comando após a execução. Use os botões para registrar quando
            o script foi concluído e limpe o campo antes de uma nova rodada.
          </p>
        </header>

        <div class="grid md3-gap-lg lg:grid-cols-2">
          <article
            v-for="key in scriptOrder"
            :key="key"
            class="flex flex-col md3-gap-md md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant"
          >
            <header class="flex items-start justify-between md3-gap-md">
              <div>
                <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                  {{ validationScripts[key].title }}
                </h3>
                <p class="md-typescale-body-small text-on-surface-variant">
                  {{ validationScripts[key].description }}
                </p>
              </div>
              <component
                :is="statusMeta[getScriptStatus(key).status].icon"
                class="md-icon md-icon--md"
                :class="statusIconClass(getScriptStatus(key).status)"
                aria-hidden="true"
              />
            </header>

            <div
              class="md-shape-double-extra-large bg-surface p-4 font-mono text-xs text-on-surface shadow-inner"
            >
              <p class="font-semibold text-primary">$ {{ validationScripts[key].command }}</p>
              <p class="md3-stack-xs whitespace-pre-wrap text-on-surface-variant">
                {{ validationScripts[key].hint }}
              </p>
            </div>

            <label class="flex flex-col md3-gap-xs">
              <span class="md-typescale-label-large text-on-surface">Saída coletada</span>
              <textarea
                v-model="scriptLogs[key].value"
                rows="8"
                class="md-shape-extra-large border border-outline bg-surface p-3 font-mono text-xs text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                :placeholder="validationScripts[key].placeholder"
              ></textarea>
            </label>

            <div class="flex flex-wrap items-center md3-gap-sm text-sm text-on-surface-variant">
              <span class="chip" :class="statusMeta[getScriptStatus(key).status].chipClass">
                {{ statusMeta[getScriptStatus(key).status].label }}
              </span>
              <span>{{ getScriptStatus(key).description }}</span>
            </div>

            <div class="flex flex-wrap md3-gap-sm">
              <Md3Button type="button" variant="tonal" @click="markExecution(key)">
                Registrar execução
              </Md3Button>
              <Md3Button type="button" variant="outlined" @click="clearLog(key)">
                Limpar saída
              </Md3Button>
            </div>
            <div
              v-if="automationAvailable"
              class="flex flex-col md3-gap-xs md-shape-double-extra-large border border-outline-variant bg-surface/80 p-4"
            >
              <div class="flex flex-wrap items-center md3-gap-sm">
                <Md3Button
                  type="button"
                  variant="filled"
                  :disabled="getRemoteExecution(key).status === 'running'"
                  @click="executeViaAutomation(key)"
                >
                  <span v-if="getRemoteExecution(key).status === 'running'">Executando…</span>
                  <span v-else>Executar via backend</span>
                </Md3Button>
                <span class="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                  {{ automationServiceUrl || 'Serviço local' }}
                </span>
              </div>
              <p
                v-if="getRemoteExecution(key).status === 'running'"
                class="text-sm text-on-surface-variant"
              >
                Sincronizando logs com o serviço do módulo administrativo…
              </p>
              <p
                v-else-if="getRemoteExecution(key).status === 'success'"
                class="text-sm text-on-surface-variant"
              >
                Saída preenchida automaticamente após execução remota.
              </p>
              <p
                v-else-if="getRemoteExecution(key).status === 'error'"
                class="md-shape-double-extra-large bg-error/10 p-3 text-sm text-error"
              >
                {{ getRemoteExecution(key).error ?? 'Falha ao executar o script via backend.' }}
              </p>
              <p
                v-if="getRemoteExecution(key).finishedAt"
                class="text-xs uppercase tracking-[0.18em] text-on-surface-variant"
              >
                Execução remota finalizada às
                {{ formatTimestamp(getRemoteExecution(key).finishedAt ?? null) }}
              </p>
              <p
                v-if="getRemoteExecution(key).exitCode !== null"
                class="text-xs text-on-surface-variant"
              >
                Código de saída: {{ getRemoteExecution(key).exitCode }}
              </p>
              <p
                v-if="formatQueueSummary(getRemoteExecution(key))"
                class="text-xs text-on-surface-variant"
              >
                {{ formatQueueSummary(getRemoteExecution(key)) }}
              </p>
            </div>
            <p
              v-if="getTimestamp(key)"
              class="text-xs uppercase tracking-[0.18em] text-on-surface-variant"
            >
              Executado em {{ formatTimestamp(getTimestamp(key)) }}
            </p>
          </article>
        </div>
      </section>

      <section v-if="automationAvailable" class="card md3-surface-section">
        <header class="flex flex-col md3-gap-md md:flex-row md:items-start md:justify-between">
          <div class="flex flex-col md3-gap-xs">
            <h2 class="md-typescale-title-large font-semibold text-on-surface">
              Histórico de execuções remotas
            </h2>
            <p class="supporting-text text-on-surface-variant">
              Consulte as últimas rodadas disparadas pelo serviço auxiliar e acesse os logs
              diretamente pela interface.
            </p>
          </div>
          <Md3Button
            type="button"
            variant="text"
            class="self-start"
            :disabled="scriptHistoryLoading"
            @click="refreshHistory"
          >
            <span v-if="scriptHistoryLoading">Atualizando…</span>
            <span v-else>Atualizar histórico</span>
          </Md3Button>
        </header>

        <p
          v-if="scriptHistoryError"
          class="md3-stack-md md-shape-double-extra-large bg-error/10 p-4 text-sm text-error"
        >
          {{ scriptHistoryError }}
        </p>
        <p
          v-else-if="scriptHistoryLoading && !scriptHistory.length"
          class="md3-stack-md text-sm text-on-surface-variant"
        >
          Carregando histórico de execuções…
        </p>
        <p v-else-if="!scriptHistory.length" class="md3-stack-md text-sm text-on-surface-variant">
          Nenhuma execução remota registrada até o momento.
        </p>

        <ul v-else class="md3-stack-lg md3-space-y-md">
          <li
            v-for="entry in scriptHistory"
            :key="`${entry.key}-${entry.recordedAt}`"
            class="flex flex-col md3-gap-sm md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant shadow-sm"
          >
            <div class="flex flex-wrap items-center md3-gap-sm">
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                {{ validationScripts[entry.key].title }}
              </h3>
              <span class="chip" :class="entry.success ? 'chip--success' : 'chip--error'">
                {{ entry.success ? 'Sucesso' : 'Falha' }}
              </span>
            </div>
            <p class="text-sm text-on-surface-variant">
              {{ validationScripts[entry.key].command }} · {{ formatTimestamp(entry.recordedAt) }}
            </p>
            <p class="text-xs text-on-surface-variant">
              Duração: {{ formatDuration(entry.durationMs) }} · Código de saída:
              {{ entry.exitCode }}
            </p>
            <details class="md-shape-double-extra-large bg-surface p-4 text-xs text-on-surface">
              <summary class="cursor-pointer text-sm font-medium text-primary">
                Ver saída capturada
              </summary>
              <!-- prettier-ignore -->
              <pre class="md3-stack-xs whitespace-pre-wrap font-mono text-xs text-on-surface-variant">{{ entry.output }}</pre>
            </details>
          </li>
        </ul>
      </section>

      <section class="card md3-surface-section flex flex-col md3-gap-lg">
        <header class="flex flex-col md3-gap-xs">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Importar relatórios gerados
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Carregue os arquivos produzidos pelos scripts para visualizar os indicadores principais
            sem sair da SPA.
          </p>
        </header>

        <div class="grid md3-gap-lg xl:grid-cols-3">
          <article
            class="flex flex-col md3-gap-md md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant"
          >
            <header class="flex items-start justify-between">
              <div>
                <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                  Relatório de validação
                </h3>
                <p class="md-typescale-body-small text-on-surface-variant">
                  Arquivo <code>reports/content-validation-report.json</code>.
                </p>
              </div>
              <span
                v-if="validationReport"
                class="chip"
                :class="
                  validationStatusMeta[validationReport.status]?.chipClass ?? 'chip--outlined'
                "
              >
                {{ validationStatusMeta[validationReport.status]?.label ?? 'Status desconhecido' }}
              </span>
            </header>
            <Md3Button variant="tonal" :as="'label'" class="w-fit cursor-pointer">
              <template #leading>
                <UploadCloud class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              <span>Importar JSON</span>
              <input
                type="file"
                accept="application/json"
                class="sr-only"
                @change="handleValidationReportUpload"
              />
            </Md3Button>
            <Md3Button
              v-if="automationAvailable"
              type="button"
              variant="text"
              class="w-fit"
              @click="loadReportFromAutomation('validation')"
            >
              Baixar do backend
            </Md3Button>
            <p v-if="validationReportFile" class="text-sm text-on-surface-variant">
              Último arquivo: <strong>{{ validationReportFile }}</strong>
              <span v-if="validationReport?.generatedAt">
                · {{ formatTimestamp(validationReport.generatedAt) }}</span
              >
            </p>
            <p
              v-if="validationReportError"
              class="md-shape-double-extra-large bg-error/10 p-3 text-sm text-error"
            >
              {{ validationReportError }}
            </p>
            <div
              v-if="validationReport"
              class="md-shape-double-extra-large bg-surface p-4 shadow-inner"
            >
              <dl class="grid md3-gap-xs text-sm text-on-surface">
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Cursos avaliados</dt>
                  <dd class="font-semibold">{{ validationReport.totals.courses }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Lições analisadas</dt>
                  <dd class="font-semibold">{{ validationReport.totals.lessons }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Problemas</dt>
                  <dd class="font-semibold">{{ validationReport.totals.problems }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Avisos</dt>
                  <dd class="font-semibold">{{ validationReport.totals.warnings }}</dd>
                </div>
              </dl>
              <div v-if="coursesWithIssues.length" class="md3-stack-md">
                <h4 class="md-typescale-label-large text-on-surface">
                  Disciplinas com apontamentos
                </h4>
                <ul class="md3-stack-xs md3-space-y-xs text-sm">
                  <li
                    v-for="course in coursesWithIssues"
                    :key="course.id"
                    class="md-shape-double-extra-large border border-outline bg-[var(--md-sys-color-surface-container)] p-3"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-semibold uppercase tracking-[0.12em] text-on-surface">{{
                        course.id
                      }}</span>
                      <span class="chip" :class="courseStatus(course).chipClass">{{
                        courseStatus(course).label
                      }}</span>
                    </div>
                    <p class="mt-1 text-xs text-on-surface-variant">
                      Lições com apontamentos: {{ course.lessonsWithIssues }} · Problemas:
                      {{ course.problems }} · Avisos: {{ course.warnings }}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </article>

          <article
            class="flex flex-col md3-gap-md md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant"
          >
            <header>
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Observabilidade de conteúdo
              </h3>
              <p class="md-typescale-body-small text-on-surface-variant">
                Arquivo <code>reports/content-observability.json</code>.
              </p>
            </header>
            <Md3Button variant="tonal" :as="'label'" class="w-fit cursor-pointer">
              <template #leading>
                <UploadCloud class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              <span>Importar JSON</span>
              <input
                type="file"
                accept="application/json"
                class="sr-only"
                @change="handleObservabilityUpload"
              />
            </Md3Button>
            <Md3Button
              v-if="automationAvailable"
              type="button"
              variant="text"
              class="w-fit"
              @click="loadReportFromAutomation('observability')"
            >
              Baixar do backend
            </Md3Button>
            <p v-if="observabilityFile" class="text-sm text-on-surface-variant">
              Último arquivo: <strong>{{ observabilityFile }}</strong>
              <span v-if="observabilityReport?.generatedAt">
                · {{ formatTimestamp(observabilityReport.generatedAt) }}</span
              >
            </p>
            <p
              v-if="observabilityError"
              class="md-shape-double-extra-large bg-error/10 p-3 text-sm text-error"
            >
              {{ observabilityError }}
            </p>
            <div
              v-if="observabilityReport"
              class="md-shape-double-extra-large bg-surface p-4 shadow-inner"
            >
              <dl class="grid md3-gap-xs text-sm text-on-surface">
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Cursos</dt>
                  <dd class="font-semibold">{{ observabilityReport.totals.courses }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Lições disponíveis</dt>
                  <dd class="font-semibold">{{ observabilityReport.totals.lessons.available }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Blocos legados</dt>
                  <dd class="font-semibold">
                    {{ observabilityReport.totals.lessons.legacyBlocks }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Lições com blocos legados</dt>
                  <dd class="font-semibold">
                    {{ observabilityReport.totals.lessons.legacyLessons }}
                  </dd>
                </div>
              </dl>
            </div>
          </article>

          <article
            class="flex flex-col md3-gap-md md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant"
          >
            <header>
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Alerta de governança
              </h3>
              <p class="md-typescale-body-small text-on-surface-variant">
                Arquivo <code>reports/governance-alert.json</code>.
              </p>
            </header>
            <Md3Button variant="tonal" :as="'label'" class="w-fit cursor-pointer">
              <template #leading>
                <UploadCloud class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              <span>Importar JSON</span>
              <input
                type="file"
                accept="application/json"
                class="sr-only"
                @change="handleGovernanceUpload"
              />
            </Md3Button>
            <Md3Button
              v-if="automationAvailable"
              type="button"
              variant="text"
              class="w-fit"
              @click="loadReportFromAutomation('governance')"
            >
              Baixar do backend
            </Md3Button>
            <p v-if="governanceFile" class="text-sm text-on-surface-variant">
              Último arquivo: <strong>{{ governanceFile }}</strong>
              <span v-if="governanceReport?.generatedAt">
                · {{ formatTimestamp(governanceReport.generatedAt) }}</span
              >
            </p>
            <p
              v-if="governanceError"
              class="md-shape-double-extra-large bg-error/10 p-3 text-sm text-error"
            >
              {{ governanceError }}
            </p>
            <div
              v-if="governanceReport"
              class="md-shape-double-extra-large bg-surface p-4 shadow-inner"
            >
              <dl class="grid md3-gap-xs text-sm text-on-surface">
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Status da validação</dt>
                  <dd class="font-semibold">
                    {{
                      validationStatusMeta[governanceReport.validationStatus]?.label ??
                      governanceReport.validationStatus
                    }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Problemas</dt>
                  <dd class="font-semibold">{{ governanceReport.validationTotals.problems }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Avisos</dt>
                  <dd class="font-semibold">{{ governanceReport.validationTotals.warnings }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Blocos legados</dt>
                  <dd class="font-semibold">
                    {{ governanceReport.observabilityTotals.legacyBlocks }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-on-surface-variant">Abertura de issue</dt>
                  <dd class="font-semibold">
                    {{ governanceReport.flags.shouldOpenIssue ? 'Sim' : 'Não' }}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </section>

      <section class="card md3-surface-section">
        <header class="flex flex-col md3-gap-xs">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Próximos aprimoramentos
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Esta iteração prepara o terreno para a integração completa com um backend auxiliar.
          </p>
        </header>
        <ul class="md3-stack-md list-disc md3-space-y-xs pl-5 text-sm text-on-surface">
          <li>
            Adicionar autenticação e segregação de permissões ao serviço auxiliar para uso em
            ambientes compartilhados.
          </li>
          <li>
            Armazenar metadados de usuário/branch no histórico central para auditoria completa.
          </li>
          <li>
            Conectar o histórico de execuções ao pacote de publicação para sugerir commits e PRs
            automaticamente após uma rodada bem-sucedida.
          </li>
        </ul>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRef, toRefs, watch, type Ref } from 'vue';
import { AlertTriangle, CheckCircle2, Clock3, UploadCloud, XCircle } from 'lucide-vue-next';
import TeacherModeGate from '../../components/TeacherModeGate.vue';
import Md3Button from '@/components/Md3Button.vue';
import {
  validationScriptOrder,
  validationScripts,
  type ValidationReportKey,
  type ValidationScriptKey,
} from './utils/validationScripts';
import {
  fetchTeacherReport,
  fetchTeacherScriptHistory,
  runTeacherScript,
  teacherAutomationBaseUrl,
  teacherAutomationEnabled,
  TeacherAutomationError,
  type TeacherScriptHistoryEntry,
} from './utils/automation';
import { persistValidationStatuses, type ValidationStatusMap } from './utils/validationStatus';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

const STORAGE_KEY = 'edu:professor:validation-workbench';

const defaultState = {
  contentLog: '',
  reportLog: '',
  observabilityLog: '',
  governanceLog: '',
  notes: '',
  timestamps: {
    content: null as string | null,
    report: null as string | null,
    observability: null as string | null,
    governance: null as string | null,
  },
};

const state = reactive({
  ...defaultState,
  timestamps: { ...defaultState.timestamps },
});

const { contentLog, reportLog, observabilityLog, governanceLog, notes } = toRefs(state);
const timestampRefs = toRefs(state.timestamps);

const scriptOrder = validationScriptOrder;

const scriptLogs: Record<ValidationScriptKey, Ref<string>> = {
  content: toRef(state, 'contentLog'),
  report: toRef(state, 'reportLog'),
  observability: toRef(state, 'observabilityLog'),
  governance: toRef(state, 'governanceLog'),
};

const timestamps: Record<ValidationScriptKey, Ref<string | null>> = {
  content: timestampRefs.content,
  report: timestampRefs.report,
  observability: timestampRefs.observability,
  governance: timestampRefs.governance,
};

const scriptHistory = ref<TeacherScriptHistoryEntry[]>([]);
const scriptHistoryLoading = ref(false);
const scriptHistoryError = ref<string | null>(null);
const HISTORY_DISPLAY_LIMIT = 50;

type RemoteExecutionStatus = 'idle' | 'running' | 'success' | 'error';

interface RemoteExecutionState {
  status: RemoteExecutionStatus;
  error: string | null;
  exitCode: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  queuePosition: number | null;
  queueWaitMs: number | null;
}

const remoteExecutions = reactive<Record<ValidationScriptKey, RemoteExecutionState>>(
  scriptOrder.reduce(
    (acc, key) => {
      acc[key] = {
        status: 'idle',
        error: null,
        exitCode: null,
        startedAt: null,
        finishedAt: null,
        queuePosition: null,
        queueWaitMs: null,
      } satisfies RemoteExecutionState;
      return acc;
    },
    {} as Record<ValidationScriptKey, RemoteExecutionState>
  )
);

const automationAvailable = teacherAutomationEnabled;
const automationServiceUrl = teacherAutomationBaseUrl;
const backendReportLabel = 'backend (download automático)';

function getRemoteExecution(key: ValidationScriptKey) {
  return remoteExecutions[key];
}

function registerHistoryEntry(entry: TeacherScriptHistoryEntry) {
  const existingIndex = scriptHistory.value.findIndex(
    (current) => current.key === entry.key && current.recordedAt === entry.recordedAt
  );
  if (existingIndex !== -1) {
    scriptHistory.value.splice(existingIndex, 1);
  }
  scriptHistory.value.unshift(entry);
  if (scriptHistory.value.length > HISTORY_DISPLAY_LIMIT) {
    scriptHistory.value.length = HISTORY_DISPLAY_LIMIT;
  }
}

async function refreshHistory() {
  if (!automationAvailable) return;
  scriptHistoryLoading.value = true;
  scriptHistoryError.value = null;
  try {
    const entries = await fetchTeacherScriptHistory();
    scriptHistory.value = entries.slice(0, HISTORY_DISPLAY_LIMIT);
  } catch (error) {
    scriptHistoryError.value =
      error instanceof TeacherAutomationError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Não foi possível carregar o histórico de execuções.';
  } finally {
    scriptHistoryLoading.value = false;
  }
}

watch(
  () => state,
  (value) => {
    if (typeof window === 'undefined') return;
    const payload = {
      contentLog: value.contentLog,
      reportLog: value.reportLog,
      observabilityLog: value.observabilityLog,
      governanceLog: value.governanceLog,
      notes: value.notes,
      timestamps: { ...value.timestamps },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },
  { deep: true }
);

onMounted(() => {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<typeof defaultState> & {
          timestamps?: Record<string, string | null>;
        };
        state.contentLog = parsed.contentLog ?? '';
        state.reportLog = parsed.reportLog ?? '';
        state.observabilityLog = parsed.observabilityLog ?? '';
        state.governanceLog = parsed.governanceLog ?? '';
        state.notes = parsed.notes ?? '';
        state.timestamps.content = parsed.timestamps?.content ?? null;
        state.timestamps.report = parsed.timestamps?.report ?? null;
        state.timestamps.observability = parsed.timestamps?.observability ?? null;
        state.timestamps.governance = parsed.timestamps?.governance ?? null;
      } catch (error) {
        console.warn('[ValidationWorkbench] Falha ao restaurar estado persistido', error);
      }
    }
  }

  if (automationAvailable) {
    refreshHistory();
  }
});

type CheckStatus = 'pending' | 'success' | 'warning' | 'error';

type StatusInfo = {
  status: CheckStatus;
  description: string;
};

const scriptsStatus = computed<Record<ValidationScriptKey, StatusInfo>>(() => ({
  content: analyzeLog(contentLog.value),
  report: analyzeLog(reportLog.value),
  observability: analyzeLog(observabilityLog.value),
  governance: analyzeLog(governanceLog.value),
}));

const validationStatusesSnapshot = computed<ValidationStatusMap>(() => ({
  content: {
    status: scriptsStatus.value.content.status,
    description: scriptsStatus.value.content.description,
    updatedAt: timestamps.content.value,
  },
  report: {
    status: scriptsStatus.value.report.status,
    description: scriptsStatus.value.report.description,
    updatedAt: timestamps.report.value,
  },
  observability: {
    status: scriptsStatus.value.observability.status,
    description: scriptsStatus.value.observability.description,
    updatedAt: timestamps.observability.value,
  },
  governance: {
    status: scriptsStatus.value.governance.status,
    description: scriptsStatus.value.governance.description,
    updatedAt: timestamps.governance.value,
  },
}));

watch(
  validationStatusesSnapshot,
  (value) => {
    persistValidationStatuses(value);
  },
  { deep: true, immediate: true }
);

const statusMeta: Record<CheckStatus, { label: string; chipClass: string; icon: unknown }> = {
  pending: {
    label: 'Aguardando execução',
    chipClass: 'chip--outlined text-on-surface-variant',
    icon: Clock3,
  },
  success: { label: 'Sem falhas', chipClass: 'chip--success', icon: CheckCircle2 },
  warning: { label: 'Com avisos', chipClass: 'chip--warning', icon: AlertTriangle },
  error: { label: 'Com falhas', chipClass: 'chip--error', icon: XCircle },
};

function analyzeLog(log: string): StatusInfo {
  const trimmed = log.trim();
  if (!trimmed) {
    return {
      status: 'pending',
      description: 'Aguardando a saída do script para classificar o status.',
    };
  }
  const normalized = trimmed.toLowerCase();
  const hasError = /error|erro|fail|✖|✕|fatal|problema|blocking/.test(normalized);
  const hasWarning = /warn|aviso|warning/.test(normalized);
  if (hasError) {
    return {
      status: 'error',
      description: 'Há erros reportados pelo script. Revise antes de prosseguir.',
    };
  }
  if (hasWarning) {
    return {
      status: 'warning',
      description: 'Há avisos na saída. Verifique se impactam a publicação.',
    };
  }
  return {
    status: 'success',
    description: 'Nenhuma falha identificada na saída fornecida.',
  };
}

function markExecution(key: ValidationScriptKey) {
  timestamps[key].value = new Date().toISOString();
}

function clearLog(key: ValidationScriptKey) {
  scriptLogs[key].value = '';
  timestamps[key].value = null;
}

function formatTimestamp(value: string | null) {
  if (!value) return '';
  return dateTimeFormatter.format(new Date(value));
}

function formatDuration(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return '—';
  }
  const totalSeconds = Math.round(value / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (totalMinutes < 60) {
    return `${totalMinutes}min ${seconds.toString().padStart(2, '0')}s`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
}

function formatQueueSummary(state: RemoteExecutionState) {
  if (
    typeof state.queueWaitMs !== 'number' ||
    !Number.isFinite(state.queueWaitMs) ||
    state.queueWaitMs < 0
  ) {
    return '';
  }

  const waitLabel = formatDuration(state.queueWaitMs);
  const positionLabel =
    typeof state.queuePosition === 'number' && state.queuePosition >= 0
      ? ` (posição inicial ${state.queuePosition + 1})`
      : '';

  return `A execução aguardou ${waitLabel} na fila${positionLabel}.`;
}

function statusIconClass(status: CheckStatus) {
  switch (status) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'error':
      return 'text-error';
    default:
      return 'text-on-surface-variant';
  }
}

interface ValidationReportCourseEntry {
  id: string;
  lessonsTotal: number;
  lessonsWithIssues: number;
  problems: number;
  warnings: number;
}

interface ContentValidationReport {
  generatedAt: string;
  status: string;
  totals: {
    courses: number;
    lessons: number;
    lessonsWithIssues: number;
    problems: number;
    warnings: number;
  };
  courses: ValidationReportCourseEntry[];
}

const validationReport = ref<ContentValidationReport | null>(null);
const validationReportError = ref<string | null>(null);
const validationReportFile = ref<string | null>(null);

function applyValidationReport(report: ContentValidationReport, sourceLabel: string) {
  validationReport.value = report;
  validationReportError.value = null;
  validationReportFile.value = sourceLabel;
}

async function handleValidationReportUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as ContentValidationReport;
    if (!parsed.totals || !parsed.courses) {
      throw new Error('JSON inválido para o relatório de validação.');
    }
    applyValidationReport(parsed, file.name);
  } catch (error) {
    validationReport.value = null;
    validationReportFile.value = file.name;
    validationReportError.value =
      error instanceof Error ? error.message : 'Não foi possível interpretar o arquivo enviado.';
  } finally {
    target.value = '';
  }
}

const validationStatusMeta: Record<string, { label: string; chipClass: string }> = {
  passed: { label: 'Sem problemas', chipClass: 'chip--success' },
  'passed-with-warnings': { label: 'Com avisos', chipClass: 'chip--warning' },
  failed: { label: 'Com problemas', chipClass: 'chip--error' },
};

const coursesWithIssues = computed(() => {
  if (!validationReport.value) return [] as ValidationReportCourseEntry[];
  return [...validationReport.value.courses].filter((course) => course.lessonsWithIssues > 0);
});

function courseStatus(course: ValidationReportCourseEntry) {
  if (course.problems > 0) {
    return { label: 'Com problemas', chipClass: 'chip--error' };
  }
  if (course.warnings > 0) {
    return { label: 'Com avisos', chipClass: 'chip--warning' };
  }
  return { label: 'Sem apontamentos', chipClass: 'chip--success' };
}

function getScriptStatus(key: ValidationScriptKey) {
  return scriptsStatus.value[key];
}

function getTimestamp(key: ValidationScriptKey) {
  return timestamps[key].value;
}

interface ContentObservabilityTotals {
  courses: number;
  lessons: {
    total: number;
    available: number;
    unavailable: number;
    legacyBlocks: number;
    legacyLessons: number;
  };
}

interface ContentObservabilityReport {
  generatedAt: string;
  totals: ContentObservabilityTotals;
}

const observabilityReport = ref<ContentObservabilityReport | null>(null);
const observabilityError = ref<string | null>(null);
const observabilityFile = ref<string | null>(null);

function applyObservabilityReport(report: ContentObservabilityReport, sourceLabel: string) {
  observabilityReport.value = report;
  observabilityError.value = null;
  observabilityFile.value = sourceLabel;
}

async function handleObservabilityUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as ContentObservabilityReport;
    if (!parsed.totals?.lessons) {
      throw new Error('JSON inválido para o relatório de observabilidade.');
    }
    applyObservabilityReport(parsed, file.name);
  } catch (error) {
    observabilityReport.value = null;
    observabilityFile.value = file.name;
    observabilityError.value =
      error instanceof Error ? error.message : 'Não foi possível interpretar o arquivo enviado.';
  } finally {
    target.value = '';
  }
}

interface GovernanceAlertReport {
  generatedAt: string;
  validationStatus: string;
  validationTotals: {
    problems: number;
    warnings: number;
    lessonsWithIssues: number;
  };
  observabilityTotals: {
    legacyBlocks: number;
    legacyLessons: number;
    lessonsTotal: number;
    courses: number;
  };
  flags: {
    shouldOpenIssue: boolean;
  };
}

const governanceReport = ref<GovernanceAlertReport | null>(null);
const governanceError = ref<string | null>(null);
const governanceFile = ref<string | null>(null);

function applyGovernanceReport(report: GovernanceAlertReport, sourceLabel: string) {
  governanceReport.value = report;
  governanceError.value = null;
  governanceFile.value = sourceLabel;
}

async function handleGovernanceUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as GovernanceAlertReport;
    if (!parsed.validationTotals || !parsed.observabilityTotals) {
      throw new Error('JSON inválido para o alerta de governança.');
    }
    applyGovernanceReport(parsed, file.name);
  } catch (error) {
    governanceReport.value = null;
    governanceFile.value = file.name;
    governanceError.value =
      error instanceof Error ? error.message : 'Não foi possível interpretar o arquivo enviado.';
  } finally {
    target.value = '';
  }
}

async function loadReportFromAutomation(reportKey: ValidationReportKey) {
  if (!automationAvailable) return;
  try {
    if (reportKey === 'validation') {
      const report = await fetchTeacherReport<ContentValidationReport>('validation');
      applyValidationReport(report, backendReportLabel);
    } else if (reportKey === 'observability') {
      const report = await fetchTeacherReport<ContentObservabilityReport>('observability');
      applyObservabilityReport(report, backendReportLabel);
    } else if (reportKey === 'governance') {
      const report = await fetchTeacherReport<GovernanceAlertReport>('governance');
      applyGovernanceReport(report, backendReportLabel);
    }
  } catch (error) {
    const message =
      error instanceof TeacherAutomationError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Não foi possível baixar o relatório via backend.';
    switch (reportKey) {
      case 'validation':
        validationReportError.value = message;
        break;
      case 'observability':
        observabilityError.value = message;
        break;
      case 'governance':
        governanceError.value = message;
        break;
    }
  }
}

async function executeViaAutomation(key: ValidationScriptKey) {
  if (!automationAvailable) return;
  const state = remoteExecutions[key];
  state.status = 'running';
  state.error = null;
  state.exitCode = null;
  const startedAt = new Date().toISOString();
  state.startedAt = startedAt;
  state.finishedAt = null;
  state.queuePosition = null;
  state.queueWaitMs = null;

  try {
    const result = await runTeacherScript(key);
    state.exitCode = result.exitCode;
    state.startedAt = result.startedAt ?? startedAt;
    state.finishedAt = result.finishedAt ?? new Date().toISOString();
    state.status = result.exitCode === 0 ? 'success' : 'error';
    state.queuePosition = typeof result.queuePosition === 'number' ? result.queuePosition : null;
    state.queueWaitMs = typeof result.queueDurationMs === 'number' ? result.queueDurationMs : null;

    const normalizedOutput = typeof result.output === 'string' ? result.output.trimEnd() : '';
    scriptLogs[key].value = normalizedOutput;
    timestamps[key].value = state.finishedAt;

    if (result.reportKey && result.exitCode === 0) {
      await loadReportFromAutomation(result.reportKey);
    }

    if (result.recordedAt && typeof result.success === 'boolean') {
      registerHistoryEntry(result as TeacherScriptHistoryEntry);
    } else {
      await refreshHistory();
    }
  } catch (error) {
    state.status = 'error';
    state.finishedAt = new Date().toISOString();
    state.queuePosition = null;
    state.queueWaitMs = null;
    const message =
      error instanceof TeacherAutomationError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Falha ao executar o script via backend.';
    state.error = message;
    timestamps[key].value = state.finishedAt;
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chip--outlined {
  border: 1px solid currentColor;
}
</style>

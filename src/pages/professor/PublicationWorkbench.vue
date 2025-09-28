<template>
  <section class="page flow">
    <header class="card p-6 md:p-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col gap-3">
          <span class="chip chip--outlined self-start text-primary">Iteração 5</span>
          <h1 class="md-typescale-headline-small font-semibold text-on-surface">
            Preparar publicação e pacote de Git
          </h1>
          <p class="supporting-text text-on-surface-variant">
            Planeje a rodada de commits antes de abrir um PR. Informe branch, resumo e arquivos
            alterados para gerar os comandos recomendados e o checklist de validações.
          </p>
        </div>
        <div class="rounded-3xl bg-[var(--md-sys-color-surface-container-high)] p-4">
          <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">Objetivo</p>
          <p class="md-typescale-title-large font-semibold text-on-surface">
            Integrar fluxo de Git ao módulo
          </p>
          <p class="mt-2 text-sm text-on-surface-variant">
            Esta iteração documenta o pacote de publicação manual enquanto o backend de automação de
            PRs está em desenvolvimento.
          </p>
        </div>
      </div>
    </header>

    <TeacherModeGate>
      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Status do workspace Git
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Acompanhe a branch atual, divergências e arquivos pendentes antes de iniciar a rodada.
          </p>
        </header>

        <div
          class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-highest)] p-5"
        >
          <template v-if="!teacherAutomationEnabled">
            <p class="md-typescale-body-medium text-on-surface">
              Configure <code>VITE_TEACHER_API_URL</code> e <code>VITE_TEACHER_API_TOKEN</code> para
              consultar o serviço auxiliar. O painel exibirá o status do Git automaticamente quando
              estiver ativo.
            </p>
          </template>
          <template v-else>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="flex flex-col gap-1">
                  <p
                    class="md-typescale-body-large font-semibold text-on-surface"
                    aria-live="polite"
                  >
                    {{ gitBranchSummary }}
                  </p>
                  <p v-if="gitUpstreamSummary" class="text-sm text-on-surface-variant">
                    {{ gitUpstreamSummary }}
                  </p>
                  <p v-if="gitDivergenceSummary" class="text-sm text-on-surface-variant">
                    {{ gitDivergenceSummary }}
                  </p>
                </div>
                <div class="flex flex-wrap gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    class="btn btn-text inline-flex items-center gap-2"
                    :disabled="gitStatusLoading"
                    @click="refreshGitStatus"
                  >
                    <RefreshCcw class="md-icon md-icon--sm" aria-hidden="true" />
                    {{ gitStatusLoading ? 'Atualizando…' : 'Atualizar status' }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-tonal inline-flex items-center gap-2"
                    :disabled="gitFetchLoading"
                    @click="verifyMainUpdates"
                  >
                    <Download class="md-icon md-icon--sm" aria-hidden="true" />
                    {{ gitFetchLoading ? 'Verificando main…' : 'Buscar atualizações da main' }}
                  </button>
                </div>
              </div>

              <div
                v-if="gitFetchError"
                class="flex flex-col gap-3 rounded-2xl bg-error-container p-4 text-on-error-container"
              >
                <div class="flex items-start gap-3">
                  <AlertCircle class="md-icon md-icon--sm" aria-hidden="true" />
                  <div class="flex flex-col gap-1">
                    <p class="text-sm font-medium">{{ gitFetchError }}</p>
                    <p v-if="gitFetchResult" class="text-xs">
                      Comando executado:
                      <code class="font-mono">{{ gitFetchResult.command }}</code>
                    </p>
                  </div>
                </div>
                <pre
                  v-if="gitFetchOutput"
                  class="rounded-2xl bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
                  aria-live="polite"
                  >{{ gitFetchOutput }}
                </pre>
              </div>

              <div
                v-else-if="gitFetchResult"
                class="flex flex-col gap-3 rounded-2xl bg-success-container p-4 text-on-success-container"
              >
                <div class="flex items-start gap-3">
                  <CheckCircle2 class="md-icon md-icon--sm" aria-hidden="true" />
                  <div class="flex flex-col gap-1">
                    <p class="text-sm font-medium">{{ gitFetchSuccessMessage }}</p>
                    <p class="text-xs">
                      Comando executado:
                      <code class="font-mono">{{ gitFetchResult.command }}</code>
                    </p>
                  </div>
                </div>
                <pre
                  v-if="gitFetchOutput"
                  class="rounded-2xl bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
                  aria-live="polite"
                  >{{ gitFetchOutput }}
                </pre>
              </div>

              <div
                v-if="gitStatusError"
                class="flex items-start gap-3 rounded-2xl bg-error-container p-4"
              >
                <AlertCircle
                  class="md-icon md-icon--sm text-on-error-container"
                  aria-hidden="true"
                />
                <p class="text-sm text-on-error-container">{{ gitStatusError }}</p>
              </div>

              <p v-else-if="gitStatusLoading" class="text-sm text-on-surface-variant">
                Consultando Git…
              </p>

              <template v-else-if="gitStatus">
                <p v-if="gitStatus.clean" class="text-sm text-on-surface">
                  Nenhuma alteração pendente no workspace. Você pode seguir para a configuração da
                  rodada.
                </p>

                <div v-else class="flex flex-col gap-3">
                  <p class="text-sm text-on-surface">Arquivos com alterações pendentes:</p>
                  <ul class="grid gap-2 text-sm text-on-surface">
                    <li
                      v-for="change in gitStatus.changes"
                      :key="`${change.status}-${change.path}`"
                      class="flex flex-col rounded-2xl border border-outline bg-surface p-3"
                    >
                      <span
                        class="font-mono text-xs uppercase tracking-wide text-on-surface-variant"
                      >
                        {{ change.status }}
                      </span>
                      <span class="font-medium text-on-surface">{{ change.path }}</span>
                      <span v-if="change.renamedFrom" class="text-xs text-on-surface-variant">
                        Renomeado de {{ change.renamedFrom }}
                      </span>
                    </li>
                  </ul>
                </div>

                <details
                  class="rounded-2xl border border-outline-variant bg-surface p-4 text-sm text-on-surface"
                >
                  <summary class="cursor-pointer font-medium text-on-surface">
                    Saída completa do git status
                  </summary>
                  <pre
                    class="mt-3 whitespace-pre-wrap break-all font-mono text-xs text-on-surface-variant"
                    >{{ gitStatus.raw }}
                  </pre>
                </details>
              </template>
            </div>
          </template>
        </div>
      </section>

      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Configurar branch e resumo da rodada
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Use estes campos para registrar as decisões da rodada e gerar comandos consistentes.
          </p>
        </header>

        <div class="grid gap-6 lg:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Branch de trabalho</span>
            <input
              v-model="branchName"
              type="text"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="feat/professor-publicacao"
            />
            <span class="text-xs text-on-surface-variant">
              Sempre inicie a partir da <code>main</code> atualizada com
              <code>git checkout main && git pull --rebase</code>.
            </span>
          </label>

          <label class="flex flex-col gap-2">
            <span class="md-typescale-label-large text-on-surface">Título do commit</span>
            <input
              v-model="commitTitle"
              type="text"
              class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="feat: adiciona aula sobre integrais"
            />
            <span class="text-xs text-on-surface-variant">
              Resuma a alteração principal no formato convencional de mensagens de commit.
            </span>
          </label>
        </div>

        <div
          v-if="teacherAutomationEnabled"
          class="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-high)] p-5"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-on-surface">
              Peça para o serviço auxiliar criar ou alternar automaticamente para a branch informada
              a partir da <code>main</code> atualizada.
            </p>
            <button
              type="button"
              class="btn btn-filled inline-flex items-center gap-2 self-start md:self-auto"
              :disabled="gitCheckoutLoading"
              @click="createWorkingBranch"
            >
              <GitBranch class="md-icon md-icon--sm" aria-hidden="true" />
              {{ gitCheckoutLoading ? 'Criando branch…' : 'Criar branch automaticamente' }}
            </button>
          </div>

          <div
            v-if="gitCheckoutError"
            class="flex flex-col gap-3 rounded-2xl bg-error-container p-4 text-on-error-container"
          >
            <div class="flex items-start gap-3">
              <AlertCircle class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ gitCheckoutError }}</p>
                <p v-if="gitCheckoutResult" class="text-xs">
                  Comando executado:
                  <code class="font-mono">{{ gitCheckoutResult.command }}</code>
                </p>
              </div>
            </div>
            <pre
              v-if="gitCheckoutOutput"
              class="rounded-2xl bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitCheckoutOutput }}
            </pre>
          </div>

          <div
            v-else-if="gitCheckoutResult"
            class="flex flex-col gap-3 rounded-2xl bg-success-container p-4 text-on-success-container"
          >
            <div class="flex items-start gap-3">
              <CheckCircle2 class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ gitCheckoutSuccessMessage }}</p>
                <p class="text-xs">
                  Comando executado:
                  <code class="font-mono">{{ gitCheckoutResult.command }}</code>
                </p>
              </div>
            </div>
            <pre
              v-if="gitCheckoutOutput"
              class="rounded-2xl bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitCheckoutOutput }}
            </pre>
          </div>

          <p class="text-xs text-on-surface-variant">
            O serviço executa <code>git checkout -b {{ sanitizedBranch }}</code> usando a
            <code>main</code> como ponto de partida. Ajuste manualmente se precisar de outra base.
          </p>
        </div>
        <p
          v-else
          class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-high)] p-4 text-sm text-on-surface-variant"
        >
          Configure <code>VITE_TEACHER_API_URL</code> para criar a branch automaticamente pelo
          painel ou siga os comandos sugeridos abaixo.
        </p>

        <label class="flex flex-col gap-2">
          <span class="md-typescale-label-large text-on-surface">Descrição do PR</span>
          <textarea
            v-model="prDescription"
            rows="4"
            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="Liste aulas, exercícios e componentes ajustados nesta rodada."
          ></textarea>
          <span class="text-xs text-on-surface-variant">
            Este texto será usado no corpo sugerido do PR para facilitar a revisão cruzada.
          </span>
        </label>

        <fieldset
          class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-high)] p-5"
        >
          <legend class="md-typescale-label-large px-2 text-on-surface">
            Validações obrigatórias
          </legend>
          <p class="md-typescale-body-small text-on-surface-variant">
            Marque quais scripts precisam ser executados antes do commit. Eles aparecerão no pacote
            de comandos.
          </p>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <label
              v-for="step in validationSteps"
              :key="step.key"
              class="flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent bg-surface p-4 shadow-sm transition hover:border-primary"
            >
              <input v-model="step.enabled" type="checkbox" class="mt-1" />
              <div class="flex flex-col">
                <span class="md-typescale-title-small font-semibold text-on-surface">{{
                  step.label
                }}</span>
                <span class="md-typescale-body-small text-on-surface-variant">{{
                  step.description
                }}</span>
                <code
                  class="mt-2 inline-flex w-fit rounded-xl bg-[var(--md-sys-color-surface-container-highest)] px-2 py-1 text-xs text-on-surface-variant"
                >
                  {{ step.command }}
                </code>
              </div>
            </label>
          </div>
        </fieldset>
      </section>

      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Conteúdos incluídos nesta rodada
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Relacione aulas, exercícios ou componentes que farão parte do commit. Estes dados são
            usados para gerar o resumo sugerido.
          </p>
        </header>

        <div class="flex flex-col gap-4">
          <article
            v-for="artifact in artifacts"
            :key="artifact.id"
            class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-highest)] p-5"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div class="grid flex-1 gap-4 md:grid-cols-2">
                <label class="flex flex-col gap-2">
                  <span class="md-typescale-label-large text-on-surface">Tipo de conteúdo</span>
                  <select
                    v-model="artifact.type"
                    class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <option
                      v-for="type in artifactTypeOptions"
                      :key="type.value"
                      :value="type.value"
                    >
                      {{ type.label }}
                    </option>
                  </select>
                </label>
                <label class="flex flex-col gap-2">
                  <span class="md-typescale-label-large text-on-surface"
                    >Caminho ou identificação</span
                  >
                  <input
                    v-model="artifact.path"
                    type="text"
                    class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    placeholder="src/content/courses/calculo-1/lessons/limites.json"
                  />
                </label>
              </div>
              <button
                type="button"
                class="btn btn-text inline-flex items-center gap-2 self-start text-error"
                @click="removeArtifact(artifact.id)"
              >
                <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
                Remover
              </button>
            </div>

            <label class="mt-4 flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Resumo do ajuste</span>
              <textarea
                v-model="artifact.summary"
                rows="3"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Ex.: Revisão de exemplos práticos e atualização de objetivos de aprendizagem."
              ></textarea>
            </label>
          </article>
        </div>

        <button
          type="button"
          class="btn btn-tonal inline-flex items-center gap-2 self-start"
          @click="addArtifact"
        >
          <Plus class="md-icon md-icon--sm" aria-hidden="true" />
          Adicionar conteúdo
        </button>
      </section>

      <section class="card flex flex-col gap-6 p-6 md:p-8">
        <header class="flex flex-col gap-2">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Pacote de comandos e resumo sugerido
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Copie os comandos gerados para garantir consistência com os guardrails do repositório e
            reutilize o resumo no PR.
          </p>
        </header>

        <div class="grid gap-6 xl:grid-cols-2">
          <article
            class="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-highest)] p-5"
          >
            <header class="flex items-center justify-between">
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Comandos sugeridos
              </h3>
              <button
                type="button"
                class="btn btn-text inline-flex items-center gap-2"
                @click="copyCommands"
              >
                <Copy class="md-icon md-icon--sm" aria-hidden="true" />
                {{ copyLabel }}
              </button>
            </header>
            <pre
              class="rounded-2xl bg-surface p-4 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
            >
$ {{ gitCommands.join('\n$ ') }}
            </pre>
          </article>

          <article
            class="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-highest)] p-5"
          >
            <header>
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Resumo para o PR
              </h3>
            </header>
            <pre
              class="rounded-2xl bg-surface p-4 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ prTemplate }}
            </pre>
          </article>
        </div>

        <section
          class="rounded-3xl border border-outline-variant bg-[var(--md-sys-color-surface-container-high)] p-5"
        >
          <h3 class="md-typescale-title-medium font-semibold text-on-surface">Checklist final</h3>
          <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-on-surface">
            <li v-for="item in checklistItems" :key="item">{{ item }}</li>
          </ul>
        </section>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  GitBranch,
  Plus,
  RefreshCcw,
  Trash2,
} from 'lucide-vue-next';
import TeacherModeGate from '../../components/TeacherModeGate.vue';
import {
  TeacherAutomationError,
  checkoutTeacherGitBranch,
  fetchTeacherGitStatus,
  fetchTeacherGitUpdates,
  teacherAutomationEnabled,
  type TeacherGitCheckoutResult,
  type TeacherGitFetchResult,
  type TeacherGitStatus,
} from './utils/automation';

type ArtifactType = 'lesson' | 'exercise' | 'supplement' | 'component' | 'assessment' | 'other';

type Artifact = {
  id: number;
  type: ArtifactType;
  path: string;
  summary: string;
};

type ValidationStep = {
  key: string;
  label: string;
  command: string;
  description: string;
  enabled: boolean;
};

const branchName = ref('');
const commitTitle = ref('');
const prDescription = ref('');
const copyLabel = ref('Copiar comandos');

const gitStatus = ref<TeacherGitStatus | null>(null);
const gitStatusError = ref<string | null>(null);
const gitStatusLoading = ref(false);
const gitFetchResult = ref<TeacherGitFetchResult | null>(null);
const gitFetchError = ref<string | null>(null);
const gitFetchLoading = ref(false);
const gitCheckoutResult = ref<TeacherGitCheckoutResult | null>(null);
const gitCheckoutError = ref<string | null>(null);
const gitCheckoutLoading = ref(false);

const gitBranchSummary = computed(() => {
  if (!gitStatus.value) {
    return 'Workspace não consultado ainda';
  }
  if (gitStatus.value.detached) {
    return gitStatus.value.branch ?? 'HEAD destacado';
  }
  return gitStatus.value.branch
    ? `Branch atual: ${gitStatus.value.branch}`
    : 'Branch atual não identificada';
});

const gitUpstreamSummary = computed(() => {
  if (!gitStatus.value?.upstream) {
    return '';
  }
  return `Upstream configurado: ${gitStatus.value.upstream}`;
});

const gitDivergenceSummary = computed(() => {
  if (!gitStatus.value) {
    return '';
  }
  const { ahead, behind } = gitStatus.value;
  if (!ahead && !behind) {
    return 'Workspace alinhado com o upstream configurado.';
  }
  if (ahead && behind) {
    return `Divergência: ${ahead} commit(s) à frente e ${behind} atrás.`;
  }
  if (ahead) {
    return `Divergência: ${ahead} commit(s) à frente do upstream.`;
  }
  return `Divergência: ${behind} commit(s) atrás do upstream.`;
});

const gitFetchOutput = computed(() => {
  if (!gitFetchResult.value) {
    return '';
  }

  const parts = [gitFetchResult.value.stdout, gitFetchResult.value.stderr]
    .map((chunk) => (chunk ?? '').trim())
    .filter((part) => part.length > 0);

  return parts.join('\n\n');
});

const gitFetchSuccessMessage = computed(() => {
  if (!gitFetchResult.value?.success) {
    return '';
  }

  const status = gitFetchResult.value.status;
  if (!status) {
    return 'Fetch executado com sucesso. Consulte o status para confirmar divergências.';
  }

  if (status.behind > 0) {
    return `Fetch concluído. Workspace ainda ${status.behind} commit(s) atrás do upstream.`;
  }

  if (status.ahead > 0) {
    return `Fetch concluído. Workspace ${status.ahead} commit(s) à frente do upstream.`;
  }

  return 'Fetch executado com sucesso. Workspace alinhado com o upstream configurado.';
});

const gitCheckoutOutput = computed(() => {
  if (!gitCheckoutResult.value) {
    return '';
  }

  const stdout = gitCheckoutResult.value.stdout?.trim?.() ?? '';
  const stderr = gitCheckoutResult.value.stderr?.trim?.() ?? '';
  return [stdout, stderr].filter(Boolean).join('\n');
});

const gitCheckoutSuccessMessage = computed(() => {
  if (!gitCheckoutResult.value?.success) {
    return '';
  }

  const branch = gitCheckoutResult.value.branch;
  const startPoint = gitCheckoutResult.value.startPoint ?? 'HEAD atual';

  if (gitCheckoutResult.value.create) {
    return `Branch ${branch} criada a partir de ${startPoint}.`;
  }

  return `Checkout para ${branch} concluído.`;
});

async function refreshGitStatus() {
  if (!teacherAutomationEnabled) {
    return;
  }

  gitStatusLoading.value = true;
  gitStatusError.value = null;

  try {
    gitStatus.value = await fetchTeacherGitStatus();
  } catch (error) {
    if (error instanceof TeacherAutomationError) {
      gitStatusError.value = error.message;
    } else if (error instanceof Error) {
      gitStatusError.value = error.message;
    } else {
      gitStatusError.value = 'Falha inesperada ao consultar o serviço de automação.';
    }
  } finally {
    gitStatusLoading.value = false;
  }
}

async function verifyMainUpdates() {
  if (!teacherAutomationEnabled) {
    return;
  }

  gitFetchLoading.value = true;
  gitFetchError.value = null;
  gitFetchResult.value = null;

  try {
    const result = await fetchTeacherGitUpdates({ remote: 'origin', branch: 'main' });
    gitFetchResult.value = result;

    if (!result.success) {
      const stderrMessage = result.stderr?.trim?.() ?? '';
      const stdoutMessage = result.stdout?.trim?.() ?? '';
      gitFetchError.value =
        stderrMessage || stdoutMessage || 'Não foi possível buscar atualizações da branch main.';
    } else {
      gitFetchError.value = null;
    }

    if (result.status) {
      gitStatus.value = result.status;
    } else if (result.success) {
      await refreshGitStatus();
    }
  } catch (error) {
    gitFetchResult.value = null;
    if (error instanceof TeacherAutomationError) {
      gitFetchError.value = error.message;
    } else if (error instanceof Error) {
      gitFetchError.value = error.message;
    } else {
      gitFetchError.value = 'Falha inesperada ao buscar atualizações do Git.';
    }
  } finally {
    gitFetchLoading.value = false;
  }
}

async function createWorkingBranch() {
  if (!teacherAutomationEnabled) {
    gitCheckoutError.value =
      'Serviço de automação não configurado. Defina VITE_TEACHER_API_URL para habilitar a criação automática.';
    return;
  }

  gitCheckoutLoading.value = true;
  gitCheckoutError.value = null;
  gitCheckoutResult.value = null;

  try {
    const result = await checkoutTeacherGitBranch({
      branch: sanitizedBranch.value,
      create: true,
      startPoint: 'main',
    });

    gitCheckoutResult.value = result;

    if (!result.success) {
      const stderrMessage = result.stderr?.trim?.() ?? '';
      const stdoutMessage = result.stdout?.trim?.() ?? '';
      gitCheckoutError.value =
        stderrMessage || stdoutMessage || 'Não foi possível preparar a branch solicitada.';
    } else {
      gitCheckoutError.value = null;
    }

    if (result.status) {
      gitStatus.value = result.status;
      if (result.status.branch) {
        branchName.value = result.status.branch;
      }
    } else if (result.success) {
      await refreshGitStatus();
    }
  } catch (error) {
    gitCheckoutResult.value = null;
    if (error instanceof TeacherAutomationError) {
      gitCheckoutError.value = error.message;
    } else if (error instanceof Error) {
      gitCheckoutError.value = error.message;
    } else {
      gitCheckoutError.value = 'Falha inesperada ao preparar a branch.';
    }
  } finally {
    gitCheckoutLoading.value = false;
  }
}

onMounted(() => {
  if (teacherAutomationEnabled) {
    refreshGitStatus();
  }
});

const artifactTypeOptions: Array<{ value: ArtifactType; label: string }> = [
  { value: 'lesson', label: 'Aula (lesson)' },
  { value: 'exercise', label: 'Exercício (exercise)' },
  { value: 'supplement', label: 'Suplemento' },
  { value: 'component', label: 'Componente compartilhado' },
  { value: 'assessment', label: 'Avaliação/diagnóstico' },
  { value: 'other', label: 'Outro artefato' },
];

const artifacts = reactive<Artifact[]>([
  {
    id: 1,
    type: 'lesson',
    path: '',
    summary: '',
  },
]);
let artifactIdCounter = 2;

const validationSteps = reactive<ValidationStep[]>([
  {
    key: 'content',
    label: 'Validar conteúdo',
    command: 'npm run validate:content',
    description: 'Garante que os JSONs e manifestos respeitam os schemas oficiais.',
    enabled: true,
  },
  {
    key: 'reports',
    label: 'Gerar relatórios',
    command: 'npm run validate:reports',
    description: 'Atualiza relatórios de validação, observabilidade e governança.',
    enabled: true,
  },
  {
    key: 'build',
    label: 'Checar build',
    command: 'npm run build',
    description: 'Valida se a SPA compila após as alterações.',
    enabled: false,
  },
  {
    key: 'test',
    label: 'Executar testes',
    command: 'npm run test',
    description: 'Roda a suíte de testes unitários quando houver mudanças em componentes.',
    enabled: false,
  },
]);

function addArtifact() {
  artifacts.push({
    id: artifactIdCounter++,
    type: 'lesson',
    path: '',
    summary: '',
  });
}

function removeArtifact(id: number) {
  if (artifacts.length === 1) {
    artifacts[0].path = '';
    artifacts[0].summary = '';
    artifacts[0].type = 'lesson';
    return;
  }

  const index = artifacts.findIndex((item) => item.id === id);
  if (index !== -1) {
    artifacts.splice(index, 1);
  }
}

const sanitizedBranch = computed(() => branchName.value.trim() || 'feat/professor-publicacao');
const sanitizedCommitTitle = computed(
  () => commitTitle.value.trim() || 'chore: preparar pacote de publicação'
);

const enabledValidations = computed(() => validationSteps.filter((step) => step.enabled));

const artifactSummaries = computed(() =>
  artifacts
    .filter((item) => item.path.trim() || item.summary.trim())
    .map((item) => {
      const label =
        artifactTypeOptions.find((option) => option.value === item.type)?.label ?? 'Conteúdo';
      const details = [] as string[];
      if (item.path.trim()) {
        details.push(item.path.trim());
      }
      if (item.summary.trim()) {
        details.push(item.summary.trim());
      }
      return `- ${label}: ${details.join(' — ')}`;
    })
);

const gitCommands = computed(() => {
  const commands: string[] = [];
  commands.push('git checkout main');
  commands.push('git pull --rebase');
  commands.push(`git checkout -b ${sanitizedBranch.value}`);

  enabledValidations.value.forEach((step) => {
    commands.push(step.command);
  });

  const filesToAdd = artifacts.map((item) => item.path.trim()).filter((path) => Boolean(path));

  if (filesToAdd.length > 0) {
    commands.push('git status');
    filesToAdd.forEach((path) => {
      commands.push(`git add ${path}`);
    });
  } else {
    commands.push('# Adicione aqui os caminhos alterados com git add');
  }

  commands.push(`git commit -m "${sanitizedCommitTitle.value}"`);
  commands.push(`git push -u origin ${sanitizedBranch.value}`);
  commands.push('gh pr create --web');

  return commands;
});

const prTitle = computed(
  () => commitTitle.value.trim() || 'feat: atualizar conteúdos no módulo do professor'
);

const prTemplate = computed(() => {
  const header = `## Título sugerido\n${prTitle.value}`;
  const summary = `\n## Resumo\n${prDescription.value.trim() || 'Descreva as alterações principais realizadas nesta rodada.'}`;
  const contentList = artifactSummaries.value.length
    ? ['\n', '### Conteúdos incluídos', ...artifactSummaries.value]
    : [];
  const checklist = [
    '\n',
    '### Checklist',
    ...enabledValidations.value.map((step) => `- [ ] ${step.label} (${step.command})`),
  ];

  return [header, summary, ...contentList, ...checklist].join('\n');
});

const checklistItems = computed(() => {
  const base = [
    'Confirmar que a branch foi criada a partir da main atualizada.',
    'Revisar o diff gerado antes do commit final.',
    'Adicionar metadados de proveniência nos JSONs alterados.',
    'Anexar relatórios ao PR ou indicar a pasta correspondente.',
  ];

  if (artifactSummaries.value.length > 0) {
    base.push('Garantir revisão cruzada para todos os conteúdos listados no resumo.');
  }

  if (enabledValidations.value.some((step) => step.key === 'reports')) {
    base.push('Enviar os arquivos atualizados de relatórios para a área de validação.');
  }

  return base;
});

async function copyCommands() {
  const payload = gitCommands.value.join('\n');

  try {
    await navigator.clipboard.writeText(payload);
    copyLabel.value = 'Copiado!';
  } catch (error) {
    copyLabel.value = 'Não foi possível copiar';
  }

  setTimeout(() => {
    copyLabel.value = 'Copiar comandos';
  }, 2000);
}
</script>

<style scoped>
.page {
  --page-max-width: 1120px;
}
</style>

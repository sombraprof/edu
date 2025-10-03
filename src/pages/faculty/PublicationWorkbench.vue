<template>
  <section class="page flow">
    <header class="card md3-surface-section">
      <div class="flex flex-col md3-gap-lg md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col md3-gap-sm">
          <span class="chip chip--outlined self-start text-primary">Iteração 5</span>
          <h1 class="md-typescale-headline-small font-semibold text-on-surface">
            Preparar publicação e pacote de Git
          </h1>
          <p class="supporting-text text-on-surface-variant">
            Planeje a rodada de commits antes de abrir um PR. Informe branch, resumo e arquivos
            alterados para gerar os comandos recomendados e o checklist de validações.
          </p>
        </div>
        <div class="md3-surface-callout">
          <p class="md-typescale-label-small tracking-[0.18em] text-on-surface-variant">Objetivo</p>
          <p class="md-typescale-title-large font-semibold text-on-surface">
            Integrar fluxo de Git ao módulo
          </p>
          <p class="md3-stack-xs text-sm text-on-surface-variant">
            Esta iteração documenta o pacote de publicação manual enquanto o backend de automação de
            PRs está em desenvolvimento.
          </p>
        </div>
      </div>
    </header>

    <TeacherModeGate>
      <section class="card md3-surface-section flex flex-col md3-gap-lg">
        <header class="flex flex-col md3-gap-xs">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Status do workspace Git
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Acompanhe a branch atual, divergências e arquivos pendentes antes de iniciar a rodada.
          </p>
        </header>

        <div
          class="md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant"
        >
          <template v-if="!teacherAutomationEnabled">
            <p class="md-typescale-body-medium text-on-surface">
              Configure <code>VITE_TEACHER_API_URL</code> e <code>VITE_TEACHER_API_TOKEN</code> para
              consultar o serviço auxiliar. O painel exibirá o status do Git automaticamente quando
              estiver ativo.
            </p>
          </template>
          <template v-else>
            <div class="flex flex-col md3-gap-md">
              <div class="flex flex-col md3-gap-sm md:flex-row md:items-center md:justify-between">
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
                <div class="flex flex-wrap md3-gap-xs self-start md:self-auto">
                  <Md3Button
                    type="button"
                    variant="text"
                    class="inline-flex items-center md3-gap-xs"
                    :disabled="gitStatusLoading"
                    @click="refreshGitStatus"
                  >
                    <template #leading>
                      <RefreshCcw class="md-icon md-icon--sm" aria-hidden="true" />
                    </template>
                    {{ gitStatusLoading ? 'Atualizando…' : 'Atualizar status' }}
                  </Md3Button>
                  <Md3Button
                    type="button"
                    variant="tonal"
                    class="inline-flex items-center md3-gap-xs"
                    :disabled="gitFetchLoading"
                    @click="verifyMainUpdates"
                  >
                    <template #leading>
                      <Download class="md-icon md-icon--sm" aria-hidden="true" />
                    </template>
                    {{ gitFetchLoading ? 'Verificando main…' : 'Buscar atualizações da main' }}
                  </Md3Button>
                </div>
              </div>

              <div
                v-if="gitFetchError"
                class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-error-container p-4 text-on-error-container"
              >
                <div class="flex items-start md3-gap-sm">
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
                  class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
                  aria-live="polite"
                  >{{ gitFetchOutput }}
                </pre>
              </div>

              <div
                v-else-if="gitFetchResult"
                class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-success-container p-4 text-on-success-container"
              >
                <div class="flex items-start md3-gap-sm">
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
                  class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
                  aria-live="polite"
                  >{{ gitFetchOutput }}
                </pre>
              </div>

              <div
                v-if="gitStatusError"
                class="flex items-start md3-gap-sm md-shape-double-extra-large bg-error-container p-4"
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

                <div v-else class="flex flex-col md3-gap-sm">
                  <p class="text-sm text-on-surface">Arquivos com alterações pendentes:</p>
                  <ul class="grid md3-gap-xs text-sm text-on-surface">
                    <li
                      v-for="change in gitStatus.changes"
                      :key="`${change.status}-${change.path}`"
                      class="flex flex-col md-shape-double-extra-large border border-outline bg-surface p-3"
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
                  class="md-shape-double-extra-large border border-outline-variant bg-surface p-4 text-sm text-on-surface"
                >
                  <summary class="cursor-pointer font-medium text-on-surface">
                    Saída completa do git status
                  </summary>
                  <pre
                    class="md3-stack-sm whitespace-pre-wrap break-all font-mono text-xs text-on-surface-variant"
                    >{{ gitStatus.raw }}
                  </pre>
                </details>
              </template>
            </div>
          </template>
        </div>
      </section>

      <section class="card md3-surface-section flex flex-col md3-gap-lg">
        <header class="flex flex-col md3-gap-xs">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Configurar branch e resumo da rodada
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Use estes campos para registrar as decisões da rodada e gerar comandos consistentes.
          </p>
        </header>

        <div class="grid md3-gap-lg lg:grid-cols-2">
          <label class="flex flex-col md3-gap-xs">
            <span class="md-typescale-label-large text-on-surface">Branch de trabalho</span>
            <input
              v-model="branchName"
              type="text"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="feat/faculty-publication"
            />
            <span class="text-xs text-on-surface-variant">
              Sempre inicie a partir da <code>main</code> atualizada com
              <code>git checkout main && git pull --rebase</code>.
            </span>
          </label>

          <label class="flex flex-col md3-gap-xs">
            <span class="md-typescale-label-large text-on-surface">Título do commit</span>
            <input
              v-model="commitTitle"
              type="text"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="feat: adiciona aula sobre integrais"
            />
            <span class="text-xs text-on-surface-variant">
              Resuma a alteração principal no formato convencional de mensagens de commit.
            </span>
          </label>

          <label class="flex flex-col md3-gap-xs">
            <span class="md-typescale-label-large text-on-surface">Branch base para o PR</span>
            <input
              v-model="baseBranchName"
              type="text"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="main"
            />
            <span class="text-xs text-on-surface-variant">
              Informe a branch padrão do repositório (ex.: <code>main</code>) usada como base do PR.
            </span>
          </label>

          <label class="flex flex-col md3-gap-xs">
            <span class="md-typescale-label-large text-on-surface">Responsável pela rodada</span>
            <input
              v-model="teacherActor"
              type="text"
              class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              placeholder="faculty.andre"
            />
            <span class="text-xs text-on-surface-variant">
              Nome ou identificador registrado na governança. Usado na auditoria do backend ao criar
              PRs.
            </span>
          </label>
        </div>

        <div
          v-if="teacherAutomationEnabled"
          class="flex flex-col md3-gap-md md-shape-extra-large md3-padding-md md-surface-container-high border border-outline-variant"
        >
          <div class="flex flex-col md3-gap-sm md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-on-surface">
              Peça para o serviço auxiliar criar ou alternar automaticamente para a branch informada
              a partir da <code>main</code> atualizada.
            </p>
            <Md3Button
              type="button"
              variant="filled"
              class="inline-flex items-center md3-gap-xs self-start md:self-auto"
              :disabled="gitCheckoutLoading"
              @click="createWorkingBranch"
            >
              <template #leading>
                <GitBranch class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              {{ gitCheckoutLoading ? 'Criando branch…' : 'Criar branch automaticamente' }}
            </Md3Button>
          </div>

          <div
            v-if="gitCheckoutError"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-error-container p-4 text-on-error-container"
          >
            <div class="flex items-start md3-gap-sm">
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
              class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitCheckoutOutput }}
            </pre>
          </div>

          <div
            v-else-if="gitCheckoutResult"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-success-container p-4 text-on-success-container"
          >
            <div class="flex items-start md3-gap-sm">
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
              class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
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
          class="md-shape-extra-large border border-outline-variant bg-[var(--md-sys-color-surface-container-high)] p-4 text-sm text-on-surface-variant"
        >
          Configure <code>VITE_TEACHER_API_URL</code> para criar a branch automaticamente pelo
          painel ou siga os comandos sugeridos abaixo.
        </p>

        <div
          v-if="teacherAutomationEnabled"
          class="flex flex-col md3-gap-md md-shape-extra-large md3-padding-md md-surface-container-high border border-outline-variant"
        >
          <div class="flex flex-col md3-gap-md md:flex-row md:items-start md:justify-between">
            <div class="flex flex-col md3-gap-xs">
              <p class="text-sm text-on-surface">
                Use os caminhos listados na seção de conteúdos para enviar os arquivos ao staging e
                gerar o commit automaticamente.
              </p>
              <p class="text-xs text-on-surface-variant">
                O serviço executa <code>git add</code> com os caminhos preenchidos e reutiliza o
                título de commit configurado acima.
              </p>
              <label class="mt-1 flex items-center md3-gap-xs text-xs text-on-surface">
                <input
                  id="publication-pr-draft-toggle"
                  v-model="prDraft"
                  type="checkbox"
                  class="h-4 w-4 rounded border border-outline text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                <span class="select-none"> Criar PR como rascunho ao acionar a automação </span>
              </label>
            </div>
            <div class="flex flex-col md3-gap-xs sm:flex-row sm:items-center">
              <Md3Button
                type="button"
                variant="tonal"
                class="inline-flex items-center md3-gap-xs"
                :disabled="gitStageLoading || artifactPaths.length === 0"
                @click="stageCurrentArtifacts"
              >
                {{ gitStageLoading ? 'Adicionando…' : 'Adicionar com git add' }}
              </Md3Button>
              <Md3Button
                type="button"
                variant="filled"
                class="inline-flex items-center md3-gap-xs"
                :disabled="gitCommitLoading"
                @click="commitCurrentArtifacts"
              >
                {{ gitCommitLoading ? 'Registrando commit…' : 'Gerar commit agora' }}
              </Md3Button>
              <Md3Button
                type="button"
                variant="filled"
                class="inline-flex items-center md3-gap-xs"
                :disabled="gitPushLoading || !canPushAutomatically"
                @click="pushCurrentBranch"
              >
                <template #leading>
                  <UploadCloud class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                {{ gitPushLoading ? 'Enviando branch…' : 'Enviar branch com git push' }}
              </Md3Button>
              <Md3Button
                type="button"
                variant="filled"
                class="inline-flex items-center md3-gap-xs"
                :disabled="prCreationLoading || !canCreatePullRequest"
                @click="createPullRequest"
              >
                <template #leading>
                  <GitPullRequest class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                {{ prCreationLoading ? 'Abrindo PR…' : 'Criar PR automaticamente' }}
              </Md3Button>
            </div>
          </div>

          <div
            class="md-shape-double-extra-large border border-outline bg-surface p-4 text-sm text-on-surface"
          >
            <p class="font-medium">Caminhos enviados para o git add automático:</p>
            <ul v-if="artifactPaths.length > 0" class="md3-stack-xs grid md3-gap-xs">
              <li
                v-for="path in artifactPaths"
                :key="path"
                class="rounded-xl bg-[var(--md-sys-color-surface-container-highest)] px-3 py-2 font-mono text-xs text-on-surface"
              >
                {{ path }}
              </li>
            </ul>
            <p v-else class="md3-stack-xs text-xs text-on-surface-variant">
              Preencha a seção “Conteúdos incluídos nesta rodada” para habilitar o git add
              automático.
            </p>
          </div>

          <div
            v-if="gitStageError"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-error-container p-4 text-on-error-container"
          >
            <div class="flex items-start md3-gap-sm">
              <AlertCircle class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ gitStageError }}</p>
                <p v-if="gitStageResult" class="text-xs">
                  Comando executado:
                  <code class="font-mono">{{ gitStageResult.command }}</code>
                </p>
              </div>
            </div>
            <pre
              v-if="gitStageOutput"
              class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitStageOutput }}
            </pre>
          </div>
          <div
            v-else-if="gitStageResult"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-success-container p-4 text-on-success-container"
          >
            <div class="flex items-start md3-gap-sm">
              <CheckCircle2 class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ gitStageSuccessMessage }}</p>
                <p class="text-xs">
                  Comando executado:
                  <code class="font-mono">{{ gitStageResult.command }}</code>
                </p>
              </div>
            </div>
            <pre
              v-if="gitStageOutput"
              class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitStageOutput }}
            </pre>
          </div>

          <div
            v-if="gitCommitError"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-error-container p-4 text-on-error-container"
          >
            <div class="flex items-start md3-gap-sm">
              <AlertCircle class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ gitCommitError }}</p>
                <p class="text-xs">
                  Comando executado:
                  <code class="font-mono">{{
                    gitCommitResult?.command ?? `git commit -m "${sanitizedCommitTitle}"`
                  }}</code>
                </p>
                <p v-if="gitCommitSkippedMessage" class="text-xs">{{ gitCommitSkippedMessage }}</p>
                <p v-if="gitCommitResult?.stage && !gitCommitResult.stage.success" class="text-xs">
                  git add executado com:
                  <code class="font-mono">{{ gitCommitResult.stage.command }}</code>
                </p>
              </div>
            </div>
            <pre
              v-if="gitCommitOutput"
              class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitCommitOutput }}
            </pre>
          </div>
          <div
            v-else-if="gitCommitResult"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-success-container p-4 text-on-success-container"
          >
            <div class="flex items-start md3-gap-sm">
              <CheckCircle2 class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ gitCommitSuccessMessage }}</p>
                <p class="text-xs">
                  Comando executado:
                  <code class="font-mono">{{ gitCommitResult.command }}</code>
                </p>
              </div>
            </div>
            <pre
              v-if="gitCommitOutput"
              class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitCommitOutput }}
            </pre>
          </div>

          <div
            v-if="gitPushError"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-error-container p-4 text-on-error-container"
          >
            <div class="flex items-start md3-gap-sm">
              <AlertCircle class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ gitPushError }}</p>
                <p v-if="gitPushResult" class="text-xs">
                  Comando executado:
                  <code class="font-mono">{{ gitPushResult.command }}</code>
                </p>
              </div>
            </div>
            <pre
              v-if="gitPushOutput"
              class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitPushOutput }}
            </pre>
          </div>
          <div
            v-else-if="gitPushResult"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-success-container p-4 text-on-success-container"
          >
            <div class="flex items-start md3-gap-sm">
              <CheckCircle2 class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ gitPushSuccessMessage }}</p>
                <p class="text-xs">
                  Comando executado:
                  <code class="font-mono">{{ gitPushResult.command }}</code>
                </p>
              </div>
            </div>
            <pre
              v-if="gitPushOutput"
              class="md-shape-double-extra-large bg-surface p-3 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ gitPushOutput }}
            </pre>
          </div>

          <p class="text-xs text-on-surface-variant">
            O serviço executa <code>{{ gitPushCommandPreview }}</code
            >. {{ gitPushBehaviorHint }}
          </p>

          <p class="text-xs text-on-surface-variant">
            Revise o diff local após executar o commit automático e antes de enviar a branch para o
            repositório remoto.
          </p>

          <div
            v-if="prCreationError"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-error-container p-4 text-on-error-container"
          >
            <div class="flex items-start md3-gap-sm">
              <AlertCircle class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ prCreationError }}</p>
                <p v-if="prCreationResult?.command" class="text-xs">
                  Chamada equivalente:
                  <code class="font-mono">{{ prCreationResult.command }}</code>
                </p>
              </div>
            </div>
          </div>
          <div
            v-else-if="prCreationResult"
            class="flex flex-col md3-gap-sm md-shape-double-extra-large bg-success-container p-4 text-on-success-container"
          >
            <div class="flex items-start md3-gap-sm">
              <CheckCircle2 class="md-icon md-icon--sm" aria-hidden="true" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium">{{ prCreationSuccessMessage }}</p>
                <p class="text-xs">
                  Repositório: {{ prCreationResult.repository }} · Base:
                  {{ prCreationResult.base }}
                </p>
                <a
                  v-if="prCreationLink"
                  :href="prCreationLink"
                  target="_blank"
                  rel="noreferrer"
                  class="text-xs font-medium underline"
                >
                  Abrir PR no GitHub
                </a>
              </div>
            </div>
          </div>

          <p class="text-xs text-on-surface-variant">
            O backend usa um token protegido para criar o PR via API do GitHub. Comando equivalente:
            <code class="font-mono">{{ prCommandPreview }}</code>
          </p>
        </div>

        <label class="flex flex-col md3-gap-xs">
          <span class="md-typescale-label-large text-on-surface">Descrição do PR</span>
          <textarea
            v-model="prDescription"
            rows="4"
            class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="Liste aulas, exercícios e componentes ajustados nesta rodada."
          ></textarea>
          <span class="text-xs text-on-surface-variant">
            Este texto será usado no corpo sugerido do PR para facilitar a revisão cruzada.
          </span>
        </label>

        <fieldset
          class="md-shape-extra-large md3-padding-md md-surface-container-high border border-outline-variant"
        >
          <legend class="md-typescale-label-large px-2 text-on-surface">
            Validações obrigatórias
          </legend>
          <p class="md-typescale-body-small text-on-surface-variant">
            Marque quais scripts precisam ser executados antes do commit. Eles aparecerão no pacote
            de comandos.
          </p>
          <div class="md3-stack-md grid md3-gap-sm md:grid-cols-2">
            <label
              v-for="step in validationSteps"
              :key="step.key"
              class="flex cursor-pointer items-start md3-gap-sm md-shape-double-extra-large border border-transparent bg-surface p-4 shadow-sm transition hover:border-primary"
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
                  class="md3-stack-xs inline-flex w-fit rounded-xl bg-[var(--md-sys-color-surface-container-highest)] px-2 py-1 text-xs text-on-surface-variant"
                >
                  {{ step.command }}
                </code>
              </div>
            </label>
          </div>
        </fieldset>
      </section>

      <section class="card md3-surface-section flex flex-col md3-gap-lg">
        <header class="flex flex-col md3-gap-xs">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Conteúdos incluídos nesta rodada
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Relacione aulas, exercícios ou componentes que farão parte do commit. Estes dados são
            usados para gerar o resumo sugerido.
          </p>
        </header>

        <div class="flex flex-col md3-gap-md">
          <article
            v-for="artifact in artifacts"
            :key="artifact.id"
            class="md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant"
          >
            <div class="flex flex-col md3-gap-md lg:flex-row lg:items-end lg:justify-between">
              <div class="grid flex-1 md3-gap-md md:grid-cols-2">
                <label class="flex flex-col md3-gap-xs">
                  <span class="md-typescale-label-large text-on-surface">Tipo de conteúdo</span>
                  <select
                    v-model="artifact.type"
                    class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
                <label class="flex flex-col md3-gap-xs">
                  <span class="md-typescale-label-large text-on-surface"
                    >Caminho ou identificação</span
                  >
                  <input
                    v-model="artifact.path"
                    type="text"
                    class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    placeholder="src/content/courses/calculo-1/lessons/limites.json"
                  />
                </label>
              </div>
              <Md3Button
                type="button"
                variant="text"
                class="self-start text-error"
                @click="removeArtifact(artifact.id)"
              >
                <template #leading>
                  <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                Remover
              </Md3Button>
            </div>

            <label class="md3-stack-md flex flex-col md3-gap-xs">
              <span class="md-typescale-label-large text-on-surface">Resumo do ajuste</span>
              <textarea
                v-model="artifact.summary"
                rows="3"
                class="md-shape-extra-large border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Ex.: Revisão de exemplos práticos e atualização de objetivos de aprendizagem."
              ></textarea>
            </label>
          </article>
        </div>

        <Md3Button type="button" variant="tonal" class="self-start" @click="addArtifact">
          <template #leading>
            <Plus class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Adicionar conteúdo
        </Md3Button>
      </section>

      <section class="card md3-surface-section flex flex-col md3-gap-lg">
        <header class="flex flex-col md3-gap-xs">
          <h2 class="md-typescale-title-large font-semibold text-on-surface">
            Pacote de comandos e resumo sugerido
          </h2>
          <p class="supporting-text text-on-surface-variant">
            Copie os comandos gerados para garantir consistência com os guardrails do repositório e
            reutilize o resumo no PR.
          </p>
        </header>

        <div class="grid md3-gap-lg xl:grid-cols-2">
          <article
            class="flex flex-col md3-gap-md md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant"
          >
            <header class="flex items-center justify-between">
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Comandos sugeridos
              </h3>
              <Md3Button type="button" variant="text" @click="copyCommands">
                <template #leading>
                  <Copy class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                {{ copyLabel }}
              </Md3Button>
            </header>
            <pre
              class="md-shape-double-extra-large bg-surface p-4 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
            >
$ {{ gitCommands.join('\n$ ') }}
            </pre>
          </article>

          <article
            class="flex flex-col md3-gap-md md-shape-extra-large md3-padding-md md-surface-container-highest border border-outline-variant"
          >
            <header>
              <h3 class="md-typescale-title-medium font-semibold text-on-surface">
                Resumo para o PR
              </h3>
            </header>
            <pre
              class="md-shape-double-extra-large bg-surface p-4 font-mono text-xs text-on-surface shadow-inner"
              aria-live="polite"
              >{{ prPreview }}
            </pre>
          </article>
        </div>

        <section
          class="md-shape-extra-large md3-padding-md md-surface-container-high border border-outline-variant"
        >
          <h3 class="md-typescale-title-medium font-semibold text-on-surface">Checklist final</h3>
          <ul class="md3-stack-sm list-disc md3-space-y-xs pl-5 text-sm text-on-surface">
            <li v-for="item in checklistItems" :key="item">{{ item }}</li>
          </ul>
        </section>
      </section>
    </TeacherModeGate>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  GitBranch,
  GitPullRequest,
  Plus,
  RefreshCcw,
  Trash2,
  UploadCloud,
} from 'lucide-vue-next';
import TeacherModeGate from '../../components/TeacherModeGate.vue';
import Md3Button from '@/components/Md3Button.vue';
import {
  TeacherAutomationError,
  checkoutTeacherGitBranch,
  createTeacherPullRequest,
  commitTeacherGitChanges,
  fetchTeacherGitStatus,
  fetchTeacherGitUpdates,
  pushTeacherGitBranch,
  stageTeacherGitPaths,
  teacherAutomationEnabled,
  type TeacherGitCheckoutResult,
  type TeacherGitCommitResult,
  type TeacherGitFetchResult,
  type TeacherGitPushResult,
  type TeacherGitStageResult,
  type TeacherGitStatus,
  type TeacherPullRequestResult,
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

const ACTOR_STORAGE_KEY = 'faculty.publication.actor';
const BASE_BRANCH_STORAGE_KEY = 'faculty.publication.base-branch';

const branchName = ref('');
const baseBranchName = ref('main');
const commitTitle = ref('');
const prDescription = ref('');
const teacherActor = ref('');
const prDraft = ref(false);
const copyLabel = ref('Copiar comandos');

const prCreationLoading = ref(false);
const prCreationError = ref<string | null>(null);
const prCreationResult = ref<TeacherPullRequestResult | null>(null);

const gitStatus = ref<TeacherGitStatus | null>(null);
const gitStatusError = ref<string | null>(null);
const gitStatusLoading = ref(false);
const gitFetchResult = ref<TeacherGitFetchResult | null>(null);
const gitFetchError = ref<string | null>(null);
const gitFetchLoading = ref(false);
const gitCheckoutResult = ref<TeacherGitCheckoutResult | null>(null);
const gitCheckoutError = ref<string | null>(null);
const gitCheckoutLoading = ref(false);
const gitStageResult = ref<TeacherGitStageResult | null>(null);
const gitStageError = ref<string | null>(null);
const gitStageLoading = ref(false);
const gitCommitResult = ref<TeacherGitCommitResult | null>(null);
const gitCommitError = ref<string | null>(null);
const gitCommitLoading = ref(false);
const gitPushResult = ref<TeacherGitPushResult | null>(null);
const gitPushError = ref<string | null>(null);
const gitPushLoading = ref(false);

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

const gitStageOutput = computed(() => {
  if (!gitStageResult.value) {
    return '';
  }

  const stdout = gitStageResult.value.stdout?.trim?.() ?? '';
  const stderr = gitStageResult.value.stderr?.trim?.() ?? '';
  return [stdout, stderr].filter(Boolean).join('\n');
});

const gitStageSuccessMessage = computed(() => {
  if (!gitStageResult.value?.success) {
    return '';
  }

  if (gitStageResult.value.all) {
    return 'git add --all executado com sucesso.';
  }

  if (gitStageResult.value.paths.length > 0) {
    return `Arquivos adicionados ao staging: ${gitStageResult.value.paths.join(', ')}`;
  }

  return 'git add executado com sucesso.';
});

const gitCommitOutput = computed(() => {
  if (!gitCommitResult.value) {
    return '';
  }

  const stdout = gitCommitResult.value.stdout?.trim?.() ?? '';
  const stderr = gitCommitResult.value.stderr?.trim?.() ?? '';
  return [stdout, stderr].filter(Boolean).join('\n');
});

const gitCommitSuccessMessage = computed(() => {
  if (!gitCommitResult.value?.success) {
    return '';
  }

  const subject = gitCommitResult.value.messageParts?.[0] ?? gitCommitResult.value.message;
  return `Commit criado com a mensagem: ${subject}`;
});

const gitCommitSkippedMessage = computed(() => {
  if (!gitCommitResult.value?.skipped) {
    return '';
  }

  return 'Commit não executado porque o git add automático falhou.';
});

const gitPushOutput = computed(() => {
  if (!gitPushResult.value) {
    return '';
  }

  const stdout = gitPushResult.value.stdout?.trim?.() ?? '';
  const stderr = gitPushResult.value.stderr?.trim?.() ?? '';
  return [stdout, stderr].filter(Boolean).join('\n');
});

const gitPushSuccessMessage = computed(() => {
  if (!gitPushResult.value?.success) {
    return '';
  }

  const branch = gitPushResult.value.branch;
  const remote = gitPushResult.value.remote;
  if (branch && remote) {
    return gitPushResult.value.setUpstream
      ? `Branch ${branch} enviada para ${remote} com upstream configurado.`
      : `Branch ${branch} enviada para ${remote}.`;
  }

  return 'git push executado com sucesso.';
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

async function stageCurrentArtifacts() {
  if (!teacherAutomationEnabled) {
    gitStageError.value =
      'Serviço de automação não configurado. Defina VITE_TEACHER_API_URL para habilitar o git add automático.';
    return;
  }

  const paths = artifactPaths.value;
  if (paths.length === 0) {
    gitStageError.value =
      'Preencha ao menos um caminho na seção de conteúdos para enviar ao staging automaticamente.';
    return;
  }

  gitStageLoading.value = true;
  gitStageError.value = null;
  gitStageResult.value = null;

  try {
    const result = await stageTeacherGitPaths({ paths });
    gitStageResult.value = result;

    if (!result.success) {
      const stderrMessage = result.stderr?.trim?.() ?? '';
      const stdoutMessage = result.stdout?.trim?.() ?? '';
      gitStageError.value =
        stderrMessage || stdoutMessage || 'Não foi possível adicionar os arquivos ao staging.';
    } else {
      gitStageError.value = null;
    }

    if (result.status) {
      gitStatus.value = result.status;
    } else if (result.success) {
      await refreshGitStatus();
    }
  } catch (error) {
    gitStageResult.value = null;
    if (error instanceof TeacherAutomationError) {
      gitStageError.value = error.message;
    } else if (error instanceof Error) {
      gitStageError.value = error.message;
    } else {
      gitStageError.value = 'Falha inesperada ao executar git add.';
    }
  } finally {
    gitStageLoading.value = false;
  }
}

async function commitCurrentArtifacts() {
  if (!teacherAutomationEnabled) {
    gitCommitError.value =
      'Serviço de automação não configurado. Defina VITE_TEACHER_API_URL para habilitar commits automáticos.';
    return;
  }

  gitCommitLoading.value = true;
  gitCommitError.value = null;
  gitCommitResult.value = null;

  try {
    const result = await commitTeacherGitChanges({
      message: sanitizedCommitTitle.value,
      stagePaths: artifactPaths.value,
    });

    gitCommitResult.value = result;

    if (!result.success) {
      if (result.skipped && result.stage && !result.stage.success) {
        const stderrMessage = result.stage.stderr?.trim?.() ?? '';
        const stdoutMessage = result.stage.stdout?.trim?.() ?? '';
        gitCommitError.value =
          stderrMessage ||
          stdoutMessage ||
          'Não foi possível adicionar os arquivos ao staging antes do commit.';
        gitStageError.value =
          stderrMessage || stdoutMessage || 'Não foi possível adicionar os arquivos ao staging.';
      } else {
        const stderrMessage = result.stderr?.trim?.() ?? '';
        const stdoutMessage = result.stdout?.trim?.() ?? '';
        gitCommitError.value =
          stderrMessage || stdoutMessage || 'Não foi possível concluir o commit solicitado.';
      }
    } else {
      gitCommitError.value = null;
    }

    if (result.stage) {
      gitStageResult.value = result.stage;
      if (result.stage.success) {
        gitStageError.value = null;
      }
    }

    if (result.status) {
      gitStatus.value = result.status;
    } else {
      await refreshGitStatus();
    }
  } catch (error) {
    gitCommitResult.value = null;
    if (error instanceof TeacherAutomationError) {
      gitCommitError.value = error.message;
    } else if (error instanceof Error) {
      gitCommitError.value = error.message;
    } else {
      gitCommitError.value = 'Falha inesperada ao executar git commit.';
    }
  } finally {
    gitCommitLoading.value = false;
  }
}

async function pushCurrentBranch() {
  if (!teacherAutomationEnabled) {
    gitPushError.value =
      'Serviço de automação não configurado. Defina VITE_TEACHER_API_URL para habilitar git push automático.';
    return;
  }

  const branch = gitPushBranchCandidate.value;
  if (!branch) {
    gitPushError.value =
      'Informe o nome da branch na seção acima ou consulte o status do Git antes de enviar com git push.';
    return;
  }

  gitPushLoading.value = true;
  gitPushError.value = null;
  gitPushResult.value = null;

  try {
    const result = await pushTeacherGitBranch({
      remote: 'origin',
      branch,
      setUpstream: !gitStatus.value?.upstream,
    });

    gitPushResult.value = result;

    if (!result.success) {
      const stderrMessage = result.stderr?.trim?.() ?? '';
      const stdoutMessage = result.stdout?.trim?.() ?? '';
      gitPushError.value =
        stderrMessage || stdoutMessage || 'Não foi possível enviar a branch ao repositório remoto.';
    } else {
      gitPushError.value = null;
    }

    if (result.status) {
      gitStatus.value = result.status;
    } else if (result.success) {
      await refreshGitStatus();
    }
  } catch (error) {
    gitPushResult.value = null;
    if (error instanceof TeacherAutomationError) {
      gitPushError.value = error.message;
    } else if (error instanceof Error) {
      gitPushError.value = error.message;
    } else {
      gitPushError.value = 'Falha inesperada ao executar git push.';
    }
  } finally {
    gitPushLoading.value = false;
  }
}

async function createPullRequest() {
  if (!teacherAutomationEnabled) {
    prCreationError.value =
      'Serviço de automação não configurado. Defina VITE_TEACHER_API_URL para habilitar abertura automática de PRs.';
    return;
  }

  if (!hasBranchInput.value) {
    prCreationError.value =
      'Informe o nome da branch de trabalho antes de criar o pull request automaticamente.';
    return;
  }

  if (!hasCommitInput.value) {
    prCreationError.value =
      'Defina o título do commit; ele também será usado como sugestão para o título do PR.';
    return;
  }

  prCreationLoading.value = true;
  prCreationError.value = null;
  prCreationResult.value = null;

  try {
    const result = await createTeacherPullRequest({
      title: prTitle.value,
      body: prBodyForSubmission.value,
      head: sanitizedBranch.value,
      base: sanitizedBaseBranch.value,
      remote: 'origin',
      draft: prDraft.value,
      actor: sanitizedActor.value || null,
    });

    prCreationResult.value = result;

    if (!result.success) {
      prCreationError.value =
        result.message || 'Não foi possível criar o pull request automaticamente.';
    } else {
      prCreationError.value = null;
    }
  } catch (error) {
    prCreationResult.value = null;
    if (error instanceof TeacherAutomationError) {
      prCreationError.value = error.message;
    } else if (error instanceof Error) {
      prCreationError.value = error.message;
    } else {
      prCreationError.value = 'Falha inesperada ao criar o pull request.';
    }
  } finally {
    prCreationLoading.value = false;
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const storedActor = window.localStorage.getItem(ACTOR_STORAGE_KEY);
    if (typeof storedActor === 'string') {
      teacherActor.value = storedActor;
    }
    const storedBase = window.localStorage.getItem(BASE_BRANCH_STORAGE_KEY);
    if (typeof storedBase === 'string' && storedBase.trim().length > 0) {
      baseBranchName.value = storedBase;
    }
  }

  if (teacherAutomationEnabled) {
    refreshGitStatus();
  }
});

watch(teacherActor, (value) => {
  if (typeof window === 'undefined') return;
  const normalized = value.trim();
  if (normalized) {
    window.localStorage.setItem(ACTOR_STORAGE_KEY, normalized);
  } else {
    window.localStorage.removeItem(ACTOR_STORAGE_KEY);
  }
});

watch(baseBranchName, (value) => {
  if (typeof window === 'undefined') return;
  const normalized = value.trim();
  if (normalized) {
    window.localStorage.setItem(BASE_BRANCH_STORAGE_KEY, normalized);
  } else {
    window.localStorage.removeItem(BASE_BRANCH_STORAGE_KEY);
  }
});

watch([branchName, commitTitle, prDescription, prDraft, baseBranchName], () => {
  prCreationResult.value = null;
  prCreationError.value = null;
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

const sanitizedBranch = computed(() => branchName.value.trim() || 'feat/faculty-publication');
const sanitizedCommitTitle = computed(
  () => commitTitle.value.trim() || 'chore: preparar pacote de publicação'
);
const sanitizedBaseBranch = computed(() => baseBranchName.value.trim() || 'main');
const sanitizedActor = computed(() => teacherActor.value.trim());

const gitPushBranchCandidate = computed(() => {
  const explicit = branchName.value.trim();
  if (explicit) {
    return explicit;
  }

  const statusBranchRaw = gitStatus.value?.branch ?? '';
  if (typeof statusBranchRaw === 'string') {
    const trimmed = statusBranchRaw.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return '';
});

const canPushAutomatically = computed(() => gitPushBranchCandidate.value.length > 0);

const gitPushCommandPreview = computed(() => {
  const branch = gitPushBranchCandidate.value;
  const hasUpstream = Boolean(gitStatus.value?.upstream);

  if (!branch) {
    return 'git push -u origin <branch>';
  }

  return hasUpstream ? `git push origin ${branch}` : `git push -u origin ${branch}`;
});

const gitPushBehaviorHint = computed(() => {
  if (gitStatus.value?.upstream) {
    return 'O upstream já está configurado; o serviço reaproveita essa configuração.';
  }

  return 'Sem upstream configurado, o serviço usa -u para definir o rastreamento automaticamente.';
});

const enabledValidations = computed(() => validationSteps.filter((step) => step.enabled));

const artifactPaths = computed(() =>
  artifacts.map((item) => item.path.trim()).filter((path) => path.length > 0)
);

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

  const filesToAdd = artifactPaths.value;

  if (filesToAdd.length > 0) {
    commands.push('git status');
    filesToAdd.forEach((path) => {
      commands.push(`git add ${path}`);
    });
  } else {
    commands.push('# Adicione aqui os caminhos alterados com git add');
  }

  commands.push(`git commit -m "${sanitizedCommitTitle.value}"`);
  commands.push(gitPushCommandPreview.value);
  commands.push('# Abra o PR pelo painel ou use o comando abaixo no terminal:');
  commands.push(prCommandPreview.value);

  return commands;
});

const prTitle = computed(
  () => commitTitle.value.trim() || 'feat: atualizar conteúdos no módulo for faculty'
);

const prBodyForSubmission = computed(() => {
  const summary =
    prDescription.value.trim() || 'Descreva as alterações principais realizadas nesta rodada.';
  const sections = ['## Resumo', summary];

  if (artifactSummaries.value.length > 0) {
    sections.push('', '### Conteúdos incluídos', ...artifactSummaries.value);
  }

  sections.push(
    '',
    '### Checklist',
    ...enabledValidations.value.map((step) => `- [ ] ${step.label} (${step.command})`)
  );

  if (sanitizedActor.value) {
    sections.push('', `> Rodada preparada por ${sanitizedActor.value}.`);
  }

  return sections.join('\n');
});

const prPreview = computed(() =>
  [`Título: ${prTitle.value}`, '', prBodyForSubmission.value].join('\n')
);

const safePrTitleForCommand = computed(() => {
  const normalized = prTitle.value.replace(/\s+/g, ' ').trim();
  const sanitized = normalized.replace(/"/g, '\\"');
  return sanitized || 'Atualizar conteúdos no módulo for faculty';
});

const prCommandPreview = computed(() => {
  const parts = [
    'gh pr create',
    `--title "${safePrTitleForCommand.value}"`,
    `--base ${sanitizedBaseBranch.value}`,
    `--head ${sanitizedBranch.value}`,
  ];
  if (prDraft.value) {
    parts.push('--draft');
  }
  parts.push('--web');
  return parts.join(' ');
});

const hasBranchInput = computed(() => branchName.value.trim().length > 0);
const hasCommitInput = computed(() => commitTitle.value.trim().length > 0);

const canCreatePullRequest = computed(
  () => teacherAutomationEnabled && hasBranchInput.value && hasCommitInput.value
);

const prCreationLink = computed(
  () => prCreationResult.value?.htmlUrl ?? prCreationResult.value?.url ?? null
);

const prCreationSuccessMessage = computed(() => {
  if (!prCreationResult.value?.success) {
    return '';
  }
  if (typeof prCreationResult.value.number === 'number' && prCreationResult.value.number > 0) {
    return `Pull request #${prCreationResult.value.number} criado com sucesso.`;
  }
  return 'Pull request criado com sucesso.';
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

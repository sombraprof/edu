import { computed, onMounted, reactive, ref, watch } from 'vue';

import {
  TeacherAutomationError,
  checkoutTeacherGitBranch,
  commitTeacherGitChanges,
  createTeacherPullRequest,
  fetchTeacherGitStatus,
  fetchTeacherGitUpdates,
  pushTeacherGitBranch,
  stageTeacherGitPaths,
  teacherAutomationEnabled as defaultAutomationEnabled,
  type TeacherGitCheckoutResult,
  type TeacherGitCommitResult,
  type TeacherGitFetchResult,
  type TeacherGitPushResult,
  type TeacherGitStageResult,
  type TeacherGitStatus,
  type TeacherPullRequestResult,
} from '../utils/automation';

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

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

type ClipboardLike = {
  writeText(text: string): Promise<void>;
};

type AutomationOverrides = {
  fetchStatus: typeof fetchTeacherGitStatus;
  fetchUpdates: typeof fetchTeacherGitUpdates;
  checkoutBranch: typeof checkoutTeacherGitBranch;
  stagePaths: typeof stageTeacherGitPaths;
  commitChanges: typeof commitTeacherGitChanges;
  pushBranch: typeof pushTeacherGitBranch;
  createPullRequest: typeof createTeacherPullRequest;
};

export interface UsePublicationWorkbenchOptions {
  automation?: Partial<AutomationOverrides>;
  automationEnabled?: boolean;
  storage?: StorageLike | null;
  clipboard?: ClipboardLike | null;
  autoLoadStatus?: boolean;
}

const ACTOR_STORAGE_KEY = 'faculty.publication.actor';
const BASE_BRANCH_STORAGE_KEY = 'faculty.publication.base-branch';

export function usePublicationWorkbench(options: UsePublicationWorkbenchOptions = {}) {
  const automation = {
    fetchStatus: options.automation?.fetchStatus ?? fetchTeacherGitStatus,
    fetchUpdates: options.automation?.fetchUpdates ?? fetchTeacherGitUpdates,
    checkoutBranch: options.automation?.checkoutBranch ?? checkoutTeacherGitBranch,
    stagePaths: options.automation?.stagePaths ?? stageTeacherGitPaths,
    commitChanges: options.automation?.commitChanges ?? commitTeacherGitChanges,
    pushBranch: options.automation?.pushBranch ?? pushTeacherGitBranch,
    createPullRequest: options.automation?.createPullRequest ?? createTeacherPullRequest,
  } as const;

  const automationEnabled = options.automationEnabled ?? defaultAutomationEnabled;
  const storage = options.storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
  const clipboard =
    options.clipboard ?? (typeof navigator !== 'undefined' ? navigator.clipboard : null);
  const autoLoadStatus = options.autoLoadStatus ?? true;

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
    () => automationEnabled && hasBranchInput.value && hasCommitInput.value
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

  async function refreshGitStatus() {
    if (!automationEnabled) {
      return;
    }

    gitStatusLoading.value = true;
    gitStatusError.value = null;

    try {
      gitStatus.value = await automation.fetchStatus();
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
    if (!automationEnabled) {
      return;
    }

    gitFetchLoading.value = true;
    gitFetchError.value = null;
    gitFetchResult.value = null;

    try {
      const result = await automation.fetchUpdates({ remote: 'origin', branch: 'main' });
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
    if (!automationEnabled) {
      gitCheckoutError.value =
        'Serviço de automação não configurado. Defina VITE_TEACHER_API_URL para habilitar a criação automática.';
      return;
    }

    gitCheckoutLoading.value = true;
    gitCheckoutError.value = null;
    gitCheckoutResult.value = null;

    try {
      const result = await automation.checkoutBranch({
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
    if (!automationEnabled) {
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
      const result = await automation.stagePaths({ paths });
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
    if (!automationEnabled) {
      gitCommitError.value =
        'Serviço de automação não configurado. Defina VITE_TEACHER_API_URL para habilitar commits automáticos.';
      return;
    }

    gitCommitLoading.value = true;
    gitCommitError.value = null;
    gitCommitResult.value = null;

    try {
      const result = await automation.commitChanges({
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
    if (!automationEnabled) {
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
      const result = await automation.pushBranch({
        remote: 'origin',
        branch,
        setUpstream: !gitStatus.value?.upstream,
      });

      gitPushResult.value = result;

      if (!result.success) {
        const stderrMessage = result.stderr?.trim?.() ?? '';
        const stdoutMessage = result.stdout?.trim?.() ?? '';
        gitPushError.value =
          stderrMessage ||
          stdoutMessage ||
          'Não foi possível enviar a branch ao repositório remoto.';
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
    if (!automationEnabled) {
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
      const result = await automation.createPullRequest({
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

  async function copyCommands() {
    const payload = gitCommands.value.join('\n');

    if (!clipboard) {
      copyLabel.value = 'Não foi possível copiar';
      setTimeout(() => {
        copyLabel.value = 'Copiar comandos';
      }, 2000);
      return;
    }

    try {
      await clipboard.writeText(payload);
      copyLabel.value = 'Copiado!';
    } catch (error) {
      copyLabel.value = 'Não foi possível copiar';
    }

    setTimeout(() => {
      copyLabel.value = 'Copiar comandos';
    }, 2000);
  }

  onMounted(() => {
    if (storage) {
      const storedActor = storage.getItem(ACTOR_STORAGE_KEY);
      if (typeof storedActor === 'string') {
        teacherActor.value = storedActor;
      }
      const storedBase = storage.getItem(BASE_BRANCH_STORAGE_KEY);
      if (typeof storedBase === 'string' && storedBase.trim().length > 0) {
        baseBranchName.value = storedBase;
      }
    }

    if (automationEnabled && autoLoadStatus) {
      void refreshGitStatus();
    }
  });

  watch(teacherActor, (value) => {
    if (!storage) return;
    const normalized = value.trim();
    if (normalized) {
      storage.setItem(ACTOR_STORAGE_KEY, normalized);
    } else {
      storage.removeItem(ACTOR_STORAGE_KEY);
    }
  });

  watch(baseBranchName, (value) => {
    if (!storage) return;
    const normalized = value.trim();
    if (normalized) {
      storage.setItem(BASE_BRANCH_STORAGE_KEY, normalized);
    } else {
      storage.removeItem(BASE_BRANCH_STORAGE_KEY);
    }
  });

  watch([branchName, commitTitle, prDescription, prDraft, baseBranchName], () => {
    prCreationResult.value = null;
    prCreationError.value = null;
  });

  return {
    teacherAutomationEnabled: automationEnabled,
    branchName,
    baseBranchName,
    commitTitle,
    prDescription,
    teacherActor,
    prDraft,
    copyLabel,
    prCreationLoading,
    prCreationError,
    prCreationResult,
    gitStatus,
    gitStatusError,
    gitStatusLoading,
    gitFetchResult,
    gitFetchError,
    gitFetchLoading,
    gitCheckoutResult,
    gitCheckoutError,
    gitCheckoutLoading,
    gitStageResult,
    gitStageError,
    gitStageLoading,
    gitCommitResult,
    gitCommitError,
    gitCommitLoading,
    gitPushResult,
    gitPushError,
    gitPushLoading,
    gitBranchSummary,
    gitUpstreamSummary,
    gitDivergenceSummary,
    gitFetchOutput,
    gitFetchSuccessMessage,
    gitCheckoutOutput,
    gitCheckoutSuccessMessage,
    gitStageOutput,
    gitStageSuccessMessage,
    gitCommitOutput,
    gitCommitSuccessMessage,
    gitCommitSkippedMessage,
    gitPushOutput,
    gitPushSuccessMessage,
    refreshGitStatus,
    verifyMainUpdates,
    createWorkingBranch,
    stageCurrentArtifacts,
    commitCurrentArtifacts,
    pushCurrentBranch,
    createPullRequest,
    artifactTypeOptions,
    artifacts,
    validationSteps,
    addArtifact,
    removeArtifact,
    sanitizedBranch,
    sanitizedCommitTitle,
    sanitizedBaseBranch,
    sanitizedActor,
    gitPushBranchCandidate,
    canPushAutomatically,
    gitPushCommandPreview,
    gitPushBehaviorHint,
    enabledValidations,
    artifactPaths,
    artifactSummaries,
    gitCommands,
    prTitle,
    prBodyForSubmission,
    prPreview,
    prCommandPreview,
    hasBranchInput,
    hasCommitInput,
    canCreatePullRequest,
    prCreationLink,
    prCreationSuccessMessage,
    checklistItems,
    copyCommands,
  } as const;
}

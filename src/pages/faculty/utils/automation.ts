import type { ValidationReportKey, ValidationScriptKey } from './validationScripts';

const rawBaseUrl = (import.meta.env.VITE_TEACHER_API_URL ?? '').trim();
export const teacherAutomationBaseUrl = rawBaseUrl.replace(/\/$/, '');
export const teacherAutomationEnabled = teacherAutomationBaseUrl.length > 0;

const rawToken = (import.meta.env.VITE_TEACHER_API_TOKEN ?? '').trim();
export const teacherAutomationToken = rawToken.length > 0 ? rawToken : null;

export class TeacherAutomationError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'TeacherAutomationError';
  }
}

export interface TeacherScriptRunResult {
  key: ValidationScriptKey;
  command: string;
  exitCode: number;
  output: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  reportKey: ValidationReportKey | null;
  recordedAt?: string;
  success?: boolean;
  queuedAt?: string | null;
  queueDurationMs?: number | null;
  queuePosition?: number | null;
}

async function request(path: string, init?: RequestInit) {
  if (!teacherAutomationEnabled) {
    throw new TeacherAutomationError(
      'Serviço de automação do professor não configurado. Defina VITE_TEACHER_API_URL para habilitar.'
    );
  }

  const response = await fetch(`${teacherAutomationBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(teacherAutomationToken ? { 'X-Teacher-Token': teacherAutomationToken } : {}),
      ...(init?.headers instanceof Headers
        ? Object.fromEntries(init.headers.entries())
        : init?.headers),
    },
  });

  if (!response.ok) {
    let detail: unknown;
    let detailMessage = '';
    try {
      detail = await response.json();
    } catch (error) {
      try {
        detail = await response.text();
      } catch (_textError) {
        detail = undefined;
      }
    }

    if (typeof detail === 'string') {
      detailMessage = detail;
    } else if (detail && typeof detail === 'object') {
      const maybeError = (detail as { error?: string }).error;
      detailMessage = typeof maybeError === 'string' ? maybeError : JSON.stringify(detail);
    }

    if (response.status === 401) {
      const message =
        detailMessage ||
        'Autenticação obrigatória. Verifique o token configurado no serviço e em VITE_TEACHER_API_TOKEN.';
      throw new TeacherAutomationError(message, detail);
    }

    const message = detailMessage
      ? `Falha na chamada ao serviço (${response.status}). ${detailMessage}`
      : `Falha na chamada ao serviço (${response.status}).`;

    throw new TeacherAutomationError(message, detail);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new TeacherAutomationError('Resposta inválida recebida do serviço de automação.', error);
  }
}

export async function runTeacherScript(key: ValidationScriptKey) {
  const payload = await request('/api/teacher/scripts/run', {
    method: 'POST',
    body: JSON.stringify({ key }),
  });
  return payload as TeacherScriptRunResult;
}

export async function fetchTeacherReport<T>(reportKey: ValidationReportKey) {
  const data = await request(`/api/teacher/reports/${reportKey}`, {
    method: 'GET',
  });
  return data as T;
}

export interface TeacherScriptHistoryEntry extends TeacherScriptRunResult {
  recordedAt: string;
  success: boolean;
}

export async function fetchTeacherScriptHistory(params?: { key?: ValidationScriptKey }) {
  const search = params?.key ? `?key=${encodeURIComponent(params.key)}` : '';
  const payload = await request(`/api/teacher/scripts/history${search}`, { method: 'GET' });
  return payload as TeacherScriptHistoryEntry[];
}

export interface TeacherScriptSummary {
  key: ValidationScriptKey;
  command: string;
  description: string;
  reportKey: ValidationReportKey | null;
}

export async function listTeacherScripts() {
  const payload = await request('/api/teacher/scripts', { method: 'GET' });
  return payload as TeacherScriptSummary[];
}

export interface TeacherPullRequestResult {
  success: boolean;
  number: number | null;
  url: string | null;
  htmlUrl: string | null;
  head: string;
  base: string;
  draft: boolean;
  actor: string | null;
  repository: string;
  remote: string;
  createdAt: string | null;
  command: string;
  message?: string;
}

export async function createTeacherPullRequest(params: {
  title: string;
  body: string;
  head: string;
  base?: string;
  remote?: string;
  draft?: boolean;
  actor?: string | null;
  allowMaintainerEdit?: boolean;
}) {
  const headers: Record<string, string> = {};
  if (params.actor) {
    headers['X-Teacher-Actor'] = params.actor;
  }

  const payload = await request('/api/teacher/git/pull-request', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: params.title,
      body: params.body,
      head: params.head,
      base: params.base,
      remote: params.remote,
      draft: params.draft,
      allowMaintainerEdit: params.allowMaintainerEdit,
    }),
  });

  return payload as TeacherPullRequestResult;
}

export interface TeacherGitChange {
  status: string;
  path: string;
  renamedFrom: string | null;
  renamedTo: string | null;
}

export interface TeacherGitStatus {
  branch: string | null;
  upstream: string | null;
  ahead: number;
  behind: number;
  detached: boolean;
  clean: boolean;
  changes: TeacherGitChange[];
  raw: string;
}

export async function fetchTeacherGitStatus() {
  const payload = await request('/api/teacher/git/status', { method: 'GET' });
  return payload as TeacherGitStatus;
}

export interface TeacherGitFetchResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  remote: string;
  branch: string | null;
  command: string;
  status: TeacherGitStatus | null;
}

export async function fetchTeacherGitUpdates(params?: { remote?: string; branch?: string | null }) {
  const body: Record<string, string | null> = {};
  if (params?.remote) {
    body.remote = params.remote;
  }
  if (params) {
    if (params.branch === null) {
      body.branch = null;
    } else if (typeof params.branch === 'string') {
      body.branch = params.branch;
    }
  }

  const payload = await request('/api/teacher/git/fetch', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payload as TeacherGitFetchResult;
}

export interface TeacherGitCheckoutResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  branch: string;
  create: boolean;
  startPoint: string | null;
  command: string;
  status: TeacherGitStatus | null;
}

export async function checkoutTeacherGitBranch(params: {
  branch: string;
  create?: boolean;
  startPoint?: string | null;
}) {
  const body: Record<string, unknown> = {
    branch: params.branch,
  };

  if (typeof params.create === 'boolean') {
    body.create = params.create;
  }

  if (Object.prototype.hasOwnProperty.call(params, 'startPoint')) {
    body.startPoint = params.startPoint;
  }

  const payload = await request('/api/teacher/git/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payload as TeacherGitCheckoutResult;
}

export interface TeacherGitStageResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  paths: string[];
  all: boolean;
  command: string;
  status: TeacherGitStatus | null;
}

export async function stageTeacherGitPaths(params: { paths?: string[]; all?: boolean }) {
  const body: Record<string, unknown> = {};
  if (Array.isArray(params.paths)) {
    body.paths = params.paths;
  }
  if (typeof params.all === 'boolean') {
    body.all = params.all;
  }

  const payload = await request('/api/teacher/git/stage', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payload as TeacherGitStageResult;
}

export interface TeacherGitCommitResult {
  success: boolean;
  skipped: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  message: string;
  messageParts: string[];
  allowEmpty: boolean;
  stage: TeacherGitStageResult | null;
  status: TeacherGitStatus | null;
  command: string;
}

export async function commitTeacherGitChanges(params: {
  message: string;
  allowEmpty?: boolean;
  stagePaths?: string[];
}) {
  const body: Record<string, unknown> = {
    message: params.message,
  };

  if (typeof params.allowEmpty === 'boolean') {
    body.allowEmpty = params.allowEmpty;
  }

  if (Array.isArray(params.stagePaths)) {
    body.stagePaths = params.stagePaths;
  }

  const payload = await request('/api/teacher/git/commit', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payload as TeacherGitCommitResult;
}

export interface TeacherGitPushResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  remote: string;
  branch: string;
  setUpstream: boolean;
  command: string;
  status: TeacherGitStatus | null;
}

export async function pushTeacherGitBranch(params: {
  remote?: string;
  branch: string;
  setUpstream?: boolean;
}) {
  const body: Record<string, unknown> = {
    branch: params.branch,
  };

  if (typeof params.remote === 'string') {
    body.remote = params.remote;
  }

  if (typeof params.setUpstream === 'boolean') {
    body.setUpstream = params.setUpstream;
  }

  const payload = await request('/api/teacher/git/push', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payload as TeacherGitPushResult;
}

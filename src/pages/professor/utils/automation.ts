import type { ValidationReportKey, ValidationScriptKey } from './validationScripts';

const rawBaseUrl = (import.meta.env.VITE_TEACHER_API_URL ?? '').trim();
export const teacherAutomationBaseUrl = rawBaseUrl.replace(/\/$/, '');
export const teacherAutomationEnabled = teacherAutomationBaseUrl.length > 0;

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
      } catch (textError) {
        detail = undefined;
      }
    }

    if (typeof detail === 'string') {
      detailMessage = detail;
    } else if (detail && typeof detail === 'object') {
      const maybeError = (detail as { error?: string }).error;
      detailMessage = typeof maybeError === 'string' ? maybeError : JSON.stringify(detail);
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

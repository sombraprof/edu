import { afterEach, describe, expect, it, vi } from 'vitest';

async function importAutomationModule() {
  const module = await import('../teacherAutomation');
  return module;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('teacher automation utils', () => {
  it('desabilita chamadas quando a URL do serviço não está configurada', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', '');
    vi.stubEnv('VITE_TEACHER_API_TOKEN', '');
    const { teacherAutomationEnabled, runTeacherScript, TeacherAutomationError } =
      await importAutomationModule();

    expect(teacherAutomationEnabled).toBe(false);
    await expect(runTeacherScript('content')).rejects.toBeInstanceOf(TeacherAutomationError);
  });

  it('envia token de autenticação e corpo JSON ao executar scripts', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    vi.stubEnv('VITE_TEACHER_API_TOKEN', 'secret-token');

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ key: 'content', status: 'queued' }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { runTeacherScript } = await importAutomationModule();
    const result = await runTeacherScript('content');

    expect(fetchMock).toHaveBeenCalledWith('https://automation.local/api/teacher/scripts/run', {
      method: 'POST',
      body: JSON.stringify({ key: 'content' }),
      headers: {
        'Content-Type': 'application/json',
        'X-Teacher-Token': 'secret-token',
      },
    });
    expect(result).toMatchObject({ key: 'content', status: 'queued' });
  });

  it('propaga mensagem de erro retornada pelo serviço quando autenticado', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    vi.stubEnv('VITE_TEACHER_API_TOKEN', 'secret-token');

    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Token inválido' }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { runTeacherScript } = await importAutomationModule();

    await expect(runTeacherScript('observability')).rejects.toMatchObject({
      name: 'TeacherAutomationError',
      message: 'Token inválido',
      cause: { error: 'Token inválido' },
    });
  });

  it('usa corpo de texto quando a resposta não é JSON válido', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('invalid json');
      },
      text: async () => 'Falha inesperada',
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { fetchTeacherReport } = await importAutomationModule();

    await expect(fetchTeacherReport<'any'>('validation')).rejects.toMatchObject({
      name: 'TeacherAutomationError',
      message: 'Falha na chamada ao serviço (500). Falha inesperada',
      cause: 'Falha inesperada',
    });
  });

  it('retorna o JSON do serviço quando a chamada é bem-sucedida', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    const payload = { total: 4 };
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => payload,
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { fetchTeacherReport } = await importAutomationModule();
    const response = await fetchTeacherReport<typeof payload>('observability');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://automation.local/api/teacher/reports/observability',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    expect(response).toEqual(payload);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

async function importAutomationModule() {
  return await import('../teacherAutomation');
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe('teacher automation config', () => {
  it('remove barra final da URL configurada', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local/');
    const { teacherAutomationBaseUrl } = await importAutomationModule();
    expect(teacherAutomationBaseUrl).toBe('https://automation.local');
  });

  it('mantém string vazia quando a URL não está configurada', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', '');
    const { teacherAutomationBaseUrl } = await importAutomationModule();
    expect(teacherAutomationBaseUrl).toBe('');
  });

  it('retorna token ou null de acordo com a configuração', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');
    vi.stubEnv('VITE_TEACHER_API_TOKEN', 'secret-token');
    let module = await importAutomationModule();
    expect(module.teacherAutomationToken).toBe('secret-token');

    vi.resetModules();
    vi.stubEnv('VITE_TEACHER_API_TOKEN', '');
    module = await importAutomationModule();
    expect(module.teacherAutomationToken).toBeNull();
  });
});

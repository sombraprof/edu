import { afterEach, describe, expect, it, vi } from 'vitest';

async function importComposable() {
  const module = await import('../useTeacherMode');
  return module.useTeacherMode;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('useTeacherMode', () => {
  it('mantém desativado e limpa storage quando o backend está indisponível', async () => {
    window.localStorage.setItem('teacherMode', 'true');
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');
    vi.stubEnv('VITE_TEACHER_API_URL', '');

    const useTeacherMode = await importComposable();
    const composable = useTeacherMode();

    expect(composable.teacherMode.value).toBe(false);
    expect(composable.isTeacherModeReady.value).toBe(true);
    expect(window.localStorage.getItem('teacherMode')).toBeNull();

    composable.enableTeacherMode();

    expect(composable.teacherMode.value).toBe(false);
    expect(window.localStorage.getItem('teacherMode')).toBeNull();
  });

  it('restaura e persiste o estado manual quando o backend está disponível', async () => {
    window.localStorage.setItem('teacherMode', 'true');
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://teacher.local');

    const useTeacherMode = await importComposable();
    const composable = useTeacherMode();

    expect(composable.teacherMode.value).toBe(true);
    expect(composable.isTeacherModeReady.value).toBe(true);

    composable.disableTeacherMode();
    expect(composable.teacherMode.value).toBe(true);
    expect(window.localStorage.getItem('teacherMode')).toBe('true');

    composable.enableTeacherMode();
    expect(composable.teacherMode.value).toBe(true);
    expect(window.localStorage.getItem('teacherMode')).toBe('true');
  });

  it('ativa pelo query string quando manual authoring está habilitado', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://teacher.local');
    window.history.replaceState({}, '', '/lesson?teacher=1#detalhes');

    const useTeacherMode = await importComposable();
    const composable = useTeacherMode();

    expect(composable.teacherMode.value).toBe(true);
    expect(window.location.search).toBe('?teacher=1');
  });

  it('ignora o query string quando manual authoring está desabilitado', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_TEACHER_MODE_ENABLED', 'true');
    vi.stubEnv('VITE_TEACHER_API_URL', '');
    window.history.replaceState({}, '', '/lesson?teacher=1');

    const useTeacherMode = await importComposable();
    const composable = useTeacherMode();

    expect(composable.teacherMode.value).toBe(false);
    expect(window.location.search).toBe('?teacher=1');
  });
});

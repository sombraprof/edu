import { nextTick, ref, shallowRef, watch, type ComputedRef, type Ref } from 'vue';
import { teacherAutomationBaseUrl, teacherAutomationToken } from './teacherAutomation';

class TeacherContentServiceError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'TeacherContentServiceError';
  }
}

function cloneJson<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch (_error) {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

function serialize(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

const teacherContentBaseUrl = teacherAutomationBaseUrl;
export const teacherContentServiceEnabled = teacherContentBaseUrl.length > 0;

async function teacherContentRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!teacherContentServiceEnabled) {
    throw new TeacherContentServiceError(
      'Serviço de automação do professor indisponível. Execute "npm run dev:teacher" ou defina VITE_TEACHER_API_URL.'
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(teacherAutomationToken ? { 'X-Teacher-Token': teacherAutomationToken } : {}),
  };

  if (init?.headers instanceof Headers) {
    for (const [key, value] of init.headers.entries()) {
      headers[key] = value;
    }
  } else if (init?.headers) {
    Object.assign(headers, init.headers as Record<string, string>);
  }

  const response = await fetch(`${teacherContentBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let detail: unknown;
    let message = '';
    try {
      detail = await response.json();
    } catch (_error) {
      try {
        detail = await response.text();
      } catch (_textError) {
        detail = undefined;
      }
    }

    if (typeof detail === 'string') {
      message = detail;
    } else if (detail && typeof detail === 'object' && 'error' in detail) {
      const errorValue = (detail as { error?: unknown }).error;
      message = typeof errorValue === 'string' ? errorValue : '';
    }

    const suffix = message ? ` ${message}` : '';
    throw new TeacherContentServiceError(
      `Falha ao acessar o serviço de automação (${response.status}).${suffix}`.trim(),
      detail
    );
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new TeacherContentServiceError(
      'Resposta inválida recebida do serviço de automação.',
      error
    );
  }
}

interface TeacherContentResponse<TRaw> {
  path: string;
  content: TRaw;
  savedAt?: string;
}

export interface TeacherContentEditorOptions<TModel, TRaw> {
  path: ComputedRef<string | null>;
  model: Ref<TModel | null>;
  setModel: (value: TModel | null) => void;
  fromRaw: (raw: TRaw) => TModel;
  toRaw: (model: TModel, base: TRaw | null) => TRaw;
  debounceMs?: number;
}

export interface TeacherContentEditorState {
  loading: ReturnType<typeof ref<boolean>>;
  saving: ReturnType<typeof ref<boolean>>;
  loadError: ReturnType<typeof ref<string | null>>;
  saveError: ReturnType<typeof ref<string | null>>;
  successMessage: ReturnType<typeof ref<string | null>>;
  hasPendingChanges: Ref<boolean>;
  revertChanges: () => void;
  refresh: () => Promise<void>;
  serviceAvailable: boolean;
}

export function useTeacherContentEditor<TModel, TRaw>(
  options: TeacherContentEditorOptions<TModel, TRaw>
): TeacherContentEditorState {
  const loading = ref(false);
  const saving = ref(false);
  const loadError = ref<string | null>(null);
  const saveError = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  const snapshotRaw = shallowRef<TRaw | null>(null);
  const snapshotSerialized = ref('');

  const pendingRaw = shallowRef<TRaw | null>(null);
  const pendingSerialized = ref<string | null>(null);

  const hasPendingChanges = ref(false);
  let currentPath: string | null = null;
  let ignoreNextChange = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function clearTimer() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }

  function resetModel(model: TModel | null, raw: TRaw | null) {
    ignoreNextChange = true;
    options.setModel(model);
    void nextTick(() => {
      ignoreNextChange = false;
    });
    snapshotRaw.value = raw ? cloneJson(raw) : null;
    snapshotSerialized.value = raw ? serialize(raw) : '';
    hasPendingChanges.value = false;
  }

  async function loadContent(path: string | null) {
    clearTimer();
    pendingRaw.value = null;
    pendingSerialized.value = null;
    currentPath = path;
    saveError.value = null;
    successMessage.value = null;

    if (!path) {
      loadError.value = null;
      resetModel(null, null);
      return;
    }

    if (!teacherContentServiceEnabled) {
      loadError.value =
        'Serviço de automação não configurado. Execute "npm run dev:teacher" ou defina VITE_TEACHER_API_URL.';
      resetModel(null, null);
      return;
    }

    loading.value = true;
    try {
      const response = await teacherContentRequest<TeacherContentResponse<TRaw>>(
        `/api/teacher/content?path=${encodeURIComponent(path)}`,
        { method: 'GET' }
      );

      const raw = response?.content;
      if (!raw || typeof raw !== 'object') {
        throw new TeacherContentServiceError('O serviço retornou um payload inválido.');
      }

      const rawSnapshot = cloneJson(raw);
      const model = options.fromRaw(cloneJson(rawSnapshot));
      loadError.value = null;
      resetModel(model, rawSnapshot);
    } catch (error) {
      const message =
        error instanceof TeacherContentServiceError
          ? error.message
          : 'Não foi possível carregar o arquivo solicitado.';
      console.error('[useTeacherContentEditor] Falha ao carregar conteúdo:', error);
      loadError.value = message;
      resetModel(null, null);
    } finally {
      loading.value = false;
    }
  }

  async function persistPending() {
    if (!currentPath || saving.value) {
      return;
    }
    const rawToSave = pendingRaw.value;
    const serializedToSave = pendingSerialized.value;
    if (!rawToSave || !serializedToSave) {
      return;
    }

    pendingRaw.value = null;
    pendingSerialized.value = null;
    saving.value = true;
    try {
      const response = await teacherContentRequest<TeacherContentResponse<TRaw>>(
        '/api/teacher/content',
        {
          method: 'PUT',
          body: JSON.stringify({ path: currentPath, content: rawToSave }),
        }
      );

      const snapshot = cloneJson(rawToSave);
      snapshotRaw.value = snapshot;
      snapshotSerialized.value = serializedToSave;
      hasPendingChanges.value = false;

      const savedAt = typeof response?.savedAt === 'string' ? response.savedAt : null;
      if (savedAt) {
        try {
          const savedDate = new Date(savedAt);
          successMessage.value = `Alterações salvas às ${savedDate.toLocaleTimeString()}.`;
        } catch (_error) {
          successMessage.value = 'Alterações salvas com sucesso.';
        }
      } else {
        successMessage.value = 'Alterações salvas com sucesso.';
      }
      saveError.value = null;
    } catch (error) {
      const message =
        error instanceof TeacherContentServiceError
          ? error.message
          : 'Não foi possível salvar o arquivo solicitado.';
      console.error('[useTeacherContentEditor] Falha ao salvar conteúdo:', error);
      saveError.value = message;
      hasPendingChanges.value = true;
      pendingRaw.value = rawToSave;
      pendingSerialized.value = serializedToSave;
    } finally {
      saving.value = false;
    }

    if (pendingRaw.value && pendingSerialized.value) {
      clearTimer();
      const delay = options.debounceMs ?? 800;
      debounceTimer = setTimeout(() => {
        void persistPending();
      }, delay);
    }
  }

  function scheduleSave(raw: TRaw, serialized: string) {
    pendingRaw.value = raw;
    pendingSerialized.value = serialized;
    successMessage.value = null;
    saveError.value = null;
    clearTimer();
    const delay = options.debounceMs ?? 800;
    debounceTimer = setTimeout(() => {
      void persistPending();
    }, delay);
  }

  watch(
    options.path,
    (nextPath) => {
      void loadContent(nextPath);
    },
    { immediate: true }
  );

  watch(
    () => options.model.value,
    (value) => {
      if (ignoreNextChange) {
        return;
      }
      if (!currentPath || !value || !snapshotRaw.value) {
        clearTimer();
        hasPendingChanges.value = false;
        return;
      }

      const base = cloneJson(snapshotRaw.value);
      const raw = options.toRaw(cloneJson(value), base);
      const serialized = serialize(raw);
      const hasChanged = serialized !== snapshotSerialized.value;
      hasPendingChanges.value = hasChanged;
      if (!hasChanged) {
        clearTimer();
        return;
      }

      scheduleSave(raw, serialized);
    },
    { deep: true }
  );

  function revertChanges() {
    if (!snapshotRaw.value) {
      return;
    }
    const rawClone = cloneJson(snapshotRaw.value);
    const model = options.fromRaw(cloneJson(rawClone));
    saveError.value = null;
    successMessage.value = null;
    resetModel(model, rawClone);
  }

  async function refresh() {
    await loadContent(currentPath);
  }

  return {
    loading,
    saving,
    loadError,
    saveError,
    successMessage,
    hasPendingChanges,
    revertChanges,
    refresh,
    serviceAvailable: teacherContentServiceEnabled,
  };
}

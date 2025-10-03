import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import type { ValidationScriptKey } from './validationScripts';

export type ValidationCheckStatus = 'pending' | 'success' | 'warning' | 'error';

export interface ValidationStatusEntry {
  status: ValidationCheckStatus;
  description: string;
  updatedAt: string | null;
}

export type ValidationStatusMap = Record<ValidationScriptKey, ValidationStatusEntry>;

const STORAGE_KEY = 'faculty.validation.status';

const defaultEntry: ValidationStatusEntry = {
  status: 'pending',
  description: 'Aguardando execução do script.',
  updatedAt: null,
};

function createDefaultStatusMap(): ValidationStatusMap {
  return {
    content: { ...defaultEntry },
    report: { ...defaultEntry },
    observability: { ...defaultEntry },
    governance: { ...defaultEntry },
  };
}

function sanitizeEntry(value: unknown): ValidationStatusEntry {
  if (!value || typeof value !== 'object') return { ...defaultEntry };
  const { status, description, updatedAt } = value as Partial<ValidationStatusEntry>;
  const normalizedStatus: ValidationCheckStatus =
    status === 'success' || status === 'warning' || status === 'error' ? status : 'pending';
  return {
    status: normalizedStatus,
    description:
      typeof description === 'string' && description.trim().length > 0
        ? description
        : defaultEntry.description,
    updatedAt: typeof updatedAt === 'string' ? updatedAt : null,
  };
}

function readFromStorage(): ValidationStatusMap {
  if (typeof window === 'undefined') return createDefaultStatusMap();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultStatusMap();
  try {
    const parsed = JSON.parse(raw) as Partial<Record<ValidationScriptKey, unknown>>;
    return {
      content: sanitizeEntry(parsed.content),
      report: sanitizeEntry(parsed.report),
      observability: sanitizeEntry(parsed.observability),
      governance: sanitizeEntry(parsed.governance),
    } satisfies ValidationStatusMap;
  } catch (error) {
    console.warn('[validationStatus] Falha ao ler estado persistido', error);
    return createDefaultStatusMap();
  }
}

export function persistValidationStatuses(statuses: ValidationStatusMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  } catch (error) {
    console.warn('[validationStatus] Não foi possível persistir o status de validação', error);
  }
}

export function useValidationStatuses(): Ref<ValidationStatusMap> {
  const state = ref<ValidationStatusMap>(readFromStorage());

  function handleStorage(event: StorageEvent) {
    if (event.storageArea !== window.localStorage) return;
    if (event.key && event.key !== STORAGE_KEY) return;
    state.value = readFromStorage();
  }

  onMounted(() => {
    state.value = readFromStorage();
    window.addEventListener('storage', handleStorage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('storage', handleStorage);
  });

  return state;
}

export function hasBlockingValidation(statuses: ValidationStatusMap) {
  return Object.values(statuses).some((entry) => entry.status === 'error');
}

export function formatUpdatedAt(value: string | null) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    return null;
  }
}

export { STORAGE_KEY as VALIDATION_STATUS_STORAGE_KEY };

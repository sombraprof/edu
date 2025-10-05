import { computed, ref, watch, type Ref } from 'vue';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

type SaveSignals = {
  saving: Ref<boolean>;
  hasPendingChanges: Ref<boolean>;
  saveError: Ref<string | null>;
};

export function useAuthoringSaveTracker(target: Ref<unknown>, signals: SaveSignals) {
  const lastSavedAt = ref<string>('');

  watch(
    () => target.value,
    () => {
      lastSavedAt.value = '';
    }
  );

  const previous = { saving: false, pending: false };

  watch(
    () => ({
      saving: signals.saving.value,
      pending: signals.hasPendingChanges.value,
      error: signals.saveError.value,
    }),
    ({ saving, pending, error }) => {
      if (pending && !previous.pending) {
        lastSavedAt.value = '';
      }

      const completedSave = !saving && !pending && !error && (previous.saving || previous.pending);

      if (completedSave) {
        lastSavedAt.value = new Date().toLocaleTimeString();
      }

      previous.saving = saving;
      previous.pending = pending;
    },
    { immediate: true }
  );

  const status = computed<SaveStatus>(() => {
    if (signals.saveError.value) {
      return 'error';
    }
    if (signals.saving.value) {
      return 'saving';
    }
    if (signals.hasPendingChanges.value) {
      return 'pending';
    }
    if (lastSavedAt.value) {
      return 'saved';
    }
    return 'idle';
  });

  const statusLabel = computed(() => {
    switch (status.value) {
      case 'saving':
        return 'Salvando alterações…';
      case 'error':
        return signals.saveError.value ?? 'Erro ao salvar alterações.';
      case 'pending':
        return 'Alterações pendentes';
      case 'saved':
        return lastSavedAt.value
          ? `Alterações salvas às ${lastSavedAt.value}`
          : 'Alterações salvas';
      default:
        return 'Sem alterações pendentes';
    }
  });

  const statusTone = computed(() => {
    switch (status.value) {
      case 'saving':
      case 'pending':
        return 'text-warning';
      case 'error':
        return 'text-error';
      case 'saved':
        return 'text-success';
      default:
        return 'text-on-surface-variant';
    }
  });

  return {
    status,
    statusLabel,
    statusTone,
    lastSavedAt,
  };
}

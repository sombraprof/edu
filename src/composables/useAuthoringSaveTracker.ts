import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue';

type SaveStatus = 'idle' | 'pending' | 'saved';

export function useAuthoringSaveTracker(target: Ref<unknown>) {
  const status = ref<SaveStatus>('idle');
  const lastSavedAt = ref<string>('');
  let skipNextChange = true;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  watch(
    () => target.value,
    () => {
      skipNextChange = true;
      status.value = 'idle';
      lastSavedAt.value = '';
    }
  );

  watch(
    () => target.value,
    () => {
      if (skipNextChange) {
        skipNextChange = false;
        return;
      }

      status.value = 'pending';
      clearTimer();
      timer = setTimeout(() => {
        status.value = 'saved';
        lastSavedAt.value = new Date().toLocaleTimeString();
      }, 600);
    },
    { deep: true }
  );

  onBeforeUnmount(() => {
    clearTimer();
  });

  const statusLabel = computed(() => {
    switch (status.value) {
      case 'pending':
        return 'Salvando alterações…';
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
      case 'pending':
        return 'text-warning';
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

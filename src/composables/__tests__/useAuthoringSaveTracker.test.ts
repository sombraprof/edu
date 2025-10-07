import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import { useAuthoringSaveTracker } from '../useAuthoringSaveTracker';

describe('useAuthoringSaveTracker', () => {
  it('acompanha as transições de idle até saved', async () => {
    const target = ref({});
    const saving = ref(false);
    const hasPendingChanges = ref(false);
    const saveError = ref<string | null>(null);

    const tracker = useAuthoringSaveTracker(target, {
      saving,
      hasPendingChanges,
      saveError,
    });

    expect(tracker.status.value).toBe('idle');

    hasPendingChanges.value = true;
    await nextTick();

    expect(tracker.status.value).toBe('pending');
    expect(tracker.statusLabel.value).toBe('Alterações pendentes');

    saving.value = true;
    await nextTick();

    expect(tracker.status.value).toBe('saving');
    expect(tracker.statusLabel.value).toBe('Salvando alterações…');
    expect(tracker.statusTone.value).toBe('text-warning');

    hasPendingChanges.value = false;
    saving.value = false;
    await nextTick();

    expect(tracker.status.value).toBe('saved');
    expect(tracker.statusLabel.value).toContain('Alterações salvas');
    expect(tracker.lastSavedAt.value).not.toBe('');
    expect(tracker.statusTone.value).toBe('text-success');

    hasPendingChanges.value = true;
    await nextTick();

    expect(tracker.status.value).toBe('pending');
    expect(tracker.lastSavedAt.value).toBe('');
  });

  it('prioriza o estado de erro quando o salvamento falha', async () => {
    const target = ref({});
    const saving = ref(false);
    const hasPendingChanges = ref(false);
    const saveError = ref<string | null>(null);

    const tracker = useAuthoringSaveTracker(target, {
      saving,
      hasPendingChanges,
      saveError,
    });

    hasPendingChanges.value = true;
    await nextTick();

    saving.value = true;
    await nextTick();

    saveError.value = 'Não foi possível salvar o arquivo solicitado.';
    saving.value = false;
    await nextTick();

    expect(tracker.status.value).toBe('error');
    expect(tracker.statusLabel.value).toBe('Não foi possível salvar o arquivo solicitado.');
    expect(tracker.statusTone.value).toBe('text-error');
    expect(tracker.lastSavedAt.value).toBe('');
  });
});

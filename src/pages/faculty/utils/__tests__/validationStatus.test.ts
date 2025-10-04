import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { nextTick, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import {
  persistValidationStatuses,
  useValidationStatuses,
  hasBlockingValidation,
  formatUpdatedAt,
  VALIDATION_STATUS_STORAGE_KEY,
} from '../validationStatus';
import type { ValidationStatusMap } from '../validationStatus';

function setStatus(value: ValidationStatusMap) {
  window.localStorage.setItem(VALIDATION_STATUS_STORAGE_KEY, JSON.stringify(value));
}

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('validationStatus utils', () => {
  it('persiste e lê o status armazenado', () => {
    const map: ValidationStatusMap = {
      content: { status: 'success', description: 'Ok', updatedAt: '2024-07-01T10:00:00Z' },
      report: { status: 'warning', description: 'Revisar', updatedAt: null },
      observability: {
        status: 'error',
        description: 'Faltam metadados',
        updatedAt: '2024-07-02T12:00:00Z',
      },
      governance: {
        status: 'pending',
        description: 'Aguardando execução do script.',
        updatedAt: null,
      },
    };

    persistValidationStatuses(map);
    const raw = window.localStorage.getItem(VALIDATION_STATUS_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(String(raw))).toMatchObject(map);
  });

  it('sincroniza com localStorage e responde ao evento storage', async () => {
    const TestHarness = defineComponent({
      setup() {
        const state = useValidationStatuses();
        return { state };
      },
      template: '<div />',
    });

    const wrapper = mount(TestHarness);
    await nextTick();

    expect(wrapper.vm.state.content.status).toBe('pending');

    setStatus({
      content: { status: 'success', description: 'Ok', updatedAt: '2024-01-01T00:00:00Z' },
      report: { status: 'pending', description: 'Aguardando execução do script.', updatedAt: null },
      observability: {
        status: 'pending',
        description: 'Aguardando execução do script.',
        updatedAt: null,
      },
      governance: {
        status: 'pending',
        description: 'Aguardando execução do script.',
        updatedAt: null,
      },
    } as ValidationStatusMap);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: VALIDATION_STATUS_STORAGE_KEY,
        storageArea: window.localStorage,
      })
    );
    await nextTick();

    expect(wrapper.vm.state.content.status).toBe('success');
    expect(wrapper.vm.state.content.updatedAt).toBe('2024-01-01T00:00:00Z');

    wrapper.unmount();
  });

  it('detecta bloqueio quando algum script tem status error', () => {
    const statuses: ValidationStatusMap = {
      content: { status: 'error', description: '', updatedAt: null },
      report: { status: 'success', description: '', updatedAt: null },
      observability: { status: 'warning', description: '', updatedAt: null },
      governance: { status: 'pending', description: '', updatedAt: null },
    };

    expect(hasBlockingValidation(statuses)).toBe(true);
  });

  it('formata data para pt-BR e retorna null para entradas inválidas', () => {
    const formatted = formatUpdatedAt('2024-07-01T10:00:00Z');
    expect(formatted).toMatch(/01\/07\/2024|01\/07\/24/);

    expect(formatUpdatedAt(null)).toBeNull();
    expect(formatUpdatedAt('valor-invalido')).toBeNull();
  });
});

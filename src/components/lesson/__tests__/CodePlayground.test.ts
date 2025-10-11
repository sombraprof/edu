import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { loader } from '@monaco-editor/loader';
import CodePlayground from '../CodePlayground.vue';

vi.mock('@monaco-editor/loader', () => {
  return {
    loader: {
      init: vi.fn(),
      config: vi.fn(),
    },
  };
});

function createMonacoStub() {
  let currentValue = '';
  const model = {};
  const disposables: Array<{ dispose: () => void }> = [];
  const editorInstance = {
    onDidChangeModelContent: vi.fn((_callback: () => void) => {
      disposables.push({ dispose: vi.fn() });
      return disposables[disposables.length - 1];
    }),
    getValue: vi.fn(() => currentValue),
    setValue: vi.fn((value: string) => {
      currentValue = value;
    }),
    getModel: vi.fn(() => model),
    dispose: vi.fn(),
  };

  const monaco = {
    editor: {
      create: vi.fn((_, options: { value?: string }) => {
        currentValue = options?.value ?? '';
        return editorInstance;
      }),
      setModelLanguage: vi.fn(),
    },
  };

  return { monaco, editorInstance } as const;
}

async function waitForFallback(wrapper: VueWrapper) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (wrapper.find('.code-playground__textarea').exists()) {
      return;
    }
    await flushPromises();
    await wrapper.vm.$nextTick();
  }
}

describe('CodePlayground', () => {
  const mockedLoader = loader as unknown as {
    init: ReturnType<typeof vi.fn> & ((...args: unknown[]) => Promise<unknown>);
    config: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockedLoader.init.mockReset();
    mockedLoader.config.mockClear();
  });

  it('executa código JavaScript e exibe a saída capturada', async () => {
    const { monaco } = createMonacoStub();
    mockedLoader.init.mockResolvedValue(monaco);

    const wrapper = mount(CodePlayground, {
      props: {
        data: {
          type: 'codePlayground',
          language: 'javascript',
          initialCode: "print('Execução de teste');",
        },
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const runButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Executar'));
    expect(runButton).toBeTruthy();

    await runButton!.trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.code-playground__log code').text()).toContain('Execução de teste');
    expect(wrapper.find('.code-playground__error').exists()).toBe(false);
  });

  it('exibe fallback quando o worker falhar e ainda permite executar código', async () => {
    mockedLoader.init.mockRejectedValue(new Error('Worker indisponível'));

    const wrapper = mount(CodePlayground, {
      props: {
        data: {
          type: 'codePlayground',
          language: 'typescript',
          initialCode: "const mensagem: string = 'Fallback ok';\nprint(mensagem);",
        },
      },
    });

    await waitForFallback(wrapper);
    expect(mockedLoader.init).toHaveBeenCalled();
    expect(wrapper.find('.code-playground__textarea').exists()).toBe(true);

    const runButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Executar'));
    await runButton!.trigger('click');
    await flushPromises();

    expect(wrapper.find('.code-playground__log code').text()).toContain('Fallback ok');
  });
});

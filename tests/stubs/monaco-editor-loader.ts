interface Disposable {
  dispose(): void;
}

interface MockModel {
  value: string;
  language: string;
  getValue(): string;
}

interface MockEditor {
  getValue(): string;
  setValue(next: string): void;
  onDidChangeModelContent(handler: () => void): Disposable;
  getModel(): MockModel;
  dispose(): void;
}

function createMockEditor(initialValue: string, initialLanguage: string): MockEditor {
  let value = initialValue;
  let language = initialLanguage;
  const listeners = new Set<() => void>();

  const model: MockModel = {
    get value() {
      return value;
    },
    set value(next: string) {
      value = next;
    },
    get language() {
      return language;
    },
    set language(next: string) {
      language = next;
    },
    getValue() {
      return value;
    },
  } as MockModel;

  return {
    getValue: () => value,
    setValue(next: string) {
      value = next;
      listeners.forEach((listener) => listener());
    },
    onDidChangeModelContent(handler: () => void) {
      listeners.add(handler);
      return {
        dispose() {
          listeners.delete(handler);
        },
      };
    },
    getModel: () => model,
    dispose() {
      listeners.clear();
    },
  };
}

function createMonaco(initialValue: string, initialLanguage: string) {
  const editor = createMockEditor(initialValue, initialLanguage);

  return {
    editor: {
      create(_container: HTMLElement, options?: { value?: string; language?: string }) {
        if (typeof options?.value === 'string') {
          editor.setValue(options.value);
        }
        if (typeof options?.language === 'string') {
          const model = editor.getModel();
          model.language = options.language;
        }
        return editor;
      },
      setModelLanguage(model: MockModel, nextLanguage: string) {
        model.language = nextLanguage;
      },
    },
  };
}

let monacoFactory: (() => Promise<unknown>) | null = null;

export const loader = {
  config(options: { monaco?: () => Promise<unknown> } = {}) {
    monacoFactory = options.monaco ?? null;
  },
  async init() {
    if (monacoFactory) {
      const monacoModule = await monacoFactory();
      return (monacoModule as { default?: unknown }).default ?? monacoModule;
    }
    return createMonaco('', 'javascript');
  },
};

export default loader;

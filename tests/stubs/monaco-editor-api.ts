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

export function createEditor(initialValue = '', language = 'javascript') {
  return createMockEditor(initialValue, language);
}

export const editor = {
  create(container: HTMLElement, options?: { value?: string; language?: string }) {
    container.setAttribute('data-monaco-mounted', 'true');
    return createMockEditor(options?.value ?? '', options?.language ?? 'javascript');
  },
  setModelLanguage(model: MockModel, nextLanguage: string) {
    model.language = nextLanguage;
  },
};

export default {
  editor,
};

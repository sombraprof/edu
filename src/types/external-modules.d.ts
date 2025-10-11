declare module '@monaco-editor/loader' {
  type MonacoApi = typeof import('monaco-editor/esm/vs/editor/editor.api');

  interface MonacoLoader {
    init(): Promise<MonacoApi>;
    config(
      options: {
        monaco?: () => Promise<MonacoApi>;
        paths?: Record<string, string>;
      } & Record<string, unknown>
    ): void;
  }

  const loader: MonacoLoader;
  export default loader;
  export { loader };
}

declare module 'monaco-editor/esm/vs/editor/editor.api' {
  export * from 'monaco-editor';
}

declare module 'fabric' {
  export type FabricCanvas = {
    dispose(): void;
    loadFromJSON(json: unknown, callback?: () => void): void;
    renderAll(): void;
    clear(): void;
    setWidth(width: number): void;
    setHeight(height: number): void;
    setBackgroundColor(color: string, callback?: () => void): void;
    toJSON(properties?: string[]): unknown;
    isDrawingMode: boolean;
    freeDrawingBrush?: { color: string; width: number };
  };

  export type FabricModule = {
    Canvas: new (element: HTMLCanvasElement, options?: Record<string, unknown>) => FabricCanvas;
    [key: string]: unknown;
  };

  export const fabric: FabricModule;
  const module: FabricModule & { fabric: FabricModule };
  export default module;
}

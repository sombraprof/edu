/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'lottie-web' {
  export interface AnimationItem {
    play(): void;
    pause(): void;
    stop(): void;
    destroy(): void;
    setSpeed(speed: number): void;
    addEventListener(event: string, callback: (...args: unknown[]) => void): void;
    removeEventListener(event: string, callback: (...args: unknown[]) => void): void;
  }

  export interface AnimationConfig {
    container: Element;
    renderer?: 'svg' | 'canvas' | 'html';
    loop?: boolean | number;
    autoplay?: boolean;
    name?: string;
    animationData?: unknown;
    path?: string;
    rendererSettings?: Record<string, unknown>;
  }

  export function loadAnimation(config: AnimationConfig): AnimationItem;
  export function destroy(name?: string): void;
  export function setQuality(value: string | number): void;

  const lottie: {
    loadAnimation: typeof loadAnimation;
    destroy: typeof destroy;
    setQuality: typeof setQuality;
  };

  export default lottie;
}

declare module 'echarts' {
  export interface ECharts {
    setOption(option: unknown, notMerge?: boolean): void;
    resize(): void;
    dispose(): void;
  }

  export interface EChartsInitOpts {
    devicePixelRatio?: number;
    renderer?: 'canvas' | 'svg';
    useDirtyRect?: boolean;
  }

  export function init(
    dom: HTMLElement,
    theme?: string | Record<string, unknown>,
    opts?: EChartsInitOpts
  ): ECharts;
}

declare module '@google/model-viewer';

declare module 'd3-force' {
  export interface SimulationNodeDatum {
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number;
    fy?: number;
    [key: string]: unknown;
  }

  export type Simulation<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum> = {
    force(name: string, force: unknown): Simulation<NodeDatum>;
    alpha(value: number): Simulation<NodeDatum>;
    restart(): Simulation<NodeDatum>;
    stop(): Simulation<NodeDatum>;
    on(event: 'tick' | 'end', listener: () => void): Simulation<NodeDatum>;
    tick?(): void;
  };

  export function forceSimulation<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum>(
    nodes?: NodeDatum[]
  ): Simulation<NodeDatum>;

  export function forceManyBody<NodeDatum extends SimulationNodeDatum = SimulationNodeDatum>(): {
    strength(value: number): unknown;
  };

  export function forceLink(links?: unknown[]): {
    id(accessor: (node: SimulationNodeDatum) => string | number): unknown;
    distance(value: number): unknown;
  };

  export function forceCenter(x?: number, y?: number): unknown;

  export function forceCollide(): {
    radius(value: number): unknown;
  };
}

declare module 'monaco-editor/esm/vs/editor/editor.api' {
  export * from 'monaco-editor';
}

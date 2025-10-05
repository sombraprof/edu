let prismInstance: typeof import('prismjs') | null = null;
let prismLoader: Promise<typeof import('prismjs')> | null = null;

async function ensurePrism(): Promise<typeof import('prismjs')> {
  if (prismInstance) {
    return prismInstance;
  }

  if (!prismLoader) {
    prismLoader = (async () => {
      const core = await import('prismjs');
      const Prism =
        (core as { default?: typeof import('prismjs') }).default ??
        (core as typeof import('prismjs'));
      const globalWithPrism = globalThis as typeof globalThis & {
        Prism?: typeof import('prismjs');
      };
      if (!globalWithPrism.Prism) {
        globalWithPrism.Prism = Prism;
      }

      await Promise.all([
        import('prismjs/components/prism-markup'),
        import('prismjs/components/prism-javascript'),
        import('prismjs/components/prism-typescript'),
        import('prismjs/components/prism-python'),
        import('prismjs/components/prism-json'),
        import('prismjs/components/prism-java'),
        import('prismjs/components/prism-c'),
        import('prismjs/components/prism-cpp'),
        import('prismjs/components/prism-csharp'),
        import('prismjs/components/prism-kotlin'),
      ]);

      return Prism;
    })();
  }

  prismInstance = await prismLoader;
  return prismInstance;
}

export type PrismHighlightHandler = (context?: unknown) => Promise<void> | void;

export function createPrismHighlightHandler(): PrismHighlightHandler {
  return async () => {
    const Prism = await ensurePrism();
    requestAnimationFrame(() => {
      Prism.highlightAll();
    });
  };
}

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

export interface PrismHighlightContext {
  root?: Element | null;
  targets?: Element | Iterable<Element | null | undefined> | null;
}

export type PrismHighlightHandler = (context?: unknown) => Promise<void> | void;

function toElementList(
  targets: Element | Iterable<Element | null | undefined> | null | undefined
): Element[] {
  if (!targets) {
    return [];
  }

  if (targets instanceof Element) {
    return [targets];
  }

  const list: Element[] = [];
  for (const entry of targets) {
    if (entry instanceof Element) {
      list.push(entry);
    }
  }
  return list;
}

function parseContext(context: unknown): PrismHighlightContext {
  if (!context || typeof context !== 'object') {
    return {};
  }

  const candidate = context as PrismHighlightContext;
  const root = candidate.root instanceof Element ? candidate.root : null;
  const targets = toElementList(candidate.targets ?? null);
  return {
    root,
    targets,
  };
}

export function createPrismHighlightHandler(): PrismHighlightHandler {
  let lastRoot: Element | null = null;

  return async (context?: unknown) => {
    const Prism = await ensurePrism();
    const { root, targets } = parseContext(context);

    if (root) {
      lastRoot = root;
    }

    const highlightRoot = root ?? lastRoot;
    const highlightTargets = targets;

    requestAnimationFrame(() => {
      if (highlightTargets.length > 0) {
        highlightTargets.forEach((element) => {
          Prism.highlightElement(element);
        });
        return;
      }

      if (highlightRoot && typeof Prism.highlightAllUnder === 'function') {
        Prism.highlightAllUnder(highlightRoot);
        return;
      }

      Prism.highlightAll();
    });
  };
}

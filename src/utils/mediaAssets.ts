import type { AnimationItem } from 'lottie-web';

type Loader<T> = () => Promise<T>;

type LoaderMap = Map<string, Loader<string>>;

type LottieModule = typeof import('lottie-web');

export type PictureSource = {
  srcset: string;
  type?: string;
  media?: string;
  sizes?: string;
};

export interface AssetPreload {
  href: string;
  as: 'image';
  type?: string;
  media?: string;
}

export interface BuildSrcSetResult {
  src: string;
  srcset?: string;
  sources: PictureSource[];
  sizes?: string;
  preloads: AssetPreload[];
}

export interface BuildSrcSetOptions {
  include?: Array<'avif' | 'webp' | 'original'>;
  preload?: Array<'avif' | 'webp' | 'original'>;
}

export interface RegisterLottieOptions {
  container: HTMLElement;
  src: string;
  autoplay?: boolean;
  loop?: boolean | number;
  renderer?: 'svg' | 'canvas' | 'html';
  name?: string;
  hoverToPlay?: boolean;
  onReady?(animation: AnimationItem): void;
  onError?(error: unknown): void;
}

export interface LottieRegistration {
  animation: AnimationItem | null;
  destroy(): void;
  play(): void;
  pause(): void;
}

export const RESPONSIVE_WIDTHS = '360;640;960;1280;1600';
export const PRELOAD_WIDTH = '1600';

const contentAssetModules = import.meta.glob(
  '../content/**/*.{png,jpg,jpeg,webp,avif,gif,svg,glb,gltf,usdz,hdr,json}',
  {
    import: 'default',
  }
);
const internalAssetModules = import.meta.glob(
  '../assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg,glb,gltf,usdz,hdr,json}',
  {
    import: 'default',
  }
);

const contentSrcsetModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'responsive' },
});
const internalSrcsetModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'responsive' },
});

const contentWebpModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'responsive', format: 'webp' },
});
const internalWebpModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'responsive', format: 'webp' },
});

const contentAvifModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'responsive', format: 'avif' },
});
const internalAvifModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'responsive', format: 'avif' },
});

const contentPreloadOriginalModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'preload' },
});
const internalPreloadOriginalModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'preload' },
});

const contentPreloadWebpModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'preload', format: 'webp' },
});
const internalPreloadWebpModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'preload', format: 'webp' },
});

const contentPreloadAvifModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'preload', format: 'avif' },
});
const internalPreloadAvifModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { preset: 'preload', format: 'avif' },
});

const baseAssetLoaders = mergeLoaders([contentAssetModules, internalAssetModules]);
const srcsetLoaders = mergeLoaders([contentSrcsetModules, internalSrcsetModules]);
const webpLoaders = mergeLoaders([contentWebpModules, internalWebpModules]);
const avifLoaders = mergeLoaders([contentAvifModules, internalAvifModules]);
const preloadOriginalLoaders = mergeLoaders([
  contentPreloadOriginalModules,
  internalPreloadOriginalModules,
]);
const preloadWebpLoaders = mergeLoaders([contentPreloadWebpModules, internalPreloadWebpModules]);
const preloadAvifLoaders = mergeLoaders([contentPreloadAvifModules, internalPreloadAvifModules]);

const assetUrlMap = createLoaderMap(baseAssetLoaders);
const originalSrcsetMap = createLoaderMap(srcsetLoaders);
const webpSrcsetMap = createLoaderMap(webpLoaders);
const avifSrcsetMap = createLoaderMap(avifLoaders);
const preloadOriginalMap = createLoaderMap(preloadOriginalLoaders);
const preloadWebpMap = createLoaderMap(preloadWebpLoaders);
const preloadAvifMap = createLoaderMap(preloadAvifLoaders);

let lottieModulePromise: Promise<LottieModule> | null = null;

export function isExternalUrl(value: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:');
}

export async function resolveAsset(raw: string): Promise<string> {
  const trimmed = raw.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (isExternalUrl(trimmed)) {
    return trimmed;
  }

  const normalized = normalizeRequestPath(trimmed);
  if (!normalized) {
    return trimmed;
  }

  const loader = assetUrlMap.get(normalized);
  if (loader) {
    try {
      const url = await loader();
      if (typeof url === 'string' && url.length > 0) {
        return url;
      }
    } catch (error) {
      console.warn('Failed to resolve asset URL via import for', trimmed, error);
    }
  }

  if (normalized.startsWith('public/')) {
    const relative = normalized.slice('public/'.length);
    return joinBasePath(relative);
  }

  return trimmed;
}

export async function buildSrcSet(
  raw: string,
  options: BuildSrcSetOptions = {}
): Promise<BuildSrcSetResult | null> {
  const trimmed = raw.trim();
  if (!trimmed || isExternalUrl(trimmed)) {
    return null;
  }

  const normalized = normalizeRequestPath(trimmed);
  if (!normalized) {
    return null;
  }

  const baseLoader = assetUrlMap.get(normalized);
  if (!baseLoader) {
    if (normalized.startsWith('public/')) {
      return {
        src: joinBasePath(normalized.slice('public/'.length)),
        srcset: undefined,
        sources: [],
        sizes: '100vw',
        preloads: [],
      };
    }
    return null;
  }

  let srcUrl: string | undefined;
  try {
    srcUrl = await baseLoader();
  } catch (error) {
    console.warn('Failed to load base asset for srcset', raw, error);
    return null;
  }

  if (!srcUrl) {
    return null;
  }

  const formats = options.include ?? ['avif', 'webp', 'original'];
  const preloadTargets = options.preload ?? ['avif', 'webp'];
  const sources: PictureSource[] = [];
  let fallbackSrcset: string | undefined;

  for (const format of formats) {
    const loader = getSrcsetLoader(format, normalized);
    if (!loader) {
      continue;
    }
    try {
      const value = await loader();
      if (typeof value !== 'string' || value.length === 0) {
        continue;
      }
      if (format === 'original') {
        fallbackSrcset = value;
      } else {
        sources.push({
          srcset: value,
          type: `image/${format}`,
        });
      }
    } catch (error) {
      console.warn('Failed to load srcset for', raw, format, error);
    }
  }

  const preloads = await buildPreloads(normalized, preloadTargets, srcUrl);

  return {
    src: srcUrl,
    srcset: fallbackSrcset,
    sources,
    sizes: '100vw',
    preloads,
  };
}

export async function registerLottie(options: RegisterLottieOptions): Promise<LottieRegistration> {
  const { container, hoverToPlay, onReady, onError } = options;
  const resolvedSrc = await resolveAsset(options.src);
  if (!resolvedSrc || typeof window === 'undefined') {
    return {
      animation: null,
      destroy() {},
      play() {},
      pause() {},
    };
  }

  try {
    const lottie = await loadLottieModule();
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const shouldRespectMotion = prefersReducedMotion?.matches ?? false;
    const autoplay = shouldRespectMotion ? false : options.autoplay !== false;

    const animation = lottie.loadAnimation({
      container,
      renderer: options.renderer ?? 'svg',
      loop: options.loop ?? true,
      autoplay,
      name: options.name,
      path: resolvedSrc,
    });

    onReady?.(animation);

    const cleanupFns: Array<() => void> = [];

    if (prefersReducedMotion) {
      const listener = (event: MediaQueryListEvent) => {
        if (event.matches) {
          animation.pause();
        } else if (options.autoplay !== false) {
          animation.play();
        }
      };
      prefersReducedMotion.addEventListener?.('change', listener);
      cleanupFns.push(() => prefersReducedMotion.removeEventListener?.('change', listener));
    }

    if (hoverToPlay) {
      const handleEnter = () => animation.play();
      const handleLeave = () => animation.pause();
      container.addEventListener('mouseenter', handleEnter);
      container.addEventListener('mouseleave', handleLeave);
      cleanupFns.push(() => {
        container.removeEventListener('mouseenter', handleEnter);
        container.removeEventListener('mouseleave', handleLeave);
      });
    }

    const destroy = () => {
      cleanupFns.splice(0).forEach((fn) => fn());
      animation.destroy();
    };

    return {
      animation,
      destroy,
      play: () => animation.play(),
      pause: () => animation.pause(),
    };
  } catch (error) {
    console.error('Failed to initialise Lottie animation', error);
    onError?.(error);
    return {
      animation: null,
      destroy() {},
      play() {},
      pause() {},
    };
  }
}

async function buildPreloads(
  normalized: string,
  targets: Array<'avif' | 'webp' | 'original'>,
  fallback: string
): Promise<AssetPreload[]> {
  const descriptors: AssetPreload[] = [];

  for (const format of targets) {
    const loader = getPreloadLoader(format, normalized);
    if (!loader) {
      continue;
    }
    try {
      const href = await loader();
      if (typeof href !== 'string' || href.length === 0) {
        continue;
      }
      descriptors.push({
        href,
        as: 'image',
        type: format === 'original' ? undefined : `image/${format}`,
      });
    } catch (error) {
      console.warn('Failed to build preload for', normalized, format, error);
    }
  }

  if (descriptors.length === 0 && fallback) {
    descriptors.push({ href: fallback, as: 'image' });
  }

  return descriptors;
}

function getSrcsetLoader(
  format: 'avif' | 'webp' | 'original',
  key: string
): Loader<string> | undefined {
  switch (format) {
    case 'avif':
      return avifSrcsetMap.get(key);
    case 'webp':
      return webpSrcsetMap.get(key);
    case 'original':
      return originalSrcsetMap.get(key);
    default:
      return undefined;
  }
}

function getPreloadLoader(
  format: 'avif' | 'webp' | 'original',
  key: string
): Loader<string> | undefined {
  switch (format) {
    case 'avif':
      return preloadAvifMap.get(key);
    case 'webp':
      return preloadWebpMap.get(key);
    case 'original':
      return preloadOriginalMap.get(key);
    default:
      return undefined;
  }
}

function createLoaderMap(record: Record<string, Loader<unknown>>): LoaderMap {
  const map = new Map<string, Loader<string>>();
  for (const [key, loader] of Object.entries(record)) {
    const normalized = normalizeGlobKey(key);
    map.set(normalized, loader as Loader<string>);
  }
  return map;
}

function mergeLoaders(
  groups: Array<Record<string, Loader<unknown>>>
): Record<string, Loader<unknown>> {
  return groups.reduce<Record<string, Loader<unknown>>>(
    (acc, group) => Object.assign(acc, group),
    {}
  );
}

function normalizeGlobKey(key: string): string {
  const [pathWithoutQuery] = key.split('?');
  return pathWithoutQuery.replace(/^\.\.\/+/, '');
}

function normalizeRequestPath(path: string): string | null {
  let value = path.trim();
  if (!value) {
    return null;
  }
  if (value.startsWith('@/')) {
    value = value.slice(2);
  }
  if (value.startsWith('~/')) {
    value = value.slice(2);
  }
  value = value.replace(/^\.\/+/, '');
  if (value.startsWith('src/')) {
    value = value.slice(4);
  }
  if (value.startsWith('public/')) {
    return value;
  }
  if (value.startsWith('/')) {
    return `public${value}`;
  }
  return value;
}

function joinBasePath(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  if (!path) {
    return base;
  }
  if (base.endsWith('/')) {
    return `${base}${path}`;
  }
  return `${base}/${path}`;
}

async function loadLottieModule(): Promise<LottieModule> {
  if (!lottieModulePromise) {
    lottieModulePromise = import('lottie-web');
  }
  return lottieModulePromise;
}

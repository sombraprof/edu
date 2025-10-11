type Loader<T> = () => Promise<T>;

type LoaderMap = Map<string, Loader<string>>;

export type PictureSource = {
  srcset: string;
  type?: string;
  media?: string;
  sizes?: string;
};

export interface BuildSrcSetResult {
  src: string;
  srcset?: string;
  sources: PictureSource[];
  sizes?: string;
}

export interface BuildSrcSetOptions {
  include?: Array<'avif' | 'webp' | 'original'>;
}

const contentAssetModules = import.meta.glob(
  '../content/**/*.{png,jpg,jpeg,webp,avif,gif,svg,glb,gltf,usdz,hdr}',
  {
    import: 'default',
  }
);
const internalAssetModules = import.meta.glob(
  '../assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg,glb,gltf,usdz,hdr}',
  {
    import: 'default',
  }
);

const contentSrcsetModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { as: 'srcset', w: '360;640;960;1280;1600' },
});
const internalSrcsetModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { as: 'srcset', w: '360;640;960;1280;1600' },
});

const contentWebpModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { as: 'srcset', w: '360;640;960;1280;1600', format: 'webp' },
});
const internalWebpModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { as: 'srcset', w: '360;640;960;1280;1600', format: 'webp' },
});

const contentAvifModules = import.meta.glob('../content/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { as: 'srcset', w: '360;640;960;1280;1600', format: 'avif' },
});
const internalAvifModules = import.meta.glob('../assets/**/*.{png,jpg,jpeg}', {
  import: 'default',
  query: { as: 'srcset', w: '360;640;960;1280;1600', format: 'avif' },
});
const baseAssetLoaders = mergeLoaders([contentAssetModules, internalAssetModules]);
const srcsetLoaders = mergeLoaders([contentSrcsetModules, internalSrcsetModules]);
const webpLoaders = mergeLoaders([contentWebpModules, internalWebpModules]);
const avifLoaders = mergeLoaders([contentAvifModules, internalAvifModules]);

const assetUrlMap = createLoaderMap(baseAssetLoaders);
const originalSrcsetMap = createLoaderMap(srcsetLoaders);
const webpSrcsetMap = createLoaderMap(webpLoaders);
const avifSrcsetMap = createLoaderMap(avifLoaders);

export function isExternalUrl(value: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:');
}

export async function resolveAssetUrl(raw: string): Promise<string> {
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

  return {
    src: srcUrl,
    srcset: fallbackSrcset,
    sources,
    sizes: '100vw',
  };
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

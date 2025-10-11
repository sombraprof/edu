export const EMBED_VIEW_MODES = ['embed', 'present', 'preview', 'view', 'board'] as const;
export type EmbedViewMode = (typeof EMBED_VIEW_MODES)[number];

export const EMBED_THEMES = ['light', 'dark', 'auto'] as const;
export type EmbedTheme = (typeof EMBED_THEMES)[number];

export interface EmbedProviderPreset {
  id: EmbedProviderId;
  label: string;
  domains: readonly string[];
  defaultHeight: number;
  defaultPage?: EmbedViewMode;
  supportedPages?: readonly EmbedViewMode[];
  defaultTheme?: EmbedTheme;
  supportedThemes?: readonly EmbedTheme[];
  buildUrl?: (input: URL, options: { page?: EmbedViewMode; theme?: EmbedTheme }) => string;
}

export type EmbedProviderId =
  | 'figma'
  | 'miro'
  | 'framer'
  | 'canva'
  | 'google-slides'
  | 'powerpoint-online';

export const EMBED_PROVIDERS: readonly EmbedProviderPreset[] = [
  {
    id: 'figma',
    label: 'Figma',
    domains: ['figma.com', 'www.figma.com'],
    defaultHeight: 720,
    defaultPage: 'embed',
    supportedPages: ['embed', 'present'],
    defaultTheme: 'light',
    supportedThemes: ['light', 'dark'],
    buildUrl: (input, options) => {
      const embedUrl = new URL('https://www.figma.com/embed');
      embedUrl.searchParams.set('embed_host', 'edu');
      embedUrl.searchParams.set('url', input.toString());
      if (options.theme) {
        embedUrl.searchParams.set('theme', options.theme);
      }
      if (options.page === 'present') {
        embedUrl.searchParams.set('scaling', 'contain');
      }
      return embedUrl.toString();
    },
  },
  {
    id: 'miro',
    label: 'Miro',
    domains: ['miro.com', 'www.miro.com'],
    defaultHeight: 768,
    defaultPage: 'board',
    supportedPages: ['board'],
    buildUrl: (input) => {
      const url = new URL(input.toString());
      if (!url.searchParams.has('embed')) {
        url.searchParams.set('embed', '1');
      }
      return url.toString();
    },
  },
  {
    id: 'framer',
    label: 'Framer',
    domains: ['framer.com', 'www.framer.com'],
    defaultHeight: 720,
    defaultPage: 'embed',
    supportedPages: ['embed', 'present'],
    buildUrl: (input, options) => {
      const url = new URL(input.toString());
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments[0] === 'share') {
        segments[0] = options.page === 'present' ? 'present' : 'embed';
        url.pathname = `/${segments.join('/')}`;
      }
      if (!url.searchParams.has('embed') && (options.page ?? 'embed') === 'embed') {
        url.searchParams.set('embed', '1');
      }
      return url.toString();
    },
  },
  {
    id: 'canva',
    label: 'Canva',
    domains: ['canva.com', 'www.canva.com'],
    defaultHeight: 720,
    defaultPage: 'view',
    supportedPages: ['view', 'present'],
    buildUrl: (input, options) => {
      const url = new URL(input.toString());
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments[0] === 'design' && segments.length >= 3) {
        const desiredView = options.page ?? 'view';
        segments[2] = desiredView;
        url.pathname = `/${segments.join('/')}`;
      }
      if ((options.page ?? 'view') === 'view') {
        url.searchParams.set('embed', '1');
      }
      return url.toString();
    },
  },
  {
    id: 'google-slides',
    label: 'Google Slides',
    domains: ['docs.google.com'],
    defaultHeight: 540,
    defaultPage: 'embed',
    supportedPages: ['embed', 'present', 'preview'],
    buildUrl: (input, options) => {
      const match = input.pathname.match(/\/presentation\/d\/([^/]+)/);
      const slideId = match?.[1];
      if (!slideId) {
        return input.toString();
      }
      const mode = options.page ?? 'embed';
      const base = new URL(`https://docs.google.com/presentation/d/${slideId}/${mode}`);
      if (mode === 'embed') {
        base.searchParams.set('start', 'false');
        base.searchParams.set('loop', 'false');
        base.searchParams.set('delayms', '3000');
      }
      if (input.hash) {
        base.hash = input.hash;
      }
      return base.toString();
    },
  },
  {
    id: 'powerpoint-online',
    label: 'PowerPoint Online',
    domains: ['onedrive.live.com', 'office.com'],
    defaultHeight: 540,
    defaultPage: 'embed',
    supportedPages: ['embed'],
    buildUrl: (input) => {
      const url = new URL(input.toString());
      if (!url.searchParams.has('em')) {
        url.searchParams.set('em', '2');
      }
      return url.toString();
    },
  },
] as const;

const DOMAIN_MATCHERS = EMBED_PROVIDERS.flatMap((provider) =>
  provider.domains.map((domain) => ({ domain, provider }))
);

export function resolveEmbedProvider(url: URL): EmbedProviderPreset | null {
  const host = url.hostname.toLowerCase();
  const match = DOMAIN_MATCHERS.find(
    ({ domain }) => host === domain || host.endsWith(`.${domain}`)
  );
  return match?.provider ?? null;
}

export function getEmbedProviderById(id: EmbedProviderId): EmbedProviderPreset | null {
  return EMBED_PROVIDERS.find((provider) => provider.id === id) ?? null;
}

export function normalizeEmbedPage(
  provider: EmbedProviderPreset,
  candidate?: EmbedViewMode
): EmbedViewMode | undefined {
  const allowed = provider.supportedPages;
  if (!allowed || allowed.length === 0) {
    return undefined;
  }
  if (candidate && allowed.includes(candidate)) {
    return candidate;
  }
  return provider.defaultPage;
}

export function normalizeEmbedTheme(
  provider: EmbedProviderPreset,
  candidate?: EmbedTheme
): EmbedTheme | undefined {
  const allowed = provider.supportedThemes;
  if (!allowed || allowed.length === 0) {
    return undefined;
  }
  if (candidate && allowed.includes(candidate)) {
    return candidate;
  }
  return provider.defaultTheme;
}

export function buildEmbedUrl(
  input: URL,
  provider: EmbedProviderPreset,
  options: { page?: EmbedViewMode; theme?: EmbedTheme } = {}
): string {
  return provider.buildUrl?.(input, options) ?? input.toString();
}

export const EMBED_PROVIDER_IDS = EMBED_PROVIDERS.map((provider) => provider.id);

export interface Config {
  ADD_TAGS?: string[];
  ADD_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  ALLOW_ARIA_ATTR?: boolean;
  FORBID_TAGS?: string[];
  KEEP_CONTENT?: boolean;
}

export const DEFAULT_CONFIG: Config = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: [
    'allow',
    'allowfullscreen',
    'frameborder',
    'target',
    'rel',
    'aria-label',
    'aria-describedby',
    'aria-labelledby',
    'data-theme',
    'data-tone',
    'data-variant',
    'data-state',
  ],
  ALLOW_DATA_ATTR: true,
  ALLOW_ARIA_ATTR: true,
  FORBID_TAGS: ['script', 'style'],
  KEEP_CONTENT: false,
};

const FALLBACK_STRIP_REGEX = /<script[\s\S]*?<\/script>/gi;

const EVENT_HANDLER_PATTERN = /^on/i;
const DANGEROUS_PROTOCOL_PATTERN = /^javascript:/i;

function sanitizeWithDom(value: string, config: Config): string {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(value, 'text/html');
  const body = parsed.body;
  const allowedExtraTags = new Set((config.ADD_TAGS ?? []).map((tag) => tag.toLowerCase()));
  const forbiddenTags = new Set((config.FORBID_TAGS ?? []).map((tag) => tag.toLowerCase()));

  body.querySelectorAll('script,style').forEach((element) => {
    if (config.KEEP_CONTENT) {
      const parent = element.parentNode;
      while (element.firstChild && parent) {
        parent.insertBefore(element.firstChild, element);
      }
    }

    element.remove();
  });

  body.querySelectorAll('*').forEach((element) => {
    const tag = element.tagName.toLowerCase();

    if (forbiddenTags.has(tag)) {
      if (config.KEEP_CONTENT) {
        const parent = element.parentNode;
        while (element.firstChild && parent) {
          parent.insertBefore(element.firstChild, element);
        }
      }

      element.remove();
      return;
    }

    if (tag === 'iframe' && !allowedExtraTags.has('iframe')) {
      element.remove();
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value ?? '';

      if (EVENT_HANDLER_PATTERN.test(name)) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (DANGEROUS_PROTOCOL_PATTERN.test(value.trim())) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (
        !config.ALLOW_DATA_ATTR &&
        name.startsWith('data-') &&
        !(config.ADD_ATTR ?? []).includes(name)
      ) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (
        !config.ALLOW_ARIA_ATTR &&
        name.startsWith('aria-') &&
        !(config.ADD_ATTR ?? []).includes(name)
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return body.innerHTML;
}

export function sanitizeHtml(value: unknown, config?: Config): string {
  if (typeof value !== 'string') {
    return '';
  }

  if (typeof window === 'undefined' || typeof window.document === 'undefined') {
    return value.replace(FALLBACK_STRIP_REGEX, '');
  }

  try {
    return sanitizeWithDom(value, { ...DEFAULT_CONFIG, ...config });
  } catch (error) {
    console.warn('[sanitizeHtml] Falling back to regex-based sanitisation due to error:', error);
    return value.replace(FALLBACK_STRIP_REGEX, '');
  }
}

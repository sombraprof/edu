import DOMPurify, { type Config } from 'dompurify';

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

export function sanitizeHtml(value: unknown, config?: Config): string {
  if (typeof value !== 'string') {
    return '';
  }

  if (typeof window === 'undefined' || typeof window.document === 'undefined') {
    return value.replace(FALLBACK_STRIP_REGEX, '');
  }

  return DOMPurify.sanitize(value, { ...DEFAULT_CONFIG, ...config });
}

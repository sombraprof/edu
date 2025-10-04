import { afterEach, describe, expect, it, vi } from 'vitest';

const createDomPurifyMock = vi.fn();

vi.mock('dompurify', () => ({
  default: createDomPurifyMock,
}));

describe('sanitizeHtml', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    createDomPurifyMock.mockReset();
    vi.resetModules();
    vi.clearAllMocks();

    if (originalWindow) {
      globalThis.window = originalWindow;
    } else {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
  });

  it('returns an empty string when the input is not a string', async () => {
    const { sanitizeHtml } = await import('../sanitizeHtml');

    expect(sanitizeHtml(undefined)).toBe('');
    expect(createDomPurifyMock).not.toHaveBeenCalled();
  });

  it('delegates sanitisation to DOMPurify when available', async () => {
    const sanitizeSpy = vi.fn((value: string) => value.replace('<script>evil()</script>', ''));
    createDomPurifyMock.mockReturnValue({ sanitize: sanitizeSpy });

    const { DEFAULT_CONFIG, sanitizeHtml } = await import('../sanitizeHtml');
    const input = '<p>Valid</p><script>evil()</script>';

    const expectedConfig = { ...DEFAULT_CONFIG, KEEP_CONTENT: true };

    const result = sanitizeHtml(input, { KEEP_CONTENT: true });

    expect(result).toBe('<p>Valid</p>');
    expect(createDomPurifyMock).toHaveBeenCalledWith(window);
    expect(sanitizeSpy).toHaveBeenCalledWith(input, expectedConfig);
  });

  it('falls back to regex stripping when DOMPurify cannot be initialised', async () => {
    delete (globalThis as unknown as { window?: unknown }).window;

    const { sanitizeHtml } = await import('../sanitizeHtml');
    const input = '<div>Keep me</div><script>remove()</script>';

    expect(sanitizeHtml(input)).toBe('<div>Keep me</div>');
    expect(createDomPurifyMock).not.toHaveBeenCalled();
  });

  it('logs a warning and uses the fallback when DOMPurify throws', async () => {
    const error = new Error('purifier exploded');
    const sanitizeSpy = vi.fn(() => {
      throw error;
    });

    createDomPurifyMock.mockReturnValue({ sanitize: sanitizeSpy });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { sanitizeHtml } = await import('../sanitizeHtml');
    const input = '<span>Clean</span><script>evil()</script>';

    expect(sanitizeHtml(input)).toBe('<span>Clean</span>');
    expect(sanitizeSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      '[sanitizeHtml] Falling back to regex-based sanitisation due to error:',
      error
    );

    warnSpy.mockRestore();
  });
});

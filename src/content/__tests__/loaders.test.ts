import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeManifest } from '../loaders';

describe('normalizeManifest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes a valid manifest with metadata', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const moduleExport = {
      default: {
        version: 'v1',
        generatedAt: '2024-01-01T00:00:00Z',
        entries: [{ id: 'lesson-1' }],
      },
    };

    const result = normalizeManifest<{ id: string }>(moduleExport, { context: 'test' });

    expect(result.entries).toEqual([{ id: 'lesson-1' }]);
    expect(result.version).toBe('v1');
    expect(result.generatedAt).toBe('2024-01-01T00:00:00Z');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns and returns an empty array when entries array is empty', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const moduleExport = {
      default: {
        version: 'v1',
        generatedAt: '2024-01-01T00:00:00Z',
        entries: [],
      },
    };

    const result = normalizeManifest<{ id: string }>(moduleExport, { context: 'test' });

    expect(result.entries).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith('[test] Manifest entries array is empty.');
  });

  it('warns and returns [] when entries are malformed', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const moduleExport = {
      default: {
        version: 'v1',
        generatedAt: '2024-01-01T00:00:00Z',
        entries: 'not-an-array',
      },
    };

    const result = normalizeManifest<{ id: string }>(moduleExport, { context: 'test' });

    expect(result.entries).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith('[test] Manifest is missing a valid "entries" array.');
  });
});

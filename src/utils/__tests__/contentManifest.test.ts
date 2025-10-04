import { describe, expect, it } from 'vitest';
import {
  extractManifestEntries,
  extractManifestEnvelope,
  type ManifestEnvelope,
} from '../contentManifest';

describe('extractManifestEnvelope', () => {
  it('returns entries when the module default export is an array', () => {
    const moduleExport = {
      default: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
    };

    const result = extractManifestEnvelope<{ id: string }>(moduleExport);

    expect(result).toEqual<ManifestEnvelope<{ id: string }>>({
      entries: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
    });
  });

  it('normalises manifest metadata when the default export is an object', () => {
    const moduleExport = {
      default: {
        entries: [{ id: 'exercise-1' }],
        version: 'v2',
        generatedAt: '2024-05-01T12:00:00Z',
        metadata: {
          checksum: 'abc123',
        },
      },
    };

    const result = extractManifestEnvelope<{ id: string }>(moduleExport);

    expect(result.entries).toEqual([{ id: 'exercise-1' }]);
    expect(result.version).toBe('v2');
    expect(result.generatedAt).toBe('2024-05-01T12:00:00Z');
    expect(result.metadata).toEqual({ checksum: 'abc123' });
  });

  it('falls back to safe defaults when payload properties are malformed', () => {
    const moduleExport = {
      default: {
        entries: 'not-an-array',
        version: 42,
        generatedAt: null,
        metadata: 'invalid',
      },
    };

    const result = extractManifestEnvelope<{ id: string }>(moduleExport);

    expect(result.entries).toEqual([]);
    expect(result.version).toBeUndefined();
    expect(result.generatedAt).toBeUndefined();
    expect(result.metadata).toBeUndefined();
  });

  it('returns an empty envelope when the payload is unsupported', () => {
    expect(extractManifestEnvelope<number>('not-a-manifest')).toEqual<ManifestEnvelope<number>>({
      entries: [],
    });
  });
});

describe('extractManifestEntries', () => {
  it('returns only the entries from the manifest envelope', () => {
    const entries = extractManifestEntries<{ id: string }>([
      { id: 'supplement-1' },
      { id: 'supplement-2' },
    ]);

    expect(entries).toEqual([{ id: 'supplement-1' }, { id: 'supplement-2' }]);
  });

  it('returns an empty array when the manifest cannot be parsed', () => {
    expect(extractManifestEntries<{ id: string }>({ invalid: true })).toEqual([]);
  });
});

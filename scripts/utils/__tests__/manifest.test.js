import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  MANIFEST_VERSION,
  ensureManifestVersion,
  getManifestEntries,
  normalizeManifest,
  readManifest,
  serializeManifest,
  updateManifest,
  writeManifest,
} from '../manifest.mjs';

let tempDir;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), 'manifest-tests-'));
});

afterEach(async () => {
  vi.useRealTimers();
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

function resolveTempPath(fileName) {
  if (!tempDir) throw new Error('temp directory not initialized');
  return path.join(tempDir, fileName);
}

describe('normalizeManifest', () => {
  test('converts legacy arrays into manifest metadata', () => {
    const input = [{ id: 'a' }];
    const result = normalizeManifest(input, { filePath: '/tmp/manifest.json' });
    expect(result).toEqual({
      version: 'legacy',
      generatedAt: null,
      entries: input,
      metadata: {},
      filePath: '/tmp/manifest.json',
      legacy: true,
      missing: false,
    });
  });

  test('preserves metadata for object manifests', () => {
    const input = {
      version: MANIFEST_VERSION,
      generatedAt: '2025-01-01T00:00:00.000Z',
      entries: [{ id: 'b' }],
      notes: 'sample',
    };

    const result = normalizeManifest(input, { filePath: '/tmp/manifest.json' });
    expect(result).toEqual({
      version: MANIFEST_VERSION,
      generatedAt: '2025-01-01T00:00:00.000Z',
      entries: [{ id: 'b' }],
      metadata: { notes: 'sample' },
      filePath: '/tmp/manifest.json',
      legacy: false,
      missing: false,
    });
  });
});

describe('serializeManifest', () => {
  test('applies defaults for version, generatedAt, and metadata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-12-31T23:59:59.000Z'));

    const result = serializeManifest({ entries: [{ id: 'x' }] });
    expect(result).toEqual({
      version: MANIFEST_VERSION,
      generatedAt: '2024-12-31T23:59:59.000Z',
      entries: [{ id: 'x' }],
    });
  });
});

describe('readManifest', () => {
  test('returns placeholder when manifest file is missing', async () => {
    const filePath = resolveTempPath('missing.json');
    const manifest = await readManifest(filePath);

    expect(manifest).toEqual({
      version: MANIFEST_VERSION,
      generatedAt: null,
      entries: [],
      metadata: {},
      filePath,
      missing: true,
      legacy: false,
    });
  });

  test('normalizes existing manifest files', async () => {
    const filePath = resolveTempPath('manifest.json');
    await writeFile(filePath, JSON.stringify([{ id: 'lesson-1' }, { id: 'lesson-2' }]));

    const manifest = await readManifest(filePath);
    expect(manifest.legacy).toBe(true);
    expect(manifest.entries).toHaveLength(2);
    expect(manifest.entries[0]).toEqual({ id: 'lesson-1' });
  });
});

describe('writeManifest', () => {
  test('persists manifests with normalized structure', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-02-02T10:00:00.000Z'));

    const filePath = resolveTempPath('manifest.json');
    const written = await writeManifest(filePath, {
      version: 'legacy',
      entries: [{ id: 'sample' }],
      metadata: { notes: 'test' },
    });

    expect(written).toEqual({
      version: MANIFEST_VERSION,
      generatedAt: '2025-02-02T10:00:00.000Z',
      entries: [{ id: 'sample' }],
      notes: 'test',
    });

    const onDisk = JSON.parse(await readFile(filePath, 'utf8'));
    expect(onDisk).toEqual(written);
  });
});

describe('updateManifest', () => {
  test('migrates legacy manifests and stamps generatedAt', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-15T08:30:00.000Z'));

    const filePath = resolveTempPath('manifest.json');
    await writeFile(filePath, JSON.stringify([{ id: 'existing' }]));

    const result = await updateManifest(filePath, (draft) => {
      expect(draft.version).toBe('legacy');
      draft.entries.push({ id: 'new-entry' });
      draft.generatedAt = null;
      return draft;
    });

    expect(result).toMatchObject({
      version: MANIFEST_VERSION,
      generatedAt: '2025-03-15T08:30:00.000Z',
      entries: [{ id: 'existing' }, { id: 'new-entry' }],
    });
    expect(result.metadata).toEqual({});
    expect(result.filePath).toBe(filePath);
    expect(result.legacy).toBe(true);
    expect(result.missing).toBe(false);

    const onDisk = JSON.parse(await readFile(filePath, 'utf8'));
    expect(onDisk).toEqual({
      version: MANIFEST_VERSION,
      generatedAt: '2025-03-15T08:30:00.000Z',
      entries: [{ id: 'existing' }, { id: 'new-entry' }],
      metadata: {},
      filePath,
      legacy: true,
      missing: false,
    });
  });
});

describe('getManifestEntries', () => {
  test('returns entries from manifests and arrays', () => {
    expect(getManifestEntries(undefined)).toEqual([]);
    expect(getManifestEntries([{ id: 'a' }])).toEqual([{ id: 'a' }]);
    expect(
      getManifestEntries({
        entries: [{ id: 'b' }],
      })
    ).toEqual([{ id: 'b' }]);
  });
});

describe('ensureManifestVersion', () => {
  test('validates manifest version', () => {
    expect(ensureManifestVersion({ version: 'legacy' }, MANIFEST_VERSION)).toBe(false);
    expect(ensureManifestVersion({ version: 'other' }, MANIFEST_VERSION)).toBe(false);
    expect(ensureManifestVersion({ version: MANIFEST_VERSION }, MANIFEST_VERSION)).toBe(true);
  });
});

import { promises as fs } from 'node:fs';
import path from 'node:path';

export const MANIFEST_VERSION = 'edu.manifest.v1';

export async function readManifest(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    return normalizeManifest(data, { filePath });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        version: MANIFEST_VERSION,
        generatedAt: null,
        entries: [],
        metadata: {},
        filePath,
        missing: true,
        legacy: false,
      };
    }
    throw error;
  }
}

export async function writeManifest(filePath, manifest) {
  const targetDir = path.dirname(filePath);
  await fs.mkdir(targetDir, { recursive: true });
  const output = serializeManifest(manifest);
  await fs.writeFile(filePath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  return output;
}

export async function updateManifest(filePath, updater) {
  const manifest = await readManifest(filePath);
  const draft = {
    ...manifest,
    version: manifest.version ?? MANIFEST_VERSION,
    generatedAt: manifest.generatedAt,
    metadata: { ...manifest.metadata },
    entries: manifest.entries.map((entry) => ({ ...entry })),
  };

  const result = await updater(draft);
  const nextManifest = normalizeManifest(result ?? draft);
  if (!nextManifest.version || nextManifest.version === 'legacy') {
    nextManifest.version = MANIFEST_VERSION;
  }
  if (!nextManifest.generatedAt) {
    nextManifest.generatedAt = new Date().toISOString();
  }
  return writeManifest(filePath, nextManifest);
}

export function normalizeManifest(data, { filePath } = {}) {
  if (Array.isArray(data)) {
    return {
      version: 'legacy',
      generatedAt: null,
      entries: data,
      metadata: {},
      filePath,
      legacy: true,
      missing: false,
    };
  }

  if (data && typeof data === 'object') {
    const { version, generatedAt, entries, ...rest } = data;
    return {
      version: typeof version === 'string' ? version : 'legacy',
      generatedAt: typeof generatedAt === 'string' ? generatedAt : null,
      entries: Array.isArray(entries) ? entries : [],
      metadata: rest,
      filePath,
      legacy: typeof version !== 'string',
      missing: false,
    };
  }

  return {
    version: 'legacy',
    generatedAt: null,
    entries: [],
    metadata: {},
    filePath,
    legacy: true,
    missing: false,
  };
}

export function serializeManifest(manifest) {
  const version =
    manifest.version && manifest.version !== 'legacy' ? manifest.version : MANIFEST_VERSION;

  const generatedAt = manifest.generatedAt ?? new Date().toISOString();
  const metadata = manifest.metadata ?? {};
  const base = {
    version,
    generatedAt,
    entries: Array.isArray(manifest.entries) ? manifest.entries : [],
    ...metadata,
  };
  return base;
}

export function ensureManifestVersion(manifest, expectedVersion) {
  if (manifest.version === 'legacy') {
    return false;
  }
  if (manifest.version !== expectedVersion) {
    return false;
  }
  return true;
}

export function getManifestEntries(manifest) {
  if (!manifest) {
    return [];
  }
  if (Array.isArray(manifest)) {
    return manifest;
  }
  if (Array.isArray(manifest.entries)) {
    return manifest.entries;
  }
  return [];
}

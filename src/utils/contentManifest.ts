/**
 * Lightweight counterpart to the Node scripts living under `scripts/utils/manifest.mjs`.
 *
 * The runtime does not import this helper yet – Vue pages rely on the
 * server-side manifest normaliser – but upcoming work will let the client load
 * indexes directly. Keeping the functions documented (and covered by unit
 * tests) avoids regressions when we eventually plug them in.
 */
export interface ManifestEnvelope<T> {
  entries: T[];
  version?: string;
  generatedAt?: string;
  metadata?: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function extractManifestEnvelope<T>(moduleExport: unknown): ManifestEnvelope<T> {
  const payload = (moduleExport as { default?: unknown })?.default ?? moduleExport;

  if (Array.isArray(payload)) {
    return { entries: payload as T[] };
  }

  if (isRecord(payload)) {
    const entries = Array.isArray(payload.entries) ? (payload.entries as T[]) : [];
    const version = typeof payload.version === 'string' ? payload.version : undefined;
    const generatedAt = typeof payload.generatedAt === 'string' ? payload.generatedAt : undefined;
    const metadata = isRecord(payload.metadata)
      ? (payload.metadata as Record<string, unknown>)
      : undefined;

    return {
      entries,
      version,
      generatedAt,
      metadata,
    };
  }

  return { entries: [] };
}

export function extractManifestEntries<T>(moduleExport: unknown): T[] {
  return extractManifestEnvelope<T>(moduleExport).entries;
}

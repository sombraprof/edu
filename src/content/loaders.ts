export interface ManifestPayload<T> {
  entries?: unknown;
  version?: unknown;
  generatedAt?: unknown;
}

export interface NormalizedManifest<T> {
  entries: T[];
  version?: string;
  generatedAt?: string;
}

interface NormalizeOptions {
  context?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function logWarning(context: string, message: string, detail?: unknown) {
  const label = context ? `[${context}]` : '[content manifest]';
  if (typeof detail === 'undefined') {
    console.warn(`${label} ${message}`);
  } else {
    console.warn(`${label} ${message}`, detail);
  }
}

export function normalizeManifest<T>(
  moduleExport: unknown,
  options: NormalizeOptions = {}
): NormalizedManifest<T> {
  const context = options.context ?? 'content manifest';
  const payload = (moduleExport as { default?: unknown })?.default ?? moduleExport;

  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      logWarning(context, 'Manifest entries array is empty.');
    }

    return {
      entries: payload as T[],
    };
  }

  if (isRecord(payload)) {
    const { entries, version, generatedAt } = payload as ManifestPayload<T>;
    if (!Array.isArray(entries)) {
      logWarning(context, 'Manifest is missing a valid "entries" array.');
      return {
        entries: [],
        version: typeof version === 'string' ? version : undefined,
        generatedAt: typeof generatedAt === 'string' ? generatedAt : undefined,
      };
    }

    if (entries.length === 0) {
      logWarning(context, 'Manifest entries array is empty.');
    }

    return {
      entries: entries as T[],
      version: typeof version === 'string' ? version : undefined,
      generatedAt: typeof generatedAt === 'string' ? generatedAt : undefined,
    };
  }

  logWarning(context, 'Manifest payload is malformed.', payload);
  return { entries: [] };
}

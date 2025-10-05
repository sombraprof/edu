import type { LessonBlock } from '@/components/lesson/blockRegistry';

export const AUTHORING_BLOCK_UI_KEY = '__uiKey' as const;

export type AuthoringBlockUiKey = { __uiKey: string };
export type LessonAuthoringBlock = LessonBlock & AuthoringBlockUiKey;

type BlockWithOptionalKey<T extends Record<string, unknown>> = T & {
  __uiKey?: string;
};

function inheritKey<T extends Record<string, unknown>>(
  block: T,
  key?: string
): T & AuthoringBlockUiKey {
  const current = (block as BlockWithOptionalKey<T>).__uiKey;
  if (typeof current === 'string') {
    if (!key || current === key) {
      return block as T & AuthoringBlockUiKey;
    }
    return {
      ...(block as object),
      __uiKey: key,
    } as T & AuthoringBlockUiKey;
  }

  const nextKey = key ?? crypto.randomUUID();
  return {
    ...(block as object),
    __uiKey: nextKey,
  } as T & AuthoringBlockUiKey;
}

export function ensureAuthoringBlockKey<T extends Record<string, unknown>>(
  block: T,
  inheritedKey?: string
): T & AuthoringBlockUiKey {
  return inheritKey(block, inheritedKey);
}

export function applyAuthoringBlockKeys<T extends Record<string, unknown>>(
  blocks: readonly T[]
): (T & AuthoringBlockUiKey)[] {
  return blocks.map((block) => ensureAuthoringBlockKey(block));
}

export function stripAuthoringBlockKey<T extends Record<string, unknown>>(
  block: T & { __uiKey?: string }
): T {
  if (!('__uiKey' in block)) {
    return block;
  }
  const { __uiKey: _removed, ...rest } = block;
  return rest as T;
}

export function stripAuthoringBlockKeys<T extends Record<string, unknown>>(
  blocks: readonly (T & { __uiKey?: string })[]
): T[] {
  return blocks.map((block) => stripAuthoringBlockKey(block));
}

export function cloneWithAuthoringBlockKey<T extends Record<string, unknown>>(
  block: T & { __uiKey?: string }
): T & AuthoringBlockUiKey {
  return inheritKey(block, (block as BlockWithOptionalKey<T>).__uiKey);
}

export function inheritAuthoringBlockKey<T extends Record<string, unknown>>(
  source: { __uiKey?: string } | undefined,
  target: T
): T & AuthoringBlockUiKey {
  const key = typeof source?.__uiKey === 'string' ? source.__uiKey : undefined;
  return ensureAuthoringBlockKey(target, key);
}

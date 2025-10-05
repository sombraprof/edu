import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPrismHighlightHandler } from '@/utils/prismHighlight';

const highlightElementMock = vi.fn();
const highlightAllMock = vi.fn();
const highlightAllUnderMock = vi.fn();

vi.mock('prismjs', () => ({
  default: {
    highlightElement: highlightElementMock,
    highlightAll: highlightAllMock,
    highlightAllUnder: highlightAllUnderMock,
  },
  highlightElement: highlightElementMock,
  highlightAll: highlightAllMock,
  highlightAllUnder: highlightAllUnderMock,
}));

vi.mock('prismjs/components/prism-markup', () => ({}));
vi.mock('prismjs/components/prism-javascript', () => ({}));
vi.mock('prismjs/components/prism-typescript', () => ({}));
vi.mock('prismjs/components/prism-python', () => ({}));
vi.mock('prismjs/components/prism-json', () => ({}));
vi.mock('prismjs/components/prism-java', () => ({}));
vi.mock('prismjs/components/prism-c', () => ({}));
vi.mock('prismjs/components/prism-cpp', () => ({}));
vi.mock('prismjs/components/prism-csharp', () => ({}));
vi.mock('prismjs/components/prism-kotlin', () => ({}));

describe('createPrismHighlightHandler', () => {
  beforeEach(() => {
    highlightElementMock.mockReset();
    highlightAllMock.mockReset();
    highlightAllUnderMock.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('highlights all when no targets are provided', async () => {
    const handler = createPrismHighlightHandler();

    await handler();
    vi.runOnlyPendingTimers();

    expect(highlightAllMock).toHaveBeenCalledTimes(1);
    expect(highlightElementMock).not.toHaveBeenCalled();
    expect(highlightAllUnderMock).not.toHaveBeenCalled();
  });

  it('highlights a single provided element', async () => {
    const handler = createPrismHighlightHandler();
    const element = document.createElement('pre');

    await handler({ targets: element });
    vi.runOnlyPendingTimers();

    expect(highlightElementMock).toHaveBeenCalledTimes(1);
    expect(highlightElementMock).toHaveBeenCalledWith(element);
    expect(highlightAllMock).not.toHaveBeenCalled();
  });

  it('highlights all entries from iterable targets', async () => {
    const handler = createPrismHighlightHandler();
    const first = document.createElement('code');
    const second = document.createElement('code');
    const targets = new Set([first, second]);

    await handler({ targets });
    vi.runOnlyPendingTimers();

    expect(highlightElementMock).toHaveBeenCalledTimes(2);
    expect(highlightElementMock).toHaveBeenNthCalledWith(1, first);
    expect(highlightElementMock).toHaveBeenNthCalledWith(2, second);
    expect(highlightAllMock).not.toHaveBeenCalled();
  });
});

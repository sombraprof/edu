import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import {
  buildMetadataSummary,
  hasRenderableContent,
  resolveBlocks,
  useLessonRenderer,
  type LessonContent,
  type ResolvedLessonBlock,
} from '../LessonRenderer.logic';

describe('useLessonRenderer', () => {
  it('resolves known and unknown blocks consistently', () => {
    const blocks = [
      { type: 'contentBlock', body: 'Hello' },
      { type: 'unknown_block', some: 'value' },
    ] as any;

    const resolved = resolveBlocks(blocks);
    expect(resolved).toHaveLength(2);

    const [known, unknown] = resolved;
    expect(known.component).not.toBeNull();
    expect(known.error).toBe(`Bloco com tipo desconhecido: ${blocks[0].type}.`);
    expect(known.props).toEqual({ data: blocks[0] });

    expect(unknown.component).toBeNull();
    expect(unknown.error).toContain('Bloco com tipo desconhecido');
    expect(unknown.props).toEqual({});
  });

  it('provides bibliography fallback only when no block exists', () => {
    const baseLesson: LessonContent = {
      id: 'demo',
      title: 'Demo',
      content: [],
      bibliography: ['Autor. Título. 2024.'],
    } as any;

    const controllerWithoutBlock = useLessonRenderer(ref(baseLesson));
    expect(controllerWithoutBlock.bibliographyFallback.value).toEqual({
      title: 'Bibliografia',
      items: ['Autor. Título. 2024.'],
    });

    const controllerWithBlock = useLessonRenderer(
      ref({
        ...baseLesson,
        content: [
          {
            type: 'bibliography',
            title: 'Existente',
            items: ['Item existente'],
          },
        ],
      })
    );

    expect(controllerWithBlock.bibliographyFallback.value).toBeNull();
  });

  it('builds metadata summary only with available information', () => {
    const emptySummary = buildMetadataSummary(null);
    expect(emptySummary).toBeNull();

    const partialSummary = buildMetadataSummary({
      objective: '  Explorar conceitos  ',
      outcomes: ['   Aplicar   ', '', ''],
      skills: null,
      resources: [{ label: 'Guia oficial', url: 'https://example.com' }, { label: '  ' }],
    } as any);

    expect(partialSummary).toEqual({
      generalObjective: 'Explorar conceitos',
      outcomes: ['Aplicar'],
      resources: [
        {
          label: 'Guia oficial',
          url: 'https://example.com',
        },
      ],
    });
  });

  it('detects renderable content from helpers', () => {
    const emptyBlocks: ResolvedLessonBlock[] = [];
    expect(hasRenderableContent(null, emptyBlocks, null)).toBe(false);

    expect(hasRenderableContent({ generalObjective: 'Aprender' }, emptyBlocks, null)).toBe(true);

    expect(hasRenderableContent(null, [{ component: null, props: {}, error: 'x' }], null)).toBe(
      true
    );
  });
});

import Accordion from '@/components/lesson/Accordion.vue';
import AudioBlock from '@/components/lesson/AudioBlock.vue';
import BibliographyBlock from '@/components/lesson/BibliographyBlock.vue';
import Callout from '@/components/lesson/Callout.vue';
import CardGrid from '@/components/lesson/CardGrid.vue';
import ChecklistBlock from '@/components/lesson/ChecklistBlock.vue';
import CodeBlock from '@/components/lesson/CodeBlock.vue';
import ContentBlock from '@/components/lesson/ContentBlock.vue';
import FlightPlan from '@/components/lesson/FlightPlan.vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';
import LegacySection from '@/components/lesson/LegacySection.vue';
import LessonPlan from '@/components/lesson/LessonPlan.vue';
import Md3BlockDiagram from '@/components/lesson/Md3BlockDiagram.vue';
import Md3Flowchart from '@/components/lesson/Md3Flowchart.vue';
import Md3LogicOperators from '@/components/lesson/Md3LogicOperators.vue';
import Md3Table from '@/components/lesson/Md3Table.vue';
import MemoryDiagram from '@/components/lesson/MemoryDiagram.vue';
import OrderedList from '@/components/lesson/OrderedList.vue';
import Representations from '@/components/lesson/Representations.vue';
import Roadmap from '@/components/lesson/Roadmap.vue';
import Timeline from '@/components/lesson/Timeline.vue';
import TruthTable from '@/components/lesson/TruthTable.vue';
import VideosBlock from '@/components/lesson/VideosBlock.vue';
import type { Component } from 'vue';

export type LessonBlock = Record<string, unknown> & { type: string };

interface BlockResolution {
  component: Component | null;
  props?: Record<string, unknown>;
  error?: string;
}

type TableCell = { value: string; mono?: boolean; code?: boolean };
type TableRow = TableCell[];

const customComponentRegistry: Record<string, Component> = {
  Md3Table,
  Md3LogicOperators,
  Md3BlockDiagram,
  Md3Flowchart,
  MemoryDiagram,
  OrderedList,
  CardGrid,
  Roadmap,
};

const blockHandlers: Record<string, (block: LessonBlock) => BlockResolution> = {
  html(block) {
    return {
      component: LegacyHtml,
      props: { html: toString(block.html) },
    };
  },
  code(block) {
    const language = toOptionalString(block.language);
    return {
      component: CodeBlock,
      props: {
        code: toString(block.code),
        language,
        plainText: shouldUsePlainText(language),
      },
    };
  },
  lessonPlan: dataBlock(LessonPlan),
  contentBlock: dataBlock(ContentBlock),
  videos: dataBlock(VideosBlock),
  videosBlock: dataBlock(VideosBlock),
  checklist: dataBlock(ChecklistBlock),
  bibliography: dataBlock(BibliographyBlock),
  bibliographyBlock: dataBlock(BibliographyBlock),
  cardGrid: dataBlock(CardGrid),
  roadmap(block) {
    return {
      component: Roadmap,
      props: {
        steps: toRoadmapSteps(block.steps ?? block.items),
      },
    };
  },
  callout(block) {
    return {
      component: Callout,
      props: {
        variant: toOptionalString(block.variant),
        title: toOptionalString(block.title),
        content: toCalloutContent(block.content ?? block.richContent),
      },
    };
  },
  timeline: dataBlock(Timeline),
  flightPlan: dataBlock(FlightPlan),
  accordion: dataBlock(Accordion),
  representations: dataBlock(Representations),
  truthTable(block) {
    return {
      component: TruthTable,
      props: {
        title: toString(block.title),
        headers: toStringArray(block.headers),
        rows: toMatrix(block.rows),
      },
    };
  },
  blockDiagram(block) {
    return {
      component: Md3BlockDiagram,
      props: {
        title: toOptionalString(block.title),
        summary: toOptionalString(block.summary),
        blocks: toBlockEntries(block.blocks),
        channels: toChannelEntries(block.channels),
        legend: toLegendEntries(block.legend),
        dense: Boolean(block.dense),
      },
    };
  },
  audio(block) {
    return {
      component: AudioBlock,
      props: {
        title: toString(block.title),
        src: toString(block.src),
      },
    };
  },
  audioBlock(block) {
    return blockHandlers.audio(block);
  },
  md3Table(block) {
    return {
      component: Md3Table,
      props: {
        headers: toStringArray(block.headers),
        rows: toTableRows(block.rows),
      },
    };
  },
  component(block) {
    const componentName = toOptionalString(block.component);
    if (!componentName) {
      return {
        component: null,
        error: 'Bloco "component" requer o campo "component" com o nome do componente registrado.',
      };
    }

    const resolved = customComponentRegistry[componentName];
    if (!resolved) {
      return {
        component: null,
        error: `Componente personalizado não registrado: ${componentName}.`,
      };
    }

    return {
      component: resolved,
      props: toRecord(block.props),
    };
  },
  legacySection(block) {
    return {
      component: LegacySection,
      props: {
        id: toString(block.id),
        title: toString(block.title),
        html: toString(block.html),
      },
    };
  },
};

const legacyBlockTypes = ['dragAndDrop', 'fileTree', 'quiz'] as const;

export function resolveBlock(block: LessonBlock): BlockResolution {
  const handler = blockHandlers[block.type];
  if (!handler) {
    if (isLegacyBlockType(block.type)) {
      return {
        component: null,
        error:
          'Bloco legado sem renderer MD3 disponível. Converta o conteúdo para blocos suportados ou use `legacySection` temporariamente.',
      };
    }

    return {
      component: null,
      error: `Bloco com tipo desconhecido: ${String(block.type ?? '(sem tipo)')}.`,
    };
  }

  return handler(block);
}

export const supportedBlockTypes = Object.freeze([
  ...Object.keys(blockHandlers),
  ...legacyBlockTypes,
]);
export const supportedCustomComponents = Object.freeze(Object.keys(customComponentRegistry));

export function isLegacyBlockType(type: unknown): type is (typeof legacyBlockTypes)[number] {
  return typeof type === 'string' && legacyBlockTypes.includes(type as any);
}

function dataBlock(component: Component) {
  return (block: LessonBlock): BlockResolution => ({
    component,
    props: { data: block },
  });
}

function shouldUsePlainText(language?: string): boolean {
  if (!language) {
    return true;
  }
  const normalized = language.toLowerCase();
  return normalized === 'plaintext' || normalized === 'pseudocode' || normalized === 'text';
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

type CalloutRichContent =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'code'; code: string; language?: string }
  | { type: 'roadmap'; steps: Array<{ title: string; description?: string }> }
  | { type: 'video'; src: string; title?: string };

function toCalloutContent(value: unknown): string | CalloutRichContent[] {
  if (Array.isArray(value)) {
    const blocks: CalloutRichContent[] = [];

    value.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      const type = (entry as any).type;

      if (type === 'paragraph') {
        const text = toString((entry as any).text ?? (entry as any).html ?? '');
        if (text) {
          blocks.push({ type: 'paragraph', text });
        }
        return;
      }

      if (type === 'list') {
        const rawItems = Array.isArray((entry as any).items) ? (entry as any).items : [];
        const items = rawItems
          .map((item) => {
            if (typeof item === 'string') {
              return item.trim();
            }

            if (item && typeof item === 'object') {
              return toString((item as any).text ?? (item as any).value ?? '').trim();
            }

            return '';
          })
          .filter((item) => item.length > 0);
        if (items.length) {
          blocks.push({ type: 'list', ordered: Boolean((entry as any).ordered), items });
        }
        return;
      }

      if (type === 'code') {
        const code = toString((entry as any).code);
        if (code.trim().length) {
          blocks.push({
            type: 'code',
            code,
            language: toOptionalString((entry as any).language),
          });
        }
        return;
      }

      if (type === 'roadmap') {
        const steps = toRoadmapSteps((entry as any).steps ?? (entry as any).items);
        if (steps.length) {
          blocks.push({ type: 'roadmap', steps });
        }
        return;
      }

      if (type === 'video') {
        const video = toCalloutVideo(entry);
        if (video) {
          blocks.push(video);
        }
      }
    });

    return blocks.length ? blocks : '';
  }

  const stringValue = toString(value);
  return stringValue || '';
}

function toRoadmapSteps(value: unknown): Array<{ title: string; description?: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        const title = entry.trim();
        return title ? { title } : undefined;
      }

      if (!entry || typeof entry !== 'object') {
        return undefined;
      }

      const titleValue = toString((entry as any).title ?? (entry as any).label ?? '').trim();
      const descriptionValue = toString(
        (entry as any).content ?? (entry as any).description ?? ''
      ).trim();

      if (!titleValue) {
        return undefined;
      }

      return {
        title: titleValue,
        description: descriptionValue || undefined,
      };
    })
    .filter((step): step is { title: string; description?: string } => Boolean(step));
}

function toCalloutVideo(entry: any): CalloutRichContent | undefined {
  const src = toVideoUrl(entry);
  if (!src) {
    return undefined;
  }

  const titleValue = toString((entry as any).title ?? (entry as any).caption ?? '').trim();

  return {
    type: 'video',
    src,
    title: titleValue || undefined,
  };
}

function toVideoUrl(entry: any): string {
  let url = '';

  if (typeof entry?.src === 'string' && entry.src.trim().length) {
    url = entry.src.trim();
  } else if (typeof entry?.youtubeId === 'string' && entry.youtubeId.trim().length) {
    url = `https://www.youtube.com/embed/${encodeURIComponent(entry.youtubeId.trim())}`;
  } else if (typeof entry?.url === 'string' && entry.url.trim().length) {
    try {
      const parsed = new URL(entry.url.trim());
      if (parsed.hostname.includes('youtube.com')) {
        const id = parsed.searchParams.get('v');
        if (id) {
          url = `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
        } else {
          url = parsed.toString();
        }
      } else if (parsed.hostname === 'youtu.be') {
        const id = parsed.pathname.replace(/\//g, '');
        url = id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : parsed.toString();
      } else {
        url = parsed.toString();
      }
    } catch (error) {
      url = entry.url;
    }
  }

  const start = toStartSeconds(
    entry?.start ?? entry?.time ?? entry?.begin ?? entry?.from ?? entry?.offset
  );
  return appendStartParameter(url, start);
}

function toStartSeconds(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === 'string' && value.trim().length) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return Math.floor(numeric);
    }

    const segments = value
      .split(':')
      .map((segment) => Number(segment.trim()))
      .filter((segment) => !Number.isNaN(segment));

    if (segments.length >= 2) {
      return segments.reduce((total, segment) => total * 60 + segment, 0);
    }
  }

  return undefined;
}

function appendStartParameter(url: string, start?: number): string {
  if (!url) {
    return '';
  }

  if (!start || !Number.isFinite(start) || start <= 0) {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('start', String(Math.floor(start)));
    return parsed.toString();
  } catch (error) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}start=${Math.floor(start)}`;
  }
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBlockEntries(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      title: string;
      summary?: string;
      layer: number;
      row?: number;
      kind?: string;
      badge?: string;
      metrics?: Array<{ id: string; label: string; value: string }>;
    }>;
  }

  return value
    .map((entry) => {
      const record = toRecord(entry);
      return {
        id: toString(record.id),
        title: toString(record.title),
        summary: toOptionalString(record.summary),
        layer: toNumber(record.layer, 0),
        row: record.row !== undefined ? toNumber(record.row) : undefined,
        kind: toOptionalString(record.kind),
        badge: toOptionalString(record.badge),
        metrics: toMetricEntries(record.metrics),
      };
    })
    .filter((block) => block.id && block.title);
}

function toMetricEntries(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ id: string; label: string; value: string }>;
  }

  return value
    .map((metric) => {
      const record = toRecord(metric);
      const id = toString(record.id);
      const label = toString(record.label);
      if (!id || !label) {
        return undefined;
      }
      return {
        id,
        label,
        value: toString(record.value),
      };
    })
    .filter((metric): metric is { id: string; label: string; value: string } => Boolean(metric));
}

function toChannelEntries(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      from: string;
      to: string;
      description?: string;
      kind?: string;
    }>;
  }

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const from = toString(record.from);
      const to = toString(record.to);
      if (!id || !from || !to) {
        return undefined;
      }
      return {
        id,
        from,
        to,
        description: toOptionalString(record.description),
        kind: toOptionalString(record.kind),
      };
    })
    .filter(
      (
        channel
      ): channel is {
        id: string;
        from: string;
        to: string;
        description: string | undefined;
        kind: string | undefined;
      } => Boolean(channel)
    );
}

function toLegendEntries(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ id: string; label: string; description?: string; kind?: string }>;
  }

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const label = toString(record.label);
      if (!id || !label) {
        return undefined;
      }
      return {
        id,
        label,
        description: toOptionalString(record.description),
        kind: toOptionalString(record.kind),
      };
    })
    .filter(
      (
        item
      ): item is {
        id: string;
        label: string;
        description: string | undefined;
        kind: string | undefined;
      } => Boolean(item)
    );
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  return [];
}

function toMatrix(value: unknown): string[][] {
  if (Array.isArray(value)) {
    return value.map((row) => (Array.isArray(row) ? row.map((cell) => String(cell)) : []));
  }
  return [];
}

function toTableRows(value: unknown): TableRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((row) => {
    if (!Array.isArray(row)) {
      return [];
    }

    return row.map((cell) => {
      if (cell && typeof cell === 'object' && !Array.isArray(cell)) {
        const record = cell as Record<string, unknown>;
        return {
          value: toString(record.value ?? record.text ?? ''),
          mono: Boolean(record.mono),
          code: Boolean(record.code),
        } satisfies TableCell;
      }

      return { value: String(cell) } satisfies TableCell;
    });
  });
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

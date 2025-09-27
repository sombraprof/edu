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
import Md3LogicOperators from '@/components/lesson/Md3LogicOperators.vue';
import Md3Table from '@/components/lesson/Md3Table.vue';
import MemoryDiagram from '@/components/lesson/MemoryDiagram.vue';
import OrderedList from '@/components/lesson/OrderedList.vue';
import Representations from '@/components/lesson/Representations.vue';
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
  MemoryDiagram,
  OrderedList,
  CardGrid,
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
  callout(block) {
    return {
      component: Callout,
      props: {
        variant: toString(block.variant),
        title: toString(block.title),
        content: toString(block.content),
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

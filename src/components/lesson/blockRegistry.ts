import Accordion from '@/components/lesson/Accordion.vue';
import AudioBlock from '@/components/lesson/AudioBlock.vue';
import BibliographyBlock from '@/components/lesson/BibliographyBlock.vue';
import Callout from '@/components/lesson/Callout.vue';
import CardGrid from '@/components/lesson/CardGrid.vue';
import ChecklistBlock from '@/components/lesson/ChecklistBlock.vue';
import CodeBlock from '@/components/lesson/CodeBlock.vue';
import ContentBlock from '@/components/lesson/ContentBlock.vue';
import FlightPlan from '@/components/lesson/FlightPlan.vue';
import ClassDesigner from '@/components/lesson/ClassDesigner.vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';
import LegacySection from '@/components/lesson/LegacySection.vue';
import LessonPlan from '@/components/lesson/LessonPlan.vue';
import Md3BlockDiagram from '@/components/lesson/Md3BlockDiagram.vue';
import Md3Flowchart from '@/components/lesson/Md3Flowchart.vue';
import Md3LogicOperators from '@/components/lesson/Md3LogicOperators.vue';
import Md3Table from '@/components/lesson/Md3Table.vue';
import MemoryDiagram from '@/components/lesson/MemoryDiagram.vue';
import OrderedList from '@/components/lesson/OrderedList.vue';
import PipelineCanvas from '@/components/lesson/PipelineCanvas.vue';
import Representations from '@/components/lesson/Representations.vue';
import Roadmap from '@/components/lesson/Roadmap.vue';
import SystemMapper from '@/components/lesson/SystemMapper.vue';
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
  ClassDesigner,
  PipelineCanvas,
  SystemMapper,
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
  md3Flowchart(block) {
    return {
      component: Md3Flowchart,
      props: {
        title: toOptionalString(block.title),
        summary: toOptionalString(block.summary),
        nodes: toFlowNodes(block.nodes),
        connections: toFlowConnections(block.connections),
      },
    };
  },
  classDesigner(block) {
    return {
      component: ClassDesigner,
      props: {
        title: toOptionalString(block.title),
        summary: toOptionalString(block.summary),
        classes: toUmlClasses(block.classes),
        relationships: toUmlRelationships(block.relationships),
        legend: toLegendEntries(block.legend),
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
  pipelineCanvas(block) {
    return {
      component: PipelineCanvas,
      props: {
        title: toOptionalString(block.title),
        summary: toOptionalString(block.summary),
        stages: toPipelineStages(block.stages ?? block.columns ?? block.steps),
        milestones: toPipelineMilestones(block.milestones),
      },
    };
  },
  systemMapper(block) {
    return {
      component: SystemMapper,
      props: {
        title: toOptionalString(block.title),
        summary: toOptionalString(block.summary),
        factors: toSystemFactors(block.factors),
        loops: toSystemLoops(block.loops ?? block.cycles),
        insights: toSystemInsights(block.insights),
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

function toOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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
          .map((item: unknown) => {
            if (typeof item === 'string') {
              return item.trim();
            }

            if (item && typeof item === 'object') {
              return toString((item as any).text ?? (item as any).value ?? '').trim();
            }

            return '';
          })
          .filter((item: string) => item.length > 0);
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

function toUmlClasses(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      name: string;
      stereotype?: string;
      summary?: string;
      type?: 'class' | 'interface' | 'enum';
      attributes?: Array<{
        id: string;
        signature: string;
        visibility?: 'public' | 'private' | 'protected' | 'package';
        note?: string;
      }>;
      methods?: Array<{
        id: string;
        signature: string;
        visibility?: 'public' | 'private' | 'protected' | 'package';
        note?: string;
      }>;
      responsibilities?: string[];
      notes?: string[];
    }>;
  }

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const name = toString(record.name);
      if (!id || !name) {
        return undefined;
      }
      return {
        id,
        name,
        stereotype: toOptionalTrimmedString(record.stereotype),
        summary: toOptionalTrimmedString(record.summary),
        type: toUmlType(record.type),
        attributes: toUmlMembers(record.attributes),
        methods: toUmlMembers(record.methods),
        responsibilities: toTrimmedStringArray(record.responsibilities),
        notes: toTrimmedStringArray(record.notes),
      };
    })
    .filter((umlClass): umlClass is NonNullable<typeof umlClass> => Boolean(umlClass));
}

function toUmlMembers(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      signature: string;
      visibility?: 'public' | 'private' | 'protected' | 'package';
      note?: string;
    }>;
  }

  return value
    .map((entry, index) => {
      const record = toRecord(entry);
      const signature = toOptionalTrimmedString(record.signature ?? record.text);
      if (!signature) {
        return undefined;
      }
      const visibility = toUmlVisibility(record.visibility);
      return {
        id: toString(record.id) || `member-${index}`,
        signature,
        visibility,
        note: toOptionalTrimmedString(record.note),
      };
    })
    .filter((member): member is NonNullable<typeof member> => Boolean(member));
}

function toUmlRelationships(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      from: string;
      to: string;
      type:
        | 'association'
        | 'aggregation'
        | 'composition'
        | 'inheritance'
        | 'realization'
        | 'dependency';
      description?: string;
      fromMultiplicity?: string;
      toMultiplicity?: string;
    }>;
  }

  const types = new Set([
    'association',
    'aggregation',
    'composition',
    'inheritance',
    'realization',
    'dependency',
  ]);

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const from = toString(record.from);
      const to = toString(record.to);
      const type = toOptionalTrimmedString(record.type);
      if (!id || !from || !to || !type || !types.has(type)) {
        return undefined;
      }
      return {
        id,
        from,
        to,
        type: type as any,
        description: toOptionalTrimmedString(record.description),
        fromMultiplicity: toOptionalTrimmedString(record.fromMultiplicity),
        toMultiplicity: toOptionalTrimmedString(record.toMultiplicity),
      };
    })
    .filter((relationship): relationship is NonNullable<typeof relationship> =>
      Boolean(relationship)
    );
}

function toPipelineStages(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      title: string;
      summary?: string;
      status?: 'not-started' | 'in-progress' | 'blocked' | 'done';
      owners?: string[];
      durationHours?: number;
      activities?: Array<{
        id: string;
        label: string;
        description?: string;
        role?: string;
      }>;
      deliverables?: Array<{
        id: string;
        label: string;
        description?: string;
        evidence?: string;
      }>;
      risks?: Array<{
        id: string;
        label: string;
        severity?: 'low' | 'medium' | 'high';
        mitigation?: string;
      }>;
      checkpoints?: string[];
    }>;
  }

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const title = toString(record.title);
      if (!id || !title) {
        return undefined;
      }
      return {
        id,
        title,
        summary: toOptionalTrimmedString(record.summary),
        status: toPipelineStatus(record.status),
        owners: toTrimmedStringArray(record.owners),
        durationHours: toPositiveNumber(record.durationHours),
        activities: toPipelineActivities(record.activities),
        deliverables: toPipelineDeliverables(record.deliverables),
        risks: toPipelineRisks(record.risks),
        checkpoints: toTrimmedStringArray(record.checkpoints),
      };
    })
    .filter((stage): stage is NonNullable<typeof stage> => Boolean(stage));
}

function toPipelineActivities(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ id: string; label: string; description?: string; role?: string }>;
  }

  return value
    .map((entry, index) => {
      const record = toRecord(entry);
      const label = toOptionalTrimmedString(record.label ?? record.title);
      if (!label) {
        return undefined;
      }
      return {
        id: toString(record.id) || `activity-${index}`,
        label,
        description: toOptionalTrimmedString(record.description),
        role: toOptionalTrimmedString(record.role ?? record.owner),
      };
    })
    .filter((activity): activity is NonNullable<typeof activity> => Boolean(activity));
}

function toPipelineDeliverables(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ id: string; label: string; description?: string; evidence?: string }>;
  }

  return value
    .map((entry, index) => {
      const record = toRecord(entry);
      const label = toOptionalTrimmedString(record.label ?? record.title);
      if (!label) {
        return undefined;
      }
      return {
        id: toString(record.id) || `deliverable-${index}`,
        label,
        description: toOptionalTrimmedString(record.description),
        evidence: toOptionalTrimmedString(record.evidence ?? record.proof),
      };
    })
    .filter((deliverable): deliverable is NonNullable<typeof deliverable> => Boolean(deliverable));
}

function toPipelineRisks(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      label: string;
      severity?: 'low' | 'medium' | 'high';
      mitigation?: string;
    }>;
  }

  const severities = new Set(['low', 'medium', 'high']);

  return value
    .map((entry, index) => {
      const record = toRecord(entry);
      const label = toOptionalTrimmedString(record.label ?? record.title);
      if (!label) {
        return undefined;
      }
      const severityValue = toOptionalTrimmedString(record.severity);
      const severity =
        severityValue && severities.has(severityValue) ? (severityValue as any) : undefined;
      return {
        id: toString(record.id) || `risk-${index}`,
        label,
        severity,
        mitigation: toOptionalTrimmedString(record.mitigation ?? record.response),
      };
    })
    .filter((risk): risk is NonNullable<typeof risk> => Boolean(risk));
}

function toPipelineMilestones(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ id: string; title: string; description?: string; due?: string }>;
  }

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const title = toString(record.title);
      if (!id || !title) {
        return undefined;
      }
      return {
        id,
        title,
        description: toOptionalTrimmedString(record.description),
        due: toOptionalTrimmedString(record.due ?? record.date),
      };
    })
    .filter((milestone): milestone is NonNullable<typeof milestone> => Boolean(milestone));
}

function toSystemFactors(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      name: string;
      summary?: string;
      kind?: 'stock' | 'flow' | 'driver' | 'outcome' | 'constraint';
      indicators?: string[];
    }>;
  }

  const kinds = new Set(['stock', 'flow', 'driver', 'outcome', 'constraint']);

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const name = toString(record.name ?? record.label);
      if (!id || !name) {
        return undefined;
      }
      const kindValue = toOptionalTrimmedString(record.kind ?? record.type);
      const kind = kindValue && kinds.has(kindValue) ? (kindValue as any) : undefined;
      return {
        id,
        name,
        summary: toOptionalTrimmedString(record.summary ?? record.description),
        kind,
        indicators: toTrimmedStringArray(record.indicators),
      };
    })
    .filter((factor): factor is NonNullable<typeof factor> => Boolean(factor));
}

function toSystemLoops(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      name: string;
      polarity: 'reinforcing' | 'balancing';
      summary?: string;
      steps?: Array<{
        id: string;
        from: string;
        to: string;
        effect?: 'reinforces' | 'balances';
        description?: string;
      }>;
      insights?: string[];
    }>;
  }

  const polarities = new Set(['reinforcing', 'balancing']);

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const name = toString(record.name ?? record.title);
      const polarityValue = toOptionalTrimmedString(record.polarity ?? record.type);
      if (!id || !name || !polarityValue || !polarities.has(polarityValue)) {
        return undefined;
      }
      return {
        id,
        name,
        polarity: polarityValue as any,
        summary: toOptionalTrimmedString(record.summary ?? record.description),
        steps: toSystemSteps(record.steps ?? record.connections),
        insights: toTrimmedStringArray(record.insights),
      };
    })
    .filter((loop): loop is NonNullable<typeof loop> => Boolean(loop));
}

function toSystemSteps(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      from: string;
      to: string;
      effect?: 'reinforces' | 'balances';
      description?: string;
    }>;
  }

  const effects = new Set(['reinforces', 'balances']);

  return value
    .map((entry, index) => {
      const record = toRecord(entry);
      const from = toOptionalTrimmedString(record.from ?? record.source);
      const to = toOptionalTrimmedString(record.to ?? record.target);
      if (!from || !to) {
        return undefined;
      }
      const effectValue = toOptionalTrimmedString(record.effect ?? record.polarity);
      const effect = effectValue && effects.has(effectValue) ? (effectValue as any) : undefined;
      return {
        id: toString(record.id) || `step-${index}`,
        from,
        to,
        effect,
        description: toOptionalTrimmedString(record.description),
      };
    })
    .filter((step): step is NonNullable<typeof step> => Boolean(step));
}

function toSystemInsights(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ id: string; label: string; description?: string }>;
  }

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const label = toString(record.label ?? record.title);
      if (!id || !label) {
        return undefined;
      }
      return {
        id,
        label,
        description: toOptionalTrimmedString(record.description),
      };
    })
    .filter((insight): insight is NonNullable<typeof insight> => Boolean(insight));
}

function toUmlType(value: unknown) {
  const type = toOptionalTrimmedString(value);
  if (!type) {
    return undefined;
  }
  const allowed = new Set(['class', 'interface', 'enum']);
  return allowed.has(type) ? (type as any) : undefined;
}

function toUmlVisibility(value: unknown) {
  const visibility = toOptionalTrimmedString(value);
  if (!visibility) {
    return undefined;
  }
  const allowed = new Set(['public', 'private', 'protected', 'package']);
  return allowed.has(visibility) ? (visibility as any) : undefined;
}

function toPipelineStatus(value: unknown) {
  const status = toOptionalTrimmedString(value);
  if (!status) {
    return undefined;
  }
  const allowed = new Set(['not-started', 'in-progress', 'blocked', 'done']);
  return allowed.has(status) ? (status as any) : undefined;
}

function toFlowNodes(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      id: string;
      type: 'start' | 'process' | 'input' | 'output' | 'decision' | 'end';
      title: string;
      summary?: string;
      branches?: Array<{ id: string; label: string; target: string; description?: string }>;
    }>;
  }

  const types = new Set(['start', 'process', 'input', 'output', 'decision', 'end']);

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const id = toString(record.id);
      const title = toString(record.title ?? record.name);
      const typeValue = toOptionalTrimmedString(record.type ?? record.kind);
      if (!id || !title || !typeValue || !types.has(typeValue)) {
        return undefined;
      }
      return {
        id,
        type: typeValue as any,
        title,
        summary: toOptionalTrimmedString(record.summary ?? record.description),
        branches: toFlowBranches(record.branches),
      };
    })
    .filter((node): node is NonNullable<typeof node> => Boolean(node));
}

function toFlowBranches(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ id: string; label: string; target: string; description?: string }>;
  }

  return value
    .map((entry, index) => {
      const record = toRecord(entry);
      const label = toOptionalTrimmedString(record.label ?? record.title);
      const target = toOptionalTrimmedString(record.target ?? record.to);
      if (!label || !target) {
        return undefined;
      }
      return {
        id: toString(record.id) || `branch-${index}`,
        label,
        target,
        description: toOptionalTrimmedString(record.description),
      };
    })
    .filter((branch): branch is NonNullable<typeof branch> => Boolean(branch));
}

function toFlowConnections(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      from: string;
      to: string;
      label?: string;
      kind?: 'default' | 'loop' | 'fallback';
    }>;
  }

  const kinds = new Set(['default', 'loop', 'fallback']);

  return value
    .map((entry) => {
      const record = toRecord(entry);
      const from = toOptionalTrimmedString(record.from);
      const to = toOptionalTrimmedString(record.to);
      if (!from || !to) {
        return undefined;
      }
      const kindValue = toOptionalTrimmedString(record.kind);
      const kind = kindValue && kinds.has(kindValue) ? (kindValue as any) : undefined;
      return {
        from,
        to,
        label: toOptionalTrimmedString(record.label),
        kind,
      };
    })
    .filter((connection): connection is NonNullable<typeof connection> => Boolean(connection));
}

function toTrimmedStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item): item is string => item.length > 0);
}

function toPositiveNumber(value: unknown): number | undefined {
  const numberValue = Number(value);
  if (Number.isFinite(numberValue) && numberValue > 0) {
    return numberValue;
  }
  return undefined;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

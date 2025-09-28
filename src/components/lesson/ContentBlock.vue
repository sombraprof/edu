<template>
  <section :class="['content-block', { 'content-block--nested': nested }]">
    <header v-if="data.title" class="content-block__header">
      <h3 class="content-block__title">{{ data.title }}</h3>
    </header>

    <div class="content-block__body">
      <template v-for="(item, index) in normalizedContent" :key="index">
        <p
          v-if="isParagraph(item)"
          class="content-block__paragraph"
          v-html="sanitizeContent(item.html ?? item.text)"
        ></p>

        <blockquote v-else-if="isBlockquote(item)" class="content-block__blockquote">
          <p v-html="sanitizeContent(item.text)"></p>
          <cite v-if="item.source" v-html="sanitizeContent(item.source)"></cite>
        </blockquote>

        <ul v-else-if="isBulletList(item)" class="content-block__list" role="list">
          <li
            v-for="(entry, entryIndex) in formatListItems(item.items)"
            :key="entryIndex"
            v-html="entry"
          ></li>
        </ul>

        <ol
          v-else-if="isNumberedList(item)"
          class="content-block__list content-block__list--ordered"
          role="list"
        >
          <li
            v-for="(entry, entryIndex) in formatListItems(item.items)"
            :key="entryIndex"
            v-html="entry"
          ></li>
        </ol>

        <OrderedList
          v-else-if="isOrderedListBlock(item)"
          :items="formatOrderedListItems(item.items)"
          class="content-block__ordered-component"
        />

        <dl v-else-if="isDefinitionListBlock(item)" class="content-block__definition-list">
          <template
            v-for="(definition, defIndex) in normalizeDefinitionList(item.items)"
            :key="defIndex"
          >
            <dt v-html="definition.term"></dt>
            <dd v-html="definition.definition"></dd>
          </template>
        </dl>

        <div v-else-if="isSubBlock(item)" class="content-block__sub-block">
          <h4 class="content-block__sub-title">{{ item.title }}</h4>
          <template v-for="(subItem, subIndex) in getSubItems(item)" :key="subIndex">
            <p
              v-if="typeof subItem === 'string'"
              class="content-block__paragraph"
              v-html="sanitizeContent(subItem)"
            ></p>
            <component
              v-else-if="isComponent(subItem)"
              :is="resolveComponent(subItem.component)"
              v-bind="subItem.props || {}"
            />
            <component
              v-else-if="isCalloutBlock(subItem)"
              :is="Callout"
              :variant="resolveCalloutVariant(subItem.variant)"
              :title="subItem.title"
              :content="normalizeCalloutContent(subItem.richContent ?? subItem.content)"
            />
          </template>
        </div>

        <component
          v-else-if="isCalloutBlock(item)"
          :is="Callout"
          :variant="resolveCalloutVariant(item.variant)"
          :title="item.title"
          :content="normalizeCalloutContent(item.richContent ?? item.content)"
        />

        <CodeBlock
          v-else-if="item.type === 'code'"
          :code="String(item.code ?? '')"
          :language="resolveCodeLanguage(item.language)"
          :plainText="shouldUsePlainText(resolveCodeLanguage(item.language))"
        />

        <component
          v-else-if="item.type === 'contentBlock' && selfComponent"
          :is="selfComponent"
          :data="item"
          nested
        />

        <AudioBlock
          v-else-if="item.type === 'audioBlock' || item.type === 'audio'"
          v-bind="normalizeAudioBlock(item)"
        />

        <CardGrid v-else-if="item.type === 'cardGrid'" :data="castCardGridData(item)" />

        <Timeline v-else-if="item.type === 'timeline'" :data="castTimelineData(item)" />

        <Accordion v-else-if="item.type === 'accordion'" :data="castAccordionData(item)" />

        <VideosBlock
          v-else-if="item.type === 'videosBlock' || item.type === 'videos'"
          :data="normalizeVideosBlock(item)"
        />

        <BibliographyBlock
          v-else-if="item.type === 'bibliography' || item.type === 'bibliographyBlock'"
          :data="normalizeBibliography(item)"
        />

        <LessonChart
          v-else-if="item.type === 'chart' || item.type === 'barChart'"
          v-bind="normalizeChart(item)"
        />

        <Roadmap v-else-if="item.type === 'roadmap'" :steps="normalizeRoadmapSteps(item.steps)" />

        <Md3Table
          v-else-if="item.type === 'md3Table'"
          :headers="normalizeTableHeaders(item.headers)"
          :rows="normalizeTableRows(item.rows)"
        />

        <TruthTable
          v-else-if="item.type === 'truthTable'"
          :title="item.title"
          :headers="normalizeTruthTableHeaders(item.headers)"
          :rows="normalizeTruthTableRows(item.rows)"
          :caption="item.caption"
          :description="item.description"
          :legend="normalizeTruthTableLegend(item.legend)"
          :dense="Boolean(item.dense)"
        />

        <FlightPlan v-else-if="item.type === 'flightPlan'" :data="castFlightPlanData(item)" />

        <LessonPlan v-else-if="item.type === 'lessonPlan'" :data="castLessonPlanData(item)" />

        <ChecklistBlock v-else-if="item.type === 'checklist'" :data="castChecklistData(item)" />

        <MemoryDiagram
          v-else-if="item.type === 'memoryDiagram'"
          v-bind="castMemoryDiagramProps(item)"
        />

        <div v-else-if="item.type === 'image'" class="content-block__figure">
          <img :src="item.src" :alt="item.alt ?? ''" />
          <p
            v-if="item.caption"
            class="content-block__figure-caption"
            v-html="sanitizeContent(item.caption)"
          ></p>
        </div>

        <div v-else-if="item.type === 'video'" class="content-block__video">
          <div class="content-block__video-frame">
            <iframe
              :src="resolveVideoSrc(item)"
              title="Video player"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p v-if="item.title" class="content-block__video-title">{{ item.title }}</p>
        </div>

        <a
          v-else-if="item.type === 'button' && item.href"
          class="content-block__button"
          :href="item.href"
          target="_blank"
          rel="noreferrer"
        >
          {{ item.text ?? item.label ?? 'Abrir recurso' }}
        </a>

        <component
          v-else-if="isComponent(item)"
          :is="resolveComponent(item.component)"
          v-bind="item.props || {}"
        />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';
import Accordion from './Accordion.vue';
import AudioBlock from './AudioBlock.vue';
import BibliographyBlock from './BibliographyBlock.vue';
import Callout from './Callout.vue';
import CardGrid from './CardGrid.vue';
import ChecklistBlock from './ChecklistBlock.vue';
import CodeBlock from './CodeBlock.vue';
import FlightPlan from './FlightPlan.vue';
import LessonChart from './LessonChart.vue';
import LessonPlan from './LessonPlan.vue';
import Md3BlockDiagram from './Md3BlockDiagram.vue';
import Md3Flowchart from './Md3Flowchart.vue';
import Md3LogicOperators from './Md3LogicOperators.vue';
import Md3Table from './Md3Table.vue';
import MemoryDiagram from './MemoryDiagram.vue';
import OrderedList from './OrderedList.vue';
import Roadmap from './Roadmap.vue';
import Timeline from './Timeline.vue';
import TruthTable from './TruthTable.vue';
import VideosBlock from './VideosBlock.vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

type ContentBlockEntry = {
  type?: string;
  [key: string]: any;
};

type ContentBlockData = {
  title?: string;
  content?: Array<ContentBlockEntry | null | undefined>;
};

type CalloutParagraph = { type: 'paragraph'; text: string };
type CalloutList = { type: 'list'; ordered?: boolean; items: string[] };
type CalloutCode = { type: 'code'; code: string; language?: string };
type CalloutRoadmap = {
  type: 'roadmap';
  steps: Array<{ title: string; description?: string }>;
};
type CalloutVideo = { type: 'video'; src: string; title?: string };
type CalloutContentBlock =
  | CalloutParagraph
  | CalloutList
  | CalloutCode
  | CalloutRoadmap
  | CalloutVideo;

type ComponentProps<C> = C extends new (...args: any[]) => { $props: infer P } ? P : never;
type ComponentDataProp<C> = ComponentProps<C> extends { data: infer D } ? D : never;

const props = withDefaults(defineProps<{ data: ContentBlockData; nested?: boolean }>(), {
  nested: false,
});

const nested = computed(() => Boolean(props.nested));

function isContentEntry(value: unknown): value is ContentBlockEntry {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

const normalizedContent = computed<ContentBlockEntry[]>(() =>
  Array.isArray(props.data?.content)
    ? props.data.content.filter((entry): entry is ContentBlockEntry => isContentEntry(entry))
    : []
);

const componentRegistry = {
  AudioBlock,
  CardGrid,
  MemoryDiagram,
  Md3BlockDiagram,
  Md3Flowchart,
  Md3Table,
  Md3LogicOperators,
  OrderedList,
  Roadmap,
  Callout,
  Accordion,
  Timeline,
  VideosBlock,
  BibliographyBlock,
  FlightPlan,
  LessonPlan,
  ChecklistBlock,
  TruthTable,
} as const;

type RegistryKey = keyof typeof componentRegistry;

const instance = getCurrentInstance();
const selfComponent = instance?.type;

function resolveComponent(name?: string) {
  if (!name) return null;
  return componentRegistry[name as RegistryKey] ?? null;
}

function isComponent(
  value: unknown
): value is { component: string; props?: Record<string, unknown> } {
  return (
    Boolean(value) && typeof value === 'object' && typeof (value as any).component === 'string'
  );
}

function isParagraph(value: unknown): value is { type: 'paragraph'; text?: string; html?: string } {
  return isContentEntry(value) && value.type === 'paragraph';
}

function isBlockquote(
  value: unknown
): value is { type: 'blockquote'; text: string; source?: string } {
  return isContentEntry(value) && value.type === 'blockquote';
}

function isBulletList(value: unknown): value is { type: 'list' | 'unorderedList'; items: unknown } {
  return (
    isContentEntry(value) &&
    (value.type === 'list' || value.type === 'unorderedList') &&
    Array.isArray(value.items)
  );
}

function isNumberedList(value: unknown): value is { type: 'list'; ordered: true; items: unknown } {
  return isContentEntry(value) && value.type === 'list' && value.ordered === true;
}

type OrderedListBlock = ContentBlockEntry & { type: 'orderedList'; items?: unknown };
type DefinitionListBlock = ContentBlockEntry & { type: 'definitionList'; items?: unknown };
type SubBlock = ContentBlockEntry & { type: 'subBlock'; title?: string; items?: unknown };
type CalloutBlock = {
  type: 'callout';
  variant?: string;
  title?: string;
  content?: unknown;
  richContent?: unknown;
};

function isOrderedListBlock(value: unknown): value is OrderedListBlock {
  return isContentEntry(value) && value.type === 'orderedList';
}

function isDefinitionListBlock(value: unknown): value is DefinitionListBlock {
  return isContentEntry(value) && value.type === 'definitionList';
}

function isSubBlock(value: unknown): value is SubBlock {
  return isContentEntry(value) && value.type === 'subBlock';
}

function getSubItems(block: SubBlock): unknown[] {
  return Array.isArray(block.items) ? block.items : [];
}

function isCalloutBlock(item: unknown): item is CalloutBlock {
  return isContentEntry(item) && item.type === 'callout';
}

const CALLOUT_VARIANTS = ['info', 'academic', 'good-practice', 'warning', 'task', 'error'] as const;

type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

function resolveCalloutVariant(variant: unknown): CalloutVariant {
  return typeof variant === 'string' && (CALLOUT_VARIANTS as readonly string[]).includes(variant)
    ? (variant as CalloutVariant)
    : 'info';
}

function resolveCodeLanguage(language: unknown): string | undefined {
  return typeof language === 'string' && language.trim().length > 0 ? language : undefined;
}

function castCardGridData(item: ContentBlockEntry) {
  return item as ComponentDataProp<typeof CardGrid>;
}

function castTimelineData(item: ContentBlockEntry) {
  return item as ComponentDataProp<typeof Timeline>;
}

function castAccordionData(item: ContentBlockEntry) {
  return item as ComponentDataProp<typeof Accordion>;
}

function castFlightPlanData(item: ContentBlockEntry) {
  return item as ComponentDataProp<typeof FlightPlan>;
}

function castLessonPlanData(item: ContentBlockEntry) {
  return item as ComponentDataProp<typeof LessonPlan>;
}

function castChecklistData(item: ContentBlockEntry) {
  return item as ComponentDataProp<typeof ChecklistBlock>;
}

function castMemoryDiagramProps(item: ContentBlockEntry) {
  return item as ComponentProps<typeof MemoryDiagram>;
}

function shouldUsePlainText(language?: string): boolean {
  if (!language) {
    return true;
  }
  const normalized = language.toLowerCase();
  return normalized === 'plaintext' || normalized === 'pseudocode' || normalized === 'text';
}

function formatOrderedListItems(items: unknown): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((entry) => {
      if (typeof entry === 'string') {
        return sanitizeContent(entry);
      }

      if (entry && typeof entry === 'object') {
        const title =
          typeof (entry as any).title === 'string'
            ? `<strong>${sanitizeContent((entry as any).title)}:</strong> `
            : '';
        const text =
          typeof (entry as any).text === 'string' ? sanitizeContent((entry as any).text) : '';
        return `${title}${text}`.trim();
      }

      return '';
    })
    .filter((value): value is string => Boolean(value));
}

function formatListItems(items: unknown): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((entry) => {
      if (typeof entry === 'string') {
        return sanitizeContent(entry);
      }

      if (entry && typeof entry === 'object') {
        const text = (entry as any).text ?? (entry as any).value ?? '';
        return sanitizeContent(text);
      }

      return '';
    })
    .filter((value): value is string => Boolean(value));
}

function normalizeDefinitionList(items: unknown): Array<{ term: string; definition: string }> {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return undefined;
      }

      const term = sanitizeContent((entry as any).term ?? '');
      const definition = sanitizeContent((entry as any).definition ?? '');
      if (!term || !definition) {
        return undefined;
      }

      return { term, definition };
    })
    .filter((value): value is { term: string; definition: string } => Boolean(value));
}

function normalizeCalloutContent(value: unknown): string | CalloutContentBlock[] {
  if (Array.isArray(value)) {
    const blocks: CalloutContentBlock[] = [];

    value.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      const type = (entry as any).type;

      if (type === 'paragraph') {
        const text = sanitizeContent((entry as any).text ?? (entry as any).html ?? '');
        if (text) {
          blocks.push({ type: 'paragraph', text });
        }
        return;
      }

      if (type === 'list') {
        const ordered = Boolean((entry as any).ordered);
        const items = formatListItems((entry as any).items ?? []);
        if (items.length) {
          blocks.push({ type: 'list', ordered, items });
        }
        return;
      }

      if (type === 'code') {
        const code = typeof (entry as any).code === 'string' ? (entry as any).code : '';
        if (code.trim().length) {
          const language =
            typeof (entry as any).language === 'string' ? (entry as any).language : undefined;
          blocks.push({ type: 'code', code, language });
        }
        return;
      }

      if (type === 'roadmap') {
        const steps = normalizeRoadmapSteps((entry as any).steps ?? (entry as any).items ?? []);
        if (steps.length) {
          blocks.push({ type: 'roadmap', steps });
        }
        return;
      }

      if (type === 'video') {
        const video = normalizeCalloutVideo(entry);
        if (video) {
          blocks.push(video);
        }
      }
    });

    return blocks;
  }

  if (typeof value === 'string') {
    return sanitizeContent(value);
  }

  return '';
}

function normalizeVideosBlock(item: any) {
  if (item.type === 'videosBlock') {
    return item;
  }

  const videos = Array.isArray(item.videos)
    ? item.videos
    : [
        {
          title: item.title,
          src: resolveVideoSrc(item),
          caption: item.caption,
        },
      ];

  return {
    title: item.title ?? 'Vídeos',
    videos,
  };
}

type ChartSegment = { label: string; value: number; color?: string };

function normalizeChart(item: any) {
  if (item.type === 'barChart') {
    const segments = Array.isArray(item.data)
      ? item.data
          .map((entry: unknown): ChartSegment => {
            const record = (entry && typeof entry === 'object' ? entry : {}) as Record<
              string,
              unknown
            >;
            return {
              label: String(record.label ?? ''),
              value: Number(record.value ?? 0),
              color: typeof record.color === 'string' ? record.color : undefined,
            };
          })
          .filter((segment: ChartSegment) => segment.label && Number.isFinite(segment.value))
      : [];

    return {
      type: 'bar' as const,
      title: item.title,
      source: item.source,
      segments,
    };
  }

  const dataset =
    item?.data && Array.isArray(item.data.datasets) ? (item.data.datasets[0] ?? {}) : {};

  const labels = Array.isArray(item?.data?.labels) ? item.data.labels : [];
  const values = Array.isArray(dataset.data) ? dataset.data : [];
  const colors = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor : [];

  const segments = labels
    .map(
      (label: any, index: number): ChartSegment => ({
        label: String(label ?? ''),
        value: Number(values[index] ?? 0),
        color: typeof colors[index] === 'string' ? colors[index] : undefined,
      })
    )
    .filter((segment: ChartSegment) => segment.label && Number.isFinite(segment.value));

  return {
    type: 'pie' as const,
    title: item.title ?? dataset.label,
    segments,
    source: item.source ?? dataset.source,
  };
}

function normalizeAudioBlock(item: any) {
  const title =
    typeof item?.title === 'string' && item.title.trim().length
      ? item.title.trim()
      : 'Conteúdo em áudio';
  const src = typeof item?.src === 'string' ? item.src.trim() : '';
  return { title, src };
}

function normalizeBibliography(item: any) {
  const title =
    typeof item?.title === 'string' && item.title.trim().length ? item.title : 'Bibliografia';

  const references = Array.isArray(item?.references) ? item.references : undefined;
  const items = Array.isArray(item?.items) ? item.items : undefined;
  const content = Array.isArray(item?.content) ? item.content : undefined;

  if (references?.length) {
    return {
      title,
      items: references.map((entry: any) => sanitizeContent(entry)).filter(Boolean),
    };
  }

  if (items?.length) {
    return {
      title,
      items: items.map((entry: any) => sanitizeContent(entry)).filter(Boolean),
    };
  }

  if (content?.length) {
    const normalizedContent = content
      .map((entry: any) => {
        if (typeof entry === 'string') {
          const html = sanitizeContent(entry);
          return html ? html : undefined;
        }

        if (!entry || typeof entry !== 'object') {
          return undefined;
        }

        if (typeof entry.html === 'string') {
          const html = sanitizeContent(entry.html);
          return html ? { html } : undefined;
        }

        if (typeof entry.text === 'string') {
          const text = sanitizeContent(entry.text);
          return text ? { text } : undefined;
        }

        return undefined;
      })
      .filter(Boolean);

    return {
      title,
      content: normalizedContent,
    };
  }

  return {
    title,
    items: [],
  };
}

function normalizeRoadmapSteps(value: unknown): Array<{ title: string; description?: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        const title = sanitizeContent(entry);
        return title ? { title } : undefined;
      }

      if (!entry || typeof entry !== 'object') {
        return undefined;
      }

      const rawTitle =
        typeof (entry as any).title === 'string'
          ? (entry as any).title
          : typeof (entry as any).label === 'string'
            ? (entry as any).label
            : '';
      const rawDescription =
        typeof (entry as any).content === 'string'
          ? (entry as any).content
          : typeof (entry as any).description === 'string'
            ? (entry as any).description
            : '';

      const title = sanitizeContent(rawTitle);
      const description = sanitizeContent(rawDescription);

      if (!title) {
        return undefined;
      }

      return {
        title,
        description: description || undefined,
      };
    })
    .filter((step): step is { title: string; description?: string } => Boolean(step));
}

function normalizeCalloutVideo(entry: any): CalloutVideo | undefined {
  const src = resolveVideoSrc(entry);
  if (!src) {
    return undefined;
  }

  const titleValue =
    typeof (entry as any).title === 'string'
      ? (entry as any).title
      : typeof (entry as any).caption === 'string'
        ? (entry as any).caption
        : '';
  const title = sanitizeContent(titleValue);

  return {
    type: 'video',
    src,
    title: title || undefined,
  };
}

function normalizeTableHeaders(headers: unknown): Array<string> {
  if (!Array.isArray(headers)) {
    return [];
  }

  return headers.map((header) => sanitizeContent(header));
}

type TableCell = { value: string; mono?: boolean; code?: boolean };

function normalizeTableRows(rows: unknown): TableCell[][] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row): TableCell[] | undefined => {
      if (!Array.isArray(row)) {
        return undefined;
      }

      const cells = row
        .map((cell): TableCell | undefined => {
          if (cell && typeof cell === 'object') {
            const value = sanitizeContent((cell as any).value ?? '');
            if (!value.length) {
              return undefined;
            }
            return {
              value,
              mono: Boolean((cell as any).mono),
              code: Boolean((cell as any).code),
            };
          }

          const value = sanitizeContent(cell);
          return value.length ? { value } : undefined;
        })
        .filter((cell): cell is TableCell => Boolean(cell));

      return cells.length ? cells : undefined;
    })
    .filter((row): row is TableCell[] => Boolean(row));
}

function normalizeTruthTableHeaders(headers: unknown): any[] {
  if (!Array.isArray(headers)) {
    return [];
  }

  return headers.map((header) =>
    typeof header === 'string'
      ? sanitizeContent(header)
      : {
          label: sanitizeContent((header as any).label ?? ''),
          srOnly: Boolean((header as any).srOnly),
          align: (header as any).align,
        }
  );
}

function normalizeTruthTableRows(rows: unknown): any[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => {
      if (!Array.isArray(row)) {
        return undefined;
      }

      const cells = row
        .map((cell) => {
          if (cell && typeof cell === 'object') {
            const value = (cell as any).value;
            return {
              ...cell,
              value:
                typeof value === 'number' || typeof value === 'boolean'
                  ? value
                  : sanitizeContent(value),
              display: sanitizeContent((cell as any).display ?? ''),
              note: sanitizeContent((cell as any).note ?? ''),
            };
          }

          return {
            value: sanitizeContent(cell),
          };
        })
        .filter(
          (cell) =>
            !(
              typeof cell.value === 'string' &&
              cell.value.length === 0 &&
              !cell.display &&
              !cell.note
            )
        );

      return cells.length ? cells : undefined;
    })
    .filter((row): row is any[] => Boolean(row));
}

function normalizeTruthTableLegend(legend: unknown): any[] {
  if (!Array.isArray(legend)) {
    return [];
  }

  return legend
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return undefined;
      }

      const label = sanitizeContent((entry as any).label ?? '');
      if (!label) {
        return undefined;
      }

      return {
        label,
        description: sanitizeContent((entry as any).description ?? ''),
        state: (entry as any).state,
        icon: (entry as any).icon,
      };
    })
    .filter((value): value is any => Boolean(value));
}

function resolveVideoSrc(item: any): string {
  let url = '';

  if (typeof item?.src === 'string' && item.src.trim().length) {
    url = item.src.trim();
  } else if (typeof item?.youtubeId === 'string' && item.youtubeId.trim().length) {
    url = `https://www.youtube.com/embed/${encodeURIComponent(item.youtubeId.trim())}`;
  } else if (typeof item?.url === 'string' && item.url.trim().length) {
    try {
      const parsed = new URL(item.url.trim());
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
      url = item.url;
    }
  }

  const start = normalizeStartTime(
    item?.start ?? item?.time ?? item?.begin ?? item?.from ?? item?.offset
  );
  return withStartParameter(url, start);
}

function normalizeStartTime(value: unknown): number | undefined {
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

function withStartParameter(url: string, start?: number): string {
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

function sanitizeContent(value: unknown): string {
  return sanitizeHtml(value);
}
</script>

<style scoped>
.content-block {
  background: var(--md-sys-color-surface-container-highest);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  box-shadow: var(--shadow-elevation-1);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
}

.content-block--nested {
  background: var(--md-sys-color-surface-container);
  box-shadow: none;
  padding: var(--md-sys-spacing-5);
}

.content-block__header {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.content-block__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.content-block__body {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
}

.content-block__paragraph {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
  line-height: 1.6;
}

.content-block__blockquote {
  border-left: 4px solid var(--md-sys-color-primary);
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 25%, transparent);
  padding: var(--md-sys-spacing-4) var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-large);
  color: var(--md-sys-color-on-primary-container);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
  font-style: italic;
}

.content-block__blockquote cite {
  font-style: normal;
  font-weight: 600;
}

.content-block__list {
  padding-left: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-2);
  color: var(--md-sys-color-on-surface);
}

.content-block__list--ordered {
  list-style: decimal;
}

.content-block__definition-list {
  display: grid;
  gap: var(--md-sys-spacing-2);
  color: var(--md-sys-color-on-surface);
}

.content-block__definition-list dt {
  font-weight: 600;
}

.content-block__definition-list dd {
  margin-left: var(--md-sys-spacing-4);
}

.content-block__sub-block {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-3);
  box-shadow: var(--shadow-elevation-1);
}

.content-block--nested .content-block__sub-block {
  box-shadow: var(--shadow-elevation-0);
}

.content-block__sub-title {
  font-size: var(--md-sys-typescale-title-large-size, 1.25rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.content-block__ordered-component {
  display: block;
}

.content-block__figure {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
  align-items: flex-start;
}

.content-block__figure img {
  max-width: 100%;
  border-radius: var(--md-sys-border-radius-large);
  box-shadow: var(--shadow-elevation-1);
}

.content-block__figure-caption {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.95rem);
}

.content-block__video {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.content-block__video-frame {
  position: relative;
  padding-top: 56.25%;
  width: 100%;
  border-radius: var(--md-sys-border-radius-large);
  overflow: hidden;
  box-shadow: var(--shadow-elevation-1);
}

.content-block__video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.content-block__video-title {
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.content-block__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--md-sys-spacing-3) var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-full);
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s ease;
}

.content-block__button:hover {
  background: color-mix(in srgb, var(--md-sys-color-primary) 85%, black 15%);
}

.content-block :deep(strong) {
  color: inherit;
}

.content-block :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .content-block {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

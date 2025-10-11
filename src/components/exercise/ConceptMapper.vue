<template>
  <article class="concept-mapper card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <div class="concept-mapper__content">
      <div class="concept-mapper__grid">
        <section
          v-for="group in groupedEntries"
          :key="group.category"
          class="concept-mapper__column"
        >
          <header class="concept-mapper__group-header">
            <button
              type="button"
              class="concept-mapper__group-toggle text-title-small font-semibold text-on-surface"
              :aria-expanded="String(!isGroupCollapsed(group.category))"
              :aria-controls="groupPanelId(group.category)"
              @click="toggleGroup(group.category)"
            >
              <span aria-hidden="true">
                {{ group.category }}
              </span>
              <span class="sr-only">
                {{ isGroupCollapsed(group.category) ? 'Expandir grupo' : 'Recolher grupo' }}
              </span>
              <svg
                class="concept-mapper__group-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1"
                />
              </svg>
            </button>
          </header>

          <ul
            v-if="!isGroupCollapsed(group.category)"
            :id="groupPanelId(group.category)"
            class="concept-mapper__nodes"
            role="list"
          >
            <li v-for="node in group.nodes" :key="node.id">
              <button
                type="button"
                class="concept-mapper__node text-body-medium text-on-surface"
                :class="nodeStateClass(node.id)"
                :aria-pressed="String(selectedNodeId === node.id)"
                :data-node-id="node.id"
                @mouseenter="handleHover(node.id)"
                @mouseleave="handleHover(null)"
                @focus="handleHover(node.id)"
                @blur="handleHover(null)"
                @click="toggleSelection(node.id)"
              >
                <span class="concept-mapper__node-label">{{ node.label }}</span>
                <span v-if="node.details" class="concept-mapper__node-details text-body-small">
                  {{ node.details }}
                </span>
              </button>
            </li>
          </ul>
        </section>
      </div>

      <figure
        class="concept-mapper__graph"
        role="group"
        :aria-labelledby="graphTitleId"
        :aria-describedby="graphDescriptionId"
      >
        <figcaption :id="graphTitleId" class="text-title-small font-semibold text-on-surface">
          {{ graphTitle }}
        </figcaption>

        <div class="concept-mapper__graph-surface">
          <svg
            :viewBox="`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`"
            role="img"
            :aria-labelledby="graphTitleId"
            :aria-describedby="graphDescriptionId"
          >
            <title>{{ graphTitle }}</title>
            <desc>{{ altDescription }}</desc>

            <g class="concept-mapper__graph-links" aria-hidden="true">
              <line
                v-for="(link, index) in positionedLinks"
                :key="`${link.from}-${link.to}-${index}`"
                class="concept-mapper__graph-link"
                :class="{
                  'concept-mapper__graph-link--active': link.isActive,
                  'concept-mapper__graph-link--dimmed': link.isDimmed,
                }"
                :data-link-id="`${link.from}-${link.to}`"
                :x1="link.source.x"
                :y1="link.source.y"
                :x2="link.target.x"
                :y2="link.target.y"
              />
            </g>

            <g class="concept-mapper__graph-nodes">
              <g
                v-for="node in positionedNodes"
                :key="node.id"
                class="concept-mapper__graph-node"
                :class="{
                  'concept-mapper__graph-node--active': node.id === activeNodeId,
                  'concept-mapper__graph-node--related': relatedNodeIds.has(node.id),
                  'concept-mapper__graph-node--dimmed': isGraphNodeDimmed(node.id),
                }"
                role="button"
                tabindex="0"
                :aria-pressed="String(selectedNodeId === node.id)"
                :data-graph-node-id="node.id"
                @mouseenter="handleHover(node.id)"
                @mouseleave="handleHover(null)"
                @focus="handleHover(node.id)"
                @blur="handleHover(null)"
                @click="toggleSelection(node.id)"
                @keydown.space.prevent="toggleSelection(node.id)"
                @keydown.enter.prevent="toggleSelection(node.id)"
              >
                <circle :cx="node.position.x" :cy="node.position.y" :r="GRAPH_NODE_RADIUS" />
                <text
                  :x="node.position.x"
                  :y="node.position.y"
                  dominant-baseline="middle"
                  text-anchor="middle"
                >
                  {{ node.label }}
                </text>
              </g>
            </g>
          </svg>
        </div>
      </figure>
    </div>

    <p :id="graphDescriptionId" class="sr-only">{{ altDescription }}</p>

    <section
      v-if="data.relationships?.length"
      class="concept-mapper__relationships"
      aria-label="Relações"
    >
      <h4 class="text-title-small font-semibold text-on-surface">Relações</h4>
      <ul class="md-stack md-stack-1" role="list">
        <li
          v-for="(relation, index) in data.relationships"
          :key="index"
          class="text-body-medium text-on-surface"
        >
          <span class="font-semibold">{{ resolveNodeLabel(relation.from) }}</span>
          <span class="text-on-surface-variant"> → </span>
          <span class="font-semibold">{{ resolveNodeLabel(relation.to) }}</span>
          <span v-if="relation.label" class="text-on-surface-variant"> — {{ relation.label }}</span>
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationNodeDatum,
} from 'd3-force';

export interface ConceptMapperNode {
  id: string;
  label: string;
  category?: string;
  details?: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface ConceptMapperRelationship {
  from: string;
  to: string;
  label?: string;
}

export interface ConceptMapperLayoutOptions {
  type?: 'auto' | 'preset';
  force?: {
    linkDistance?: number;
    chargeStrength?: number;
    collisionRadius?: number;
  };
}

export interface ConceptMapperBlockData {
  title?: string;
  description?: string;
  nodes: ConceptMapperNode[];
  relationships?: ConceptMapperRelationship[];
  layout?: ConceptMapperLayoutOptions;
}

interface PositionedNode extends ConceptMapperNode {
  position: { x: number; y: number };
}

interface PositionedLink extends ConceptMapperRelationship {
  source: { x: number; y: number };
  target: { x: number; y: number };
  isActive: boolean;
  isDimmed: boolean;
}

interface ForceNode extends SimulationNodeDatum {
  id: string;
}

const GRAPH_WIDTH = 720;
const GRAPH_HEIGHT = 480;
const GRAPH_NODE_RADIUS = 28;
const DEFAULT_CATEGORY = 'Conceitos';

const props = defineProps<{ data: ConceptMapperBlockData }>();

const componentId = useId();
const collapsedCategories = ref<Set<string>>(new Set());
const hoveredNodeId = ref<string | null>(null);
const selectedNodeId = ref<string | null>(null);
const nodePositions = ref<Record<string, { x: number; y: number }>>({});
const simulation = ref<Simulation<ForceNode, undefined> | null>(null);

const groupedEntries = computed(() => {
  const groups = new Map<string, ConceptMapperNode[]>();
  props.data.nodes.forEach((node) => {
    const category = node.category ?? DEFAULT_CATEGORY;
    const bucket = groups.get(category) ?? [];
    bucket.push(node);
    groups.set(category, bucket);
  });
  return Array.from(groups.entries()).map(([category, nodes]) => ({ category, nodes }));
});

watch(
  groupedEntries,
  (entries) => {
    const categories = new Set(entries.map((group) => group.category));
    const next = new Set<string>();
    collapsedCategories.value.forEach((category) => {
      if (categories.has(category)) {
        next.add(category);
      }
    });
    collapsedCategories.value = next;
  },
  { immediate: true }
);

const visibleNodes = computed(() => {
  return groupedEntries.value.flatMap((group) =>
    collapsedCategories.value.has(group.category) ? [] : group.nodes
  );
});

const visibleNodeIds = computed(() => new Set(visibleNodes.value.map((node) => node.id)));

const visibleRelationships = computed(() => {
  if (!props.data.relationships?.length) {
    return [] as ConceptMapperRelationship[];
  }
  return props.data.relationships.filter(
    (relation) => visibleNodeIds.value.has(relation.from) && visibleNodeIds.value.has(relation.to)
  );
});

watch(visibleNodes, (nodes) => {
  const ids = new Set(nodes.map((node) => node.id));
  if (selectedNodeId.value && !ids.has(selectedNodeId.value)) {
    selectedNodeId.value = null;
  }
  if (hoveredNodeId.value && !ids.has(hoveredNodeId.value)) {
    hoveredNodeId.value = null;
  }
});

const adjacency = computed(() => {
  const map = new Map<string, Set<string>>();
  visibleRelationships.value.forEach((relation) => {
    if (!map.has(relation.from)) {
      map.set(relation.from, new Set());
    }
    if (!map.has(relation.to)) {
      map.set(relation.to, new Set());
    }
    map.get(relation.from)!.add(relation.to);
    map.get(relation.to)!.add(relation.from);
  });
  return map;
});

const activeNodeId = computed(() => selectedNodeId.value ?? hoveredNodeId.value ?? null);

const relatedNodeIds = computed(() => {
  const active = activeNodeId.value;
  if (!active) {
    return new Set<string>();
  }
  return new Set(adjacency.value.get(active) ?? []);
});

const positionedNodes = computed<PositionedNode[]>(() => {
  return visibleNodes.value.map((node) => ({
    ...node,
    position: nodePositions.value[node.id] ?? {
      x: GRAPH_WIDTH / 2,
      y: GRAPH_HEIGHT / 2,
    },
  }));
});

const positionedLinks = computed<PositionedLink[]>(() => {
  return visibleRelationships.value.map((relation) => {
    const source = nodePositions.value[relation.from] ?? {
      x: GRAPH_WIDTH / 2,
      y: GRAPH_HEIGHT / 2,
    };
    const target = nodePositions.value[relation.to] ?? {
      x: GRAPH_WIDTH / 2,
      y: GRAPH_HEIGHT / 2,
    };
    const isActive = activeNodeId.value === relation.from || activeNodeId.value === relation.to;
    const isRelated =
      relatedNodeIds.value.has(relation.from) || relatedNodeIds.value.has(relation.to);
    return {
      ...relation,
      source,
      target,
      isActive,
      isDimmed: Boolean(activeNodeId.value && !isActive && !isRelated),
    };
  });
});

const graphTitle = computed(() => props.data.title ?? 'Mapa de conceitos');
const altDescription = computed(() => {
  const nodeCount = visibleNodes.value.length;
  const linkCount = visibleRelationships.value.length;
  if (!nodeCount) {
    return 'Nenhum conceito visível no momento.';
  }
  if (!linkCount) {
    return `${nodeCount} conceitos sem relações visuais.`;
  }
  return `${nodeCount} conceitos conectados por ${linkCount} relações.`;
});

const graphTitleId = `concept-map-title-${componentId}`;
const graphDescriptionId = `concept-map-description-${componentId}`;

function stopSimulation() {
  if (simulation.value) {
    simulation.value.stop();
    simulation.value = null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function runAutoLayout(nodes: ConceptMapperNode[], links: ConceptMapperRelationship[]) {
  stopSimulation();
  if (!nodes.length) {
    nodePositions.value = {};
    return;
  }

  const layout = props.data.layout?.force ?? {};
  const simNodes: ForceNode[] = nodes.map((node) => ({
    id: node.id,
    x: nodePositions.value[node.id]?.x ?? GRAPH_WIDTH / 2,
    y: nodePositions.value[node.id]?.y ?? GRAPH_HEIGHT / 2,
  }));

  const simLinks = links.map((link) => ({
    source: link.from,
    target: link.to,
  }));

  const simulationInstance = forceSimulation(simNodes)
    .force('charge', forceManyBody().strength(layout.chargeStrength ?? -280))
    .force(
      'link',
      forceLink(simLinks)
        .id((node) => (node as ForceNode).id)
        .distance(layout.linkDistance ?? 140)
    )
    .force('center', forceCenter(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2))
    .force('collision', forceCollide().radius(layout.collisionRadius ?? GRAPH_NODE_RADIUS * 1.4))
    .alpha(0.9);

  simulationInstance.on('tick', () => {
    const nextPositions: Record<string, { x: number; y: number }> = {};
    simNodes.forEach((node) => {
      nextPositions[node.id] = {
        x: clamp(
          node.x ?? GRAPH_WIDTH / 2,
          GRAPH_NODE_RADIUS * 2,
          GRAPH_WIDTH - GRAPH_NODE_RADIUS * 2
        ),
        y: clamp(
          node.y ?? GRAPH_HEIGHT / 2,
          GRAPH_NODE_RADIUS * 2,
          GRAPH_HEIGHT - GRAPH_NODE_RADIUS * 2
        ),
      };
    });
    nodePositions.value = nextPositions;
  });

  simulation.value = simulationInstance;
}

function applyLayout() {
  const nodes = visibleNodes.value;
  const links = visibleRelationships.value;
  const prefersPreset = props.data.layout?.type === 'preset';
  const hasPositions = nodes.every(
    (node) => typeof node.position?.x === 'number' && typeof node.position?.y === 'number'
  );

  if (prefersPreset && hasPositions) {
    stopSimulation();
    const presetPositions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node) => {
      presetPositions[node.id] = {
        x: node.position!.x,
        y: node.position!.y,
      };
    });
    nodePositions.value = presetPositions;
    return;
  }

  runAutoLayout(nodes, links);
}

watch([visibleNodes, visibleRelationships, () => props.data.layout], applyLayout, {
  immediate: true,
  deep: true,
});

onBeforeUnmount(() => {
  stopSimulation();
});

function resolveNodeLabel(id: string) {
  const node = props.data.nodes.find((candidate) => candidate.id === id);
  return node?.label ?? id;
}

function toggleGroup(category: string) {
  const next = new Set(collapsedCategories.value);
  if (next.has(category)) {
    next.delete(category);
  } else {
    next.add(category);
  }
  collapsedCategories.value = next;
}

function isGroupCollapsed(category: string) {
  return collapsedCategories.value.has(category);
}

function groupPanelId(category: string) {
  const normalized = category.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'grupo';
  return `concept-map-${componentId}-${normalized}`;
}

function handleHover(nodeId: string | null) {
  hoveredNodeId.value = nodeId;
}

function toggleSelection(nodeId: string) {
  selectedNodeId.value = selectedNodeId.value === nodeId ? null : nodeId;
}

function nodeStateClass(nodeId: string) {
  return {
    'concept-mapper__node--active': nodeId === activeNodeId.value,
    'concept-mapper__node--related': relatedNodeIds.value.has(nodeId),
    'concept-mapper__node--dimmed': isGraphNodeDimmed(nodeId),
  };
}

function isGraphNodeDimmed(nodeId: string) {
  if (!activeNodeId.value) {
    return false;
  }
  if (nodeId === activeNodeId.value) {
    return false;
  }
  return !relatedNodeIds.value.has(nodeId);
}
</script>

<style scoped>
.concept-mapper {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.concept-mapper__content {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(240px, 320px) 1fr;
}

@media (max-width: 960px) {
  .concept-mapper__content {
    grid-template-columns: 1fr;
  }
}

.concept-mapper__grid {
  display: grid;
  gap: 1.5rem;
}

.concept-mapper__column {
  display: grid;
  gap: 0.75rem;
}

.concept-mapper__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.concept-mapper__group-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.concept-mapper__group-toggle:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.concept-mapper__group-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}

.concept-mapper__group-toggle[aria-expanded='false'] .concept-mapper__group-icon {
  transform: rotate(-45deg);
}

.concept-mapper__nodes {
  display: grid;
  gap: 0.75rem;
}

.concept-mapper__node {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
  display: grid;
  gap: 0.25rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.concept-mapper__node:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.concept-mapper__node-label {
  font-weight: 600;
}

.concept-mapper__node-details {
  color: var(--md-sys-color-on-surface-variant);
}

.concept-mapper__node--active {
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
}

.concept-mapper__node--related {
  border-color: var(--md-sys-color-secondary);
}

.concept-mapper__node--dimmed {
  opacity: 0.6;
}

.concept-mapper__graph {
  display: grid;
  gap: 0.75rem;
}

.concept-mapper__graph-surface {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container);
  padding: 1rem;
}

.concept-mapper__graph svg {
  width: 100%;
  height: auto;
}

.concept-mapper__graph-link {
  stroke: var(--md-sys-color-outline);
  stroke-width: 2;
  opacity: 0.6;
  transition:
    stroke 0.2s ease,
    opacity 0.2s ease;
}

.concept-mapper__graph-link--active {
  stroke: var(--md-sys-color-primary);
  opacity: 1;
}

.concept-mapper__graph-link--dimmed {
  opacity: 0.2;
}

.concept-mapper__graph-node {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.concept-mapper__graph-node circle {
  fill: var(--md-sys-color-surface-container-high);
  stroke: var(--md-sys-color-outline);
  stroke-width: 2;
  transition:
    stroke 0.2s ease,
    fill 0.2s ease,
    opacity 0.2s ease;
}

.concept-mapper__graph-node text {
  fill: var(--md-sys-color-on-surface);
  font-size: 0.75rem;
  pointer-events: none;
}

.concept-mapper__graph-node--active circle {
  stroke: var(--md-sys-color-primary);
  fill: color-mix(in srgb, var(--md-sys-color-primary) 20%, var(--md-sys-color-surface));
}

.concept-mapper__graph-node--related circle {
  stroke: var(--md-sys-color-secondary);
}

.concept-mapper__graph-node--dimmed circle {
  opacity: 0.5;
}

.concept-mapper__graph-node:focus-visible circle {
  stroke: var(--md-sys-color-primary);
  stroke-width: 3;
}

.concept-mapper__relationships {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
}

:global(.sr-only) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

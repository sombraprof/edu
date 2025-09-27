<template>
  <section class="flowchart card md-stack" role="group" :aria-label="title ?? 'Fluxograma'">
    <header v-if="title || summary" class="flowchart__header md-stack">
      <h3 v-if="title" class="flowchart__title text-title-medium font-semibold text-on-surface">
        {{ title }}
      </h3>
      <p v-if="summary" class="flowchart__summary supporting-text">
        {{ summary }}
      </p>
    </header>

    <ol class="flowchart__list" role="list">
      <li
        v-for="item in nodesWithConnections"
        :key="item.node.id"
        class="flowchart__item"
        :data-node-type="item.node.type"
      >
        <article
          class="flowchart__node"
          :aria-labelledby="`${item.node.id}-title`"
          :aria-describedby="item.node.summary ? `${item.node.id}-summary` : undefined"
        >
          <header class="flowchart__node-header">
            <span class="flowchart__badge">{{ nodeTypeLabel(item.node.type) }}</span>
            <h4
              :id="`${item.node.id}-title`"
              class="flowchart__node-title text-title-small font-semibold"
            >
              {{ item.node.title }}
            </h4>
          </header>
          <p
            v-if="item.node.summary"
            :id="`${item.node.id}-summary`"
            class="flowchart__node-summary supporting-text"
          >
            {{ item.node.summary }}
          </p>

          <dl v-if="item.node.branches?.length" class="flowchart__branches" role="list">
            <div
              v-for="branch in item.node.branches"
              :key="branch.id"
              class="flowchart__branch"
              role="listitem"
            >
              <dt class="flowchart__branch-label text-label-large font-semibold">
                {{ branch.label }}
              </dt>
              <dd class="flowchart__branch-content supporting-text">
                <span>{{ branch.description || branchTargetTitle(branch.target) }}</span>
              </dd>
            </div>
          </dl>
        </article>

        <div
          v-if="item.connections.length"
          class="flowchart__connectors"
          role="list"
          :data-multiple="item.connections.length > 1 ? 'true' : undefined"
        >
          <div
            v-for="connection in item.connections"
            :key="`${connection.from}->${connection.to}`"
            class="flowchart__connector"
            role="listitem"
            :data-kind="connection.kind ?? 'default'"
          >
            <span class="flowchart__arrow" aria-hidden="true"></span>
            <p
              v-if="connectionLabel(connection)"
              class="flowchart__connector-label supporting-text"
            >
              {{ connectionLabel(connection) }}
            </p>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type FlowNodeType = 'start' | 'process' | 'input' | 'output' | 'decision' | 'end';

type FlowConnectionKind = 'default' | 'loop' | 'fallback';

interface FlowBranch {
  id: string;
  label: string;
  target: string;
  description?: string;
}

interface FlowNode {
  id: string;
  type: FlowNodeType;
  title: string;
  summary?: string;
  branches?: FlowBranch[];
}

interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  kind?: FlowConnectionKind;
}

interface Md3FlowchartProps {
  title?: string;
  summary?: string;
  nodes: FlowNode[];
  connections?: FlowConnection[];
}

const props = withDefaults(defineProps<Md3FlowchartProps>(), {
  title: undefined,
  summary: undefined,
  connections: () => [],
});

const nodeById = computed(() => new Map(props.nodes.map((node) => [node.id, node])));

const resolvedConnections = computed<FlowConnection[]>(() => {
  if (props.connections && props.connections.length > 0) {
    return props.connections;
  }

  const sequentialConnections: FlowConnection[] = [];
  props.nodes.forEach((node, index) => {
    const next = props.nodes[index + 1];
    if (next) {
      sequentialConnections.push({ from: node.id, to: next.id, kind: 'default' });
    }
  });
  return sequentialConnections;
});

const connectionMap = computed(() => {
  const map = new Map<string, FlowConnection[]>();
  resolvedConnections.value.forEach((connection) => {
    const list = map.get(connection.from);
    if (list) {
      list.push(connection);
    } else {
      map.set(connection.from, [connection]);
    }
  });
  return map;
});

const nodesWithConnections = computed(() =>
  props.nodes.map((node) => ({
    node,
    connections: connectionMap.value.get(node.id) ?? [],
  }))
);

function branchTargetTitle(targetId: string): string {
  return nodeById.value.get(targetId)?.title ?? targetId;
}

function connectionLabel(connection: FlowConnection): string | undefined {
  if (connection.label) {
    return connection.label;
  }

  const target = nodeById.value.get(connection.to);
  return target ? `Segue para: ${target.title}` : undefined;
}

function nodeTypeLabel(type: FlowNodeType): string {
  switch (type) {
    case 'start':
      return 'Início';
    case 'end':
      return 'Fim';
    case 'process':
      return 'Processo';
    case 'decision':
      return 'Decisão';
    case 'input':
      return 'Entrada';
    case 'output':
      return 'Saída';
    default:
      return 'Etapa';
  }
}
</script>

<style scoped>
.flowchart {
  gap: var(--md-sys-spacing-6);
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-border-radius-3xl);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-high) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 70%, transparent);
}

.flowchart__header {
  gap: var(--md-sys-spacing-2);
}

.flowchart__title {
  margin: 0;
}

.flowchart__summary {
  margin: 0;
}

.flowchart__list {
  list-style: none;
  display: grid;
  gap: var(--md-sys-spacing-8);
  padding: 0;
  margin: 0;
}

.flowchart__item {
  display: grid;
  gap: var(--md-sys-spacing-4);
}

.flowchart__node {
  display: grid;
  gap: var(--md-sys-spacing-3);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-2xl);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
  box-shadow: var(--shadow-elevation-1);
  position: relative;
}

.flowchart__node::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid transparent;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
  pointer-events: none;
}

.flowchart__node:hover::after,
.flowchart__node:focus-within::after {
  border-color: color-mix(in srgb, var(--md-sys-color-primary) 35%, transparent);
  box-shadow: var(--shadow-elevation-2);
}

.flowchart__node-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--md-sys-spacing-2);
}

.flowchart__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: 600;
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  background: color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent);
  color: var(--md-sys-color-primary);
}

.flowchart__node-title {
  margin: 0;
}

.flowchart__node-summary {
  margin: 0;
}

.flowchart__branches {
  display: grid;
  gap: var(--md-sys-spacing-2);
  margin: 0;
}

.flowchart__branch {
  display: grid;
  gap: var(--md-sys-spacing-1);
  padding: var(--md-sys-spacing-2);
  border-radius: var(--md-sys-border-radius-large);
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 35%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent);
}

.flowchart__branch-label {
  margin: 0;
}

.flowchart__branch-content {
  margin: 0;
}

.flowchart__connectors {
  display: grid;
  justify-items: center;
  gap: var(--md-sys-spacing-3);
}

.flowchart__connectors[data-multiple='true'] {
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  align-items: end;
}

.flowchart__connector {
  display: grid;
  justify-items: center;
  gap: var(--md-sys-spacing-2);
  min-height: 4.5rem;
}

.flowchart__arrow {
  display: block;
  width: 2px;
  height: 3rem;
  background: color-mix(in srgb, var(--md-sys-color-outline) 80%, transparent);
  position: relative;
}

.flowchart__arrow::after {
  content: '';
  position: absolute;
  bottom: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  border-left: 0.5rem solid transparent;
  border-right: 0.5rem solid transparent;
  border-top: 0.75rem solid color-mix(in srgb, var(--md-sys-color-outline) 80%, transparent);
}

.flowchart__connector[data-kind='loop'] .flowchart__arrow,
.flowchart__connector[data-kind='loop'] .flowchart__arrow::after {
  background: color-mix(in srgb, var(--md-sys-color-tertiary) 65%, transparent);
  border-top-color: color-mix(in srgb, var(--md-sys-color-tertiary) 65%, transparent);
}

.flowchart__connector[data-kind='fallback'] .flowchart__arrow,
.flowchart__connector[data-kind='fallback'] .flowchart__arrow::after {
  background: color-mix(in srgb, var(--md-sys-color-secondary) 60%, transparent);
  border-top-color: color-mix(in srgb, var(--md-sys-color-secondary) 60%, transparent);
}

.flowchart__connector-label {
  text-align: center;
  margin: 0;
}

@media (max-width: 640px) {
  .flowchart {
    padding: var(--md-sys-spacing-4);
  }

  .flowchart__node {
    padding: var(--md-sys-spacing-4);
  }
}
</style>

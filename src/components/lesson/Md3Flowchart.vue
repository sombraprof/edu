<template>
  <section class="flowchart card" role="group" :aria-label="title ?? 'Fluxograma'">
    <header v-if="title || summary" class="flowchart__header md-stack">
      <h3 v-if="title" class="flowchart__title text-title-medium font-semibold">
        {{ title }}
      </h3>
      <p v-if="summary" class="flowchart__summary supporting-text">
        {{ summary }}
      </p>
    </header>

    <ol class="flowchart__steps" role="list">
      <li
        v-for="(item, index) in nodesWithConnections"
        :key="item.node.id"
        class="flowchart__step"
        :class="{
          'flowchart__step--first': index === 0,
          'flowchart__step--last': index === nodesWithConnections.length - 1,
        }"
        :data-node-type="item.node.type"
      >
        <div class="flowchart__row">
          <div class="flowchart__marker" aria-hidden="true">
            <span class="flowchart__dot">
              <span class="flowchart__dot-icon">{{ nodeTypeGlyph(item.node.type) }}</span>
            </span>
          </div>

          <article
            class="flowchart__card md-stack"
            :aria-labelledby="`${item.node.id}-title`"
            :aria-describedby="item.node.summary ? `${item.node.id}-summary` : undefined"
          >
            <header class="flowchart__card-header">
              <span class="flowchart__badge">{{ nodeTypeLabel(item.node.type) }}</span>
              <h4
                :id="`${item.node.id}-title`"
                class="flowchart__card-title text-title-small font-semibold"
              >
                {{ item.node.title }}
              </h4>
            </header>

            <p
              v-if="item.node.summary"
              :id="`${item.node.id}-summary`"
              class="flowchart__card-summary supporting-text"
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
                  {{ branch.description || branchTargetTitle(branch.target) }}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <div v-if="item.connections.length" class="flowchart__connections" role="list">
          <div
            v-for="connection in item.connections"
            :key="`${connection.from}->${connection.to}`"
            class="flowchart__chip"
            role="listitem"
            :data-kind="connection.kind ?? 'default'"
          >
            <span class="flowchart__chip-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                <path
                  d="M2 8h12M10 4l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="flowchart__chip-text supporting-text">{{
              connectionLabel(connection)
            }}</span>
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

function nodeTypeGlyph(type: FlowNodeType): string {
  switch (type) {
    case 'start':
      return '●';
    case 'end':
      return '■';
    case 'decision':
      return '◆';
    case 'input':
      return '⬖';
    case 'output':
      return '⬗';
    default:
      return '●';
  }
}
</script>

<style scoped>
.flowchart {
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-border-radius-3xl);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-high) 75%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  display: grid;
  gap: var(--md-sys-spacing-6);
}

.flowchart__header {
  gap: var(--md-sys-spacing-2);
}

.flowchart__title,
.flowchart__summary {
  margin: 0;
}

.flowchart__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--md-sys-spacing-7);
}

.flowchart__step {
  position: relative;
  display: grid;
  gap: var(--md-sys-spacing-3);
  --flow-color: color-mix(in srgb, var(--md-sys-color-primary) 45%, transparent);
  --flow-color-muted: color-mix(in srgb, var(--flow-color) 25%, transparent);
}

.flowchart__step[data-node-type='decision'] {
  --flow-color: color-mix(in srgb, var(--md-sys-color-tertiary) 55%, transparent);
}

.flowchart__step[data-node-type='end'] {
  --flow-color: color-mix(in srgb, var(--md-sys-color-error) 55%, transparent);
}

.flowchart__row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-4);
  align-items: start;
}

.flowchart__marker {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 0.125rem;
}

.flowchart__marker::before,
.flowchart__marker::after {
  content: '';
  position: absolute;
  width: 2px;
  background: color-mix(in srgb, var(--flow-color) 35%, transparent);
  left: 50%;
  transform: translateX(-50%);
}

.flowchart__marker::before {
  top: -100%;
  bottom: calc(50% + 1.25rem);
}

.flowchart__marker::after {
  top: calc(50% + 1.25rem);
  bottom: -100%;
}

.flowchart__step--first .flowchart__marker::before {
  display: none;
}

.flowchart__step--last .flowchart__marker::after {
  display: none;
}

.flowchart__dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: var(--flow-color);
  color: var(--md-sys-color-on-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--flow-color) 20%, transparent);
  font-size: 1.1rem;
  font-weight: 600;
}

.flowchart__dot-icon {
  line-height: 1;
}

.flowchart__card {
  background: var(--md-sys-color-surface);
  border: 1px solid color-mix(in srgb, var(--flow-color) 30%, transparent);
  border-radius: var(--md-sys-border-radius-2xl);
  padding: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
  gap: var(--md-sys-spacing-3);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.flowchart__card:hover,
.flowchart__card:focus-within {
  transform: translateY(-2px);
  box-shadow: var(--md-sys-elevation-level2);
}

.flowchart__card-header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
  align-items: center;
}

.flowchart__badge {
  padding: 0.125rem 0.625rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--flow-color) 25%, transparent);
  color: color-mix(in srgb, var(--flow-color) 90%, var(--md-sys-color-on-surface));
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: 600;
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
}

.flowchart__card-title,
.flowchart__card-summary {
  margin: 0;
}

.flowchart__branches {
  margin: 0;
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.flowchart__branch {
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-large);
  background: color-mix(in srgb, var(--flow-color) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--flow-color) 25%, transparent);
  display: grid;
  gap: var(--md-sys-spacing-1);
}

.flowchart__branch-label,
.flowchart__branch-content {
  margin: 0;
}

.flowchart__connections {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
  padding-left: calc(2.5rem + var(--md-sys-spacing-4));
}

.flowchart__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--md-sys-spacing-2);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--flow-color) 20%, transparent);
  color: color-mix(in srgb, var(--flow-color) 90%, var(--md-sys-color-on-surface));
  border: 1px solid color-mix(in srgb, var(--flow-color) 35%, transparent);
}

.flowchart__chip[data-kind='loop'] {
  --flow-color: color-mix(in srgb, var(--md-sys-color-tertiary) 60%, transparent);
}

.flowchart__chip[data-kind='fallback'] {
  --flow-color: color-mix(in srgb, var(--md-sys-color-secondary) 55%, transparent);
}

.flowchart__chip-icon {
  display: inline-flex;
  width: 1rem;
  height: 1rem;
}

.flowchart__chip-icon svg {
  width: 100%;
  height: 100%;
}

.flowchart__chip-text {
  margin: 0;
}

@media (max-width: 720px) {
  .flowchart {
    padding: var(--md-sys-spacing-4);
  }

  .flowchart__row {
    grid-template-columns: 1fr;
  }

  .flowchart__marker {
    justify-content: flex-start;
    margin-bottom: var(--md-sys-spacing-2);
  }

  .flowchart__marker::before,
  .flowchart__marker::after {
    left: calc(var(--md-sys-spacing-2) + 1.25rem);
  }

  .flowchart__dot {
    width: 2.25rem;
    height: 2.25rem;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--flow-color) 20%, transparent);
  }

  .flowchart__connections {
    padding-left: 0;
  }
}
</style>

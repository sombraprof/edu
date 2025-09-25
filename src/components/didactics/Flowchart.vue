<template>
  <div class="flowchart-container card p-6 my-8">
    <h3
      v-if="title"
      class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]"
    >
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="text-body-large mb-6 text-[var(--md-sys-color-on-surface-variant)]"
      v-html="description"
    ></p>

    <div class="flowchart-wrapper">
      <div class="flowchart">
        <div
          v-for="(node, index) in nodes"
          :key="node.id"
          :class="[
            'flowchart-node',
            `flowchart-${node.type}`,
            { 'flowchart-active': activeNode === node.id },
          ]"
          :style="{ top: node.y + 'px', left: node.x + 'px' }"
        >
          <div class="flowchart-content">
            <component :is="getIcon(node.icon)" v-if="node.icon" class="flowchart-icon" />
            <div class="flowchart-text" v-html="node.content"></div>
          </div>
        </div>

        <!-- Render connections -->
        <svg class="flowchart-connections" :width="dimensions.width" :height="dimensions.height">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--md-sys-color-outline)" />
            </marker>
          </defs>

          <line
            v-for="connection in connections"
            :key="`${connection.from}-${connection.to}`"
            :x1="getNodeCenter(connection.from).x"
            :y1="getNodeCenter(connection.from).y"
            :x2="getNodeCenter(connection.to).x"
            :y2="getNodeCenter(connection.to).y"
            stroke="var(--md-sys-color-outline)"
            stroke-width="2"
            marker-end="url(#arrowhead)"
          />
        </svg>
      </div>
    </div>

    <div
      v-if="legend && legend.length > 0"
      class="mt-6 p-4 bg-[var(--md-sys-color-surface-container)] rounded-lg"
    >
      <h4 class="text-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">
        Legenda
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="item in legend" :key="item.type" class="flex items-center gap-2">
          <div :class="['w-4 h-4 rounded', `bg-${item.color}`]"></div>
          <span class="text-body-small text-[var(--md-sys-color-on-surface-variant)]">{{
            item.label
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Play, Square, Diamond, Circle, ArrowRight, Database, Cpu, Monitor } from 'lucide-vue-next';

interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'io' | 'end' | 'database' | 'subprocess';
  content: string;
  icon?: string;
  x: number;
  y: number;
}

interface FlowchartConnection {
  from: string;
  to: string;
}

interface LegendItem {
  type: string;
  label: string;
  color: string;
}

interface FlowchartProps {
  title?: string;
  description?: string;
  nodes: FlowchartNode[];
  connections: FlowchartConnection[];
  legend?: LegendItem[];
  dimensions?: { width: number; height: number };
}

const props = defineProps<FlowchartProps>();

const activeNode = ref<string | null>(null);

const dimensions = computed(() => ({
  width: props.dimensions?.width || 800,
  height: props.dimensions?.height || 600,
}));

function getIcon(iconName?: string) {
  const iconMap: Record<string, any> = {
    play: Play,
    square: Square,
    diamond: Diamond,
    circle: Circle,
    'arrow-right': ArrowRight,
    database: Database,
    cpu: Cpu,
    monitor: Monitor,
  };
  return iconMap[iconName || ''] || null;
}

function getNodeCenter(nodeId: string) {
  const node = props.nodes.find((n) => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };

  return {
    x: node.x + 100, // Assuming node width is 200px, center is at 100px
    y: node.y + 40, // Assuming node height is 80px, center is at 40px
  };
}
</script>

<style scoped>
.flowchart-container {
  border-radius: var(--md-sys-border-radius-large);
}

.flowchart-wrapper {
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 600px;
}

.flowchart {
  position: relative;
  min-width: 100%;
  min-height: 400px;
}

.flowchart-node {
  position: absolute;
  min-width: 200px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--md-sys-color-outline);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  transition: all 200ms ease;
}

.flowchart-node:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevation-2);
}

.flowchart-start {
  border-radius: 50%;
  background-color: var(--md-sys-color-secondary-container);
  border-color: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary-container);
}

.flowchart-process {
  border-radius: var(--md-sys-border-radius-large);
  background-color: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary-container);
}

.flowchart-decision {
  border-radius: 0;
  transform: rotate(45deg);
  background-color: var(--md-sys-color-tertiary-container);
  border-color: var(--md-sys-color-tertiary);
  color: var(--md-sys-color-on-tertiary-container);
}

.flowchart-io {
  border-radius: 0;
  background-color: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
}

.flowchart-end {
  border-radius: 50%;
  background-color: var(--md-sys-color-error-container);
  border-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error-container);
}

.flowchart-database {
  border-radius: var(--md-sys-border-radius-large);
  background-color: var(--md-sys-color-surface-container);
  border-color: var(--md-sys-color-outline);
}

.flowchart-subprocess {
  border-radius: var(--md-sys-border-radius-large);
  background-color: var(--md-sys-color-surface-variant);
  border-color: var(--md-sys-color-outline-variant);
}

.flowchart-active {
  box-shadow: var(--shadow-elevation-3);
  border-color: var(--md-sys-color-primary);
}

.flowchart-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

.flowchart-decision .flowchart-content {
  transform: rotate(-45deg);
}

.flowchart-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.flowchart-text {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
}

.flowchart-connections {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .flowchart-node {
    min-width: 150px;
    min-height: 60px;
  }

  .flowchart-content {
    padding: 0.5rem;
  }

  .flowchart-text {
    font-size: 0.75rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .flowchart-node {
    border-color: var(--md-sys-color-outline);
  }
}
</style>

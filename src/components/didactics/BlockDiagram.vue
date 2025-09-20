<template>
  <div class="block-diagram-container card p-6 my-8">
    <h3 v-if="title" class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ title }}</h3>
    <p v-if="description" class="text-body-large mb-6 text-[var(--md-sys-color-on-surface-variant)]" v-html="description"></p>

    <div class="block-diagram-wrapper">
      <div class="block-diagram" :style="{ minHeight: (dimensions?.height || 600) + 'px' }">
        <div
          v-for="block in blocks"
          :key="block.id"
          :class="[
            'block-item',
            `block-${block.type}`,
            { 'block-active': activeBlock === block.id }
          ]"
          :style="{
            top: block.y + 'px',
            left: block.x + 'px',
            width: block.width + 'px',
            minHeight: block.height + 'px'
          }"
        >
          <div class="block-header" v-if="block.title">
            <component :is="getIcon(block.icon)" v-if="block.icon" class="block-icon" />
            <h4 class="block-title">{{ block.title }}</h4>
          </div>

          <div class="block-content">
            <div class="block-text" v-html="block.content"></div>

            <div v-if="block.items && block.items.length > 0" class="block-items">
              <div
                v-for="item in block.items"
                :key="item.id"
                class="block-item-content"
                v-html="item.content"
              ></div>
            </div>
          </div>
        </div>

        <!-- Render connections -->
        <svg class="block-connections" :width="dimensions?.width || 800" :height="dimensions?.height || 600">
          <defs>
            <marker
              id="block-arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="var(--md-sys-color-outline)"
              />
            </marker>
          </defs>

          <line
            v-for="connection in connections"
            :key="`${connection.from}-${connection.to}`"
            :x1="getBlockCenter(connection.from).x"
            :y1="getBlockCenter(connection.from).y"
            :x2="getBlockCenter(connection.to).x"
            :y2="getBlockCenter(connection.to).y"
            :stroke="connection.color || 'var(--md-sys-color-outline)'"
            stroke-width="2"
            :stroke-dasharray="connection.dashed ? '5,5' : 'none'"
            marker-end="url(#block-arrowhead)"
          />

          <!-- Labels for connections -->
          <text
            v-for="connection in connections"
            :key="`label-${connection.from}-${connection.to}`"
            :x="(getBlockCenter(connection.from).x + getBlockCenter(connection.to).x) / 2"
            :y="(getBlockCenter(connection.from).y + getBlockCenter(connection.to).y) / 2 - 5"
            class="connection-label"
            text-anchor="middle"
          >
            {{ connection.label }}
          </text>
        </svg>
      </div>
    </div>

    <div v-if="legend && legend.length > 0" class="mt-6 p-4 bg-[var(--md-sys-color-surface-container)] rounded-lg">
      <h4 class="text-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">Legenda</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="item in legend"
          :key="item.type"
          class="flex items-center gap-3"
        >
          <div
            :class="[
              'w-4 h-4 rounded border-2',
              `bg-${item.color}`,
              `border-${item.borderColor || item.color}`
            ]"
          ></div>
          <span class="text-body-medium text-[var(--md-sys-color-on-surface-variant)]">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Database,
  Cpu,
  Monitor,
  Server,
  Cloud,
  HardDrive,
  Settings,
  Users,
  ArrowRight
} from 'lucide-vue-next';

interface BlockItem {
  id: string;
  content: string;
}

interface BlockDiagramBlock {
  id: string;
  type: 'process' | 'data' | 'input' | 'output' | 'storage' | 'decision' | 'custom';
  title?: string;
  content: string;
  icon?: string;
  items?: BlockItem[];
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BlockDiagramConnection {
  from: string;
  to: string;
  label?: string;
  color?: string;
  dashed?: boolean;
}

interface LegendItem {
  type: string;
  label: string;
  color: string;
  borderColor?: string;
}

interface BlockDiagramProps {
  title?: string;
  description?: string;
  blocks: BlockDiagramBlock[];
  connections: BlockDiagramConnection[];
  legend?: LegendItem[];
  dimensions?: { width: number; height: number };
}

const props = defineProps<BlockDiagramProps>();

const activeBlock = ref<string | null>(null);

function getIcon(iconName?: string) {
  const iconMap: Record<string, any> = {
    'database': Database,
    'cpu': Cpu,
    'monitor': Monitor,
    'server': Server,
    'cloud': Cloud,
    'hard-drive': HardDrive,
    'settings': Settings,
    'users': Users,
    'arrow-right': ArrowRight
  };
  return iconMap[iconName || ''] || null;
}

function getBlockCenter(blockId: string) {
  const block = props.blocks.find(b => b.id === blockId);
  if (!block) return { x: 0, y: 0 };

  return {
    x: block.x + block.width / 2,
    y: block.y + block.height / 2
  };
}
</script>

<style scoped>
.block-diagram-container {
  border-radius: var(--md-sys-border-radius-large);
}

.block-diagram-wrapper {
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 700px;
}

.block-diagram {
  position: relative;
  min-width: 100%;
}

.block-item {
  position: absolute;
  border: 2px solid var(--md-sys-color-outline);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-border-radius-large);
  transition: all 200ms ease;
  box-shadow: var(--shadow-elevation-1);
}

.block-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevation-2);
}

.block-process {
  background-color: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary-container);
}

.block-data {
  background-color: var(--md-sys-color-secondary-container);
  border-color: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary-container);
}

.block-input {
  background-color: var(--md-sys-color-tertiary-container);
  border-color: var(--md-sys-color-tertiary);
  color: var(--md-sys-color-on-tertiary-container);
}

.block-output {
  background-color: var(--md-sys-color-success-container);
  border-color: var(--md-sys-color-success);
  color: var(--md-sys-color-on-success-container);
}

.block-storage {
  background-color: var(--md-sys-color-surface-container-high);
  border-color: var(--md-sys-color-outline);
  border-style: dashed;
}

.block-decision {
  background-color: var(--md-sys-color-warning-container);
  border-color: var(--md-sys-color-warning);
  color: var(--md-sys-color-on-warning-container);
  transform: rotate(45deg);
}

.block-custom {
  background-color: var(--md-sys-color-surface-variant);
  border-color: var(--md-sys-color-outline-variant);
}

.block-active {
  box-shadow: var(--shadow-elevation-3);
  border-color: var(--md-sys-color-primary);
}

.block-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem 0.5rem;
  border-bottom: 1px solid var(--md-sys-color-outline);
}

.block-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.block-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.block-content {
  padding: 1rem;
}

.block-decision .block-content {
  transform: rotate(-45deg);
}

.block-text {
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.block-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.block-item-content {
  padding: 0.5rem;
  background-color: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-medium);
  font-size: 0.8125rem;
  border-left: 3px solid var(--md-sys-color-primary);
}

.block-connections {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.connection-label {
  font-size: 0.75rem;
  fill: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 768px) {
  .block-item {
    min-width: 120px;
  }

  .block-content {
    padding: 0.5rem;
  }

  .block-text {
    font-size: 0.75rem;
  }

  .block-title {
    font-size: 0.8125rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .block-item {
    border-color: var(--md-sys-color-outline);
  }

  .block-header {
    border-color: var(--md-sys-color-outline);
  }
}
</style>
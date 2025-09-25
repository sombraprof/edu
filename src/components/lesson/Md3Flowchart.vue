<template>
  <div class="card overflow-x-auto" :style="{ padding: 'var(--md-sys-spacing-6)' }">
    <div class="flowchart-container">
      <div v-for="(element, index) in elements" :key="index" :class="element.class">
        <template v-if="element.type === 'terminal'">
          {{ element.text }}
        </template>
        <template v-else-if="element.type === 'io'">
          <span>{{ element.text }}</span>
        </template>
        <template v-else-if="element.type === 'process'">
          {{ element.text }}
        </template>
        <template v-else-if="element.type === 'decision'">
          {{ element.text }}
        </template>
        <template v-else-if="element.type === 'arrow'">
          <!-- Arrow element -->
        </template>
        <template v-else-if="element.type === 'bifurcation'">
          <div class="flowchart-bifurcation">
            <div
              v-for="(branch, branchIndex) in element.branches"
              :key="branchIndex"
              class="flowchart-branch"
            >
              <div class="flowchart-branch-label">{{ branch.label }}</div>
              <div :class="branch.class">
                <span v-if="branch.type === 'io'">{{ branch.text }}</span>
                <div v-else>{{ branch.text }}</div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="element.type === 'junction'">
          <!-- Junction point -->
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FlowchartElement {
  type: 'terminal' | 'io' | 'process' | 'decision' | 'arrow' | 'bifurcation' | 'junction';
  class: string;
  text?: string;
  branches?: Array<{
    label: string;
    class: string;
    type: string;
    text: string;
  }>;
}

interface Md3FlowchartProps {
  elements: FlowchartElement[];
}

defineProps<Md3FlowchartProps>();
</script>

<style scoped>
.flowchart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--md-sys-spacing-4);
}

.flowchart-shape {
  padding: var(--md-sys-spacing-3) var(--md-sys-spacing-4);
  border: 2px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-border-radius-medium);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  text-align: center;
  min-width: 120px;
}

.flowchart-terminal {
  border-radius: 50%;
}

.flowchart-io {
  transform: skew(-10deg);
}

.flowchart-decision {
  transform: rotate(45deg);
}

.flowchart-arrow {
  width: 2px;
  height: 2rem;
  background-color: var(--md-sys-color-outline);
  position: relative;
}

.flowchart-arrow::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 8px solid var(--md-sys-color-outline);
}

.flowchart-bifurcation {
  display: flex;
  gap: var(--md-sys-spacing-8);
  align-items: flex-start;
}

.flowchart-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--md-sys-spacing-2);
}

.flowchart-branch-label {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  padding: var(--md-sys-spacing-1) var(--md-sys-spacing-2);
  border-radius: var(--md-sys-border-radius-small);
  font-size: var(--md-sys-typescale-body-small-size);
  font-weight: 600;
}

.flowchart-junction-point {
  width: 8px;
  height: 8px;
  background-color: var(--md-sys-color-outline);
  border-radius: 50%;
}
</style>

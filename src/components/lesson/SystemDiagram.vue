<template>
  <article class="system-diagram card md-stack md-stack-4">
    <header v-if="data.title || data.summary" class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.summary" class="text-body-medium text-on-surface-variant">{{ data.summary }}</p>
    </header>

    <section class="system-diagram__grid" aria-label="Nós do sistema">
      <article v-for="node in data.nodes" :key="node.id" class="system-diagram__node">
        <h4 class="text-title-medium font-semibold text-on-surface">{{ node.label }}</h4>
        <p v-if="node.description" class="text-body-medium text-on-surface-variant">
          {{ node.description }}
        </p>
      </article>
    </section>

    <section
      v-if="data.connections?.length"
      class="system-diagram__connections"
      aria-label="Conexões"
    >
      <h4 class="text-title-small font-semibold text-on-surface">Conexões</h4>
      <ul class="md-stack md-stack-1" role="list">
        <li
          v-for="(connection, index) in data.connections"
          :key="index"
          class="text-body-medium text-on-surface"
        >
          <span class="font-semibold">{{ resolveNodeLabel(connection.from) }}</span>
          <span class="text-on-surface-variant"> → </span>
          <span class="font-semibold">{{ resolveNodeLabel(connection.to) }}</span>
          <span v-if="connection.label" class="text-on-surface-variant">
            — {{ connection.label }}</span
          >
        </li>
      </ul>
    </section>

    <section v-if="data.legend?.length" class="system-diagram__legend" aria-label="Legenda">
      <h4 class="text-title-small font-semibold text-on-surface">Legenda</h4>
      <ul class="md-stack md-stack-1" role="list">
        <li
          v-for="(entry, index) in data.legend"
          :key="index"
          class="text-body-small text-on-surface-variant"
        >
          {{ entry }}
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface SystemDiagramNode {
  id: string;
  label: string;
  description?: string;
}

export interface SystemDiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface SystemDiagramBlockData {
  title?: string;
  summary?: string;
  nodes: SystemDiagramNode[];
  connections?: SystemDiagramConnection[];
  legend?: string[];
}

const props = defineProps<{ data: SystemDiagramBlockData }>();

const nodeMap = computed(() => {
  const entries = new Map<string, string>();
  props.data.nodes.forEach((node) => {
    entries.set(node.id, node.label);
  });
  return entries;
});

function resolveNodeLabel(id: string): string {
  return nodeMap.value.get(id) ?? id;
}
</script>

<style scoped>
.system-diagram {
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.system-diagram__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.system-diagram__node {
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 1rem;
  padding: 1rem;
  background: var(--md-sys-color-surface-container-low);
}

.system-diagram__connections,
.system-diagram__legend {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
}
</style>

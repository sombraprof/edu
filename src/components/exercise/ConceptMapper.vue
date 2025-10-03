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

    <div class="concept-mapper__grid">
      <section v-for="group in groupedEntries" :key="group.category" class="concept-mapper__column">
        <h4 class="text-title-small font-semibold text-on-surface">{{ group.category }}</h4>
        <ul class="md-stack md-stack-1" role="list">
          <li v-for="node in group.nodes" :key="node.id" class="concept-mapper__node">
            <p class="text-body-medium text-on-surface">{{ node.label }}</p>
            <p v-if="node.details" class="text-body-small text-on-surface-variant">
              {{ node.details }}
            </p>
          </li>
        </ul>
      </section>
    </div>

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
import { computed } from 'vue';

export interface ConceptMapperNode {
  id: string;
  label: string;
  category?: string;
  details?: string;
}

export interface ConceptMapperRelationship {
  from: string;
  to: string;
  label?: string;
}

export interface ConceptMapperBlockData {
  title?: string;
  description?: string;
  nodes: ConceptMapperNode[];
  relationships?: ConceptMapperRelationship[];
}

const props = defineProps<{ data: ConceptMapperBlockData }>();

const groupedEntries = computed(() => {
  const groups = new Map<string, ConceptMapperNode[]>();
  props.data.nodes.forEach((node) => {
    const category = node.category ?? 'Conceitos';
    const bucket = groups.get(category) ?? [];
    bucket.push(node);
    groups.set(category, bucket);
  });
  return Array.from(groups.entries()).map(([category, nodes]) => ({ category, nodes }));
});

const nodeMap = computed(() => {
  const map = new Map<string, string>();
  props.data.nodes.forEach((node) => map.set(node.id, node.label));
  return map;
});

function resolveNodeLabel(id: string) {
  return nodeMap.value.get(id) ?? id;
}
</script>

<style scoped>
.concept-mapper {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.concept-mapper__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.concept-mapper__column {
  display: grid;
  gap: 0.75rem;
}

.concept-mapper__node {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
}

.concept-mapper__relationships {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
}
</style>

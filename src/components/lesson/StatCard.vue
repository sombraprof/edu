<template>
  <article class="stat-card" :class="trendClass">
    <div class="stat-card__header">
      <p class="text-label-medium uppercase tracking-[0.2em] text-on-surface-variant">
        {{ data.label }}
      </p>
      <component :is="trendIcon" class="md-icon md-icon--lg" aria-hidden="true" />
    </div>
    <p class="stat-card__value">{{ data.value }}</p>
    <p v-if="data.context" class="stat-card__context">{{ data.context }}</p>
    <p v-if="data.source" class="stat-card__source">Fonte: {{ data.source }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next';

export type StatTrend = 'up' | 'down' | 'neutral';

export interface StatCardBlockData {
  label: string;
  value: string;
  context?: string;
  source?: string;
  trend?: StatTrend;
}

const props = defineProps<{ data: StatCardBlockData }>();

const resolvedTrend = computed<StatTrend>(() => props.data.trend ?? 'neutral');

const trendIcon = computed(() => {
  switch (resolvedTrend.value) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    default:
      return Minus;
  }
});

const trendClass = computed(() => `stat-card--${resolvedTrend.value}`);
</script>

<style scoped>
.stat-card {
  display: grid;
  gap: 0.5rem;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

.stat-card--up {
  border-color: var(--md-sys-color-tertiary);
}

.stat-card--down {
  border-color: var(--md-sys-color-error);
}

.stat-card--neutral {
  border-color: var(--md-sys-color-outline-variant);
}

.stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card__value {
  font-size: 2.75rem;
  font-weight: 700;
}

.stat-card__context {
  color: var(--md-sys-color-on-surface-variant);
}

.stat-card__source {
  font-size: 0.75rem;
  color: var(--md-sys-color-on-surface-variant);
}
</style>

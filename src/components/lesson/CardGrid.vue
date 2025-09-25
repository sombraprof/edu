<template>
  <section class="card-grid">
    <header v-if="data.title || data.description" class="card-grid__header">
      <h4 v-if="data.title" class="card-grid__title">{{ data.title }}</h4>
      <p v-if="data.description" class="card-grid__description">{{ data.description }}</p>
    </header>

    <div class="card-grid__layout" :style="gridStyle">
      <article
        v-for="(card, index) in data.cards"
        :key="index"
        :class="['card-grid__card', toneClass(card.tone)]"
      >
        <div v-if="card.badge" class="card-grid__badge">{{ card.badge }}</div>

        <h5 v-if="card.title" class="card-grid__card-title">{{ card.title }}</h5>

        <p v-if="card.subtitle" class="card-grid__card-subtitle">{{ card.subtitle }}</p>

        <div v-if="card.body" class="card-grid__body" v-html="card.body"></div>

        <ul v-if="card.items?.length" class="card-grid__list">
          <li v-for="(item, itemIndex) in card.items" :key="itemIndex" v-html="item"></li>
        </ul>

        <footer v-if="card.footer || card.actions?.length" class="card-grid__footer">
          <p v-if="card.footer" class="card-grid__footer-text" v-html="card.footer"></p>
          <div v-if="card.actions?.length" class="card-grid__actions">
            <a
              v-for="(action, actionIndex) in card.actions"
              :key="actionIndex"
              class="btn btn-tonal"
              :href="action.href"
              :target="action.external ? '_blank' : undefined"
              :rel="action.external ? 'noreferrer' : undefined"
            >
              {{ action.label }}
            </a>
          </div>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface CardGridAction {
  label: string;
  href: string;
  external?: boolean;
}

interface CardGridCard {
  title?: string;
  subtitle?: string;
  badge?: string;
  tone?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  body?: string;
  items?: string[];
  footer?: string;
  actions?: CardGridAction[];
}

interface CardGridData {
  title?: string;
  description?: string;
  columns?: number;
  cards: CardGridCard[];
}

const { data } = defineProps<{ data: CardGridData }>();

const gridStyle = computed(() => {
  const columns = Math.max(1, Math.min(4, data.columns ?? 2));
  return { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };
});

function toneClass(tone?: CardGridCard['tone']) {
  switch (tone) {
    case 'primary':
      return 'card-grid__card--primary';
    case 'secondary':
      return 'card-grid__card--secondary';
    case 'success':
      return 'card-grid__card--success';
    case 'warning':
      return 'card-grid__card--warning';
    case 'danger':
      return 'card-grid__card--danger';
    case 'info':
      return 'card-grid__card--info';
    case 'neutral':
      return 'card-grid__card--neutral';
    default:
      return 'card-grid__card--surface';
  }
}
</script>

<style scoped>
.card-grid {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-4);
}

.card-grid__header {
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.card-grid__title {
  font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.card-grid__description {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
}

.card-grid__layout {
  display: grid;
  gap: var(--md-sys-spacing-4);
}

.card-grid__card {
  position: relative;
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-5);
  border: 1px solid transparent;
  box-shadow: var(--shadow-elevation-1);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.card-grid__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevation-2);
}

.card-grid__card--surface {
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
}

.card-grid__card--primary {
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 85%, var(--md-sys-color-surface) 15%);
  color: var(--md-sys-color-on-primary-container);
  border-color: color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
}

.card-grid__card--secondary {
  background: color-mix(in srgb, var(--md-sys-color-secondary-container) 85%, var(--md-sys-color-surface) 15%);
  color: var(--md-sys-color-on-secondary-container);
  border-color: color-mix(in srgb, var(--md-sys-color-secondary) 25%, transparent);
}

.card-grid__card--info {
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 70%, transparent);
  color: var(--md-sys-color-on-primary-container);
  border-color: color-mix(in srgb, var(--md-sys-color-primary) 35%, transparent);
}

.card-grid__card--success {
  background: color-mix(in srgb, var(--md-sys-color-success-container) 75%, transparent);
  color: var(--md-sys-color-on-success-container);
  border-color: color-mix(in srgb, var(--md-sys-color-success) 35%, transparent);
}

.card-grid__card--warning {
  background: color-mix(in srgb, var(--md-sys-color-warning-container) 75%, transparent);
  color: var(--md-sys-color-on-warning-container);
  border-color: color-mix(in srgb, var(--md-sys-color-warning) 35%, transparent);
}

.card-grid__card--danger {
  background: color-mix(in srgb, var(--md-sys-color-error) 12%, var(--md-sys-color-surface) 88%);
  color: var(--md-sys-color-on-surface);
  border-color: color-mix(in srgb, var(--md-sys-color-error) 35%, transparent);
}

.card-grid__card--neutral {
  background: color-mix(in srgb, var(--md-sys-color-surface-variant) 70%, transparent);
  color: var(--md-sys-color-on-surface);
  border-color: color-mix(in srgb, var(--md-sys-color-outline) 65%, transparent);
}

.card-grid__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--md-sys-spacing-1);
  padding: 0.35rem 0.75rem;
  border-radius: var(--md-sys-border-radius-full);
  background: color-mix(in srgb, var(--md-sys-color-surface) 25%, rgba(0,0,0,0.05) 75%);
  font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.card-grid__card-title {
  font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
  font-weight: 600;
  margin-bottom: var(--md-sys-spacing-2);
}

.card-grid__card-subtitle {
  color: color-mix(in srgb, currentColor 60%, transparent 40%);
  margin-bottom: var(--md-sys-spacing-2);
  font-weight: 500;
}

.card-grid__body,
.card-grid__body :deep(p) {
  color: inherit;
  font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
}

.card-grid__list {
  margin-top: var(--md-sys-spacing-3);
  display: grid;
  gap: var(--md-sys-spacing-2);
  list-style: disc;
  padding-left: 1.25rem;
}

.card-grid__footer {
  margin-top: var(--md-sys-spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
}

.card-grid__footer-text {
  color: inherit;
  font-weight: 500;
}

.card-grid__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--md-sys-spacing-2);
}

@media (max-width: 768px) {
  .card-grid__layout {
    grid-template-columns: 1fr;
  }
}
</style>


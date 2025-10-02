<template>
  <section class="crc-cards">
    <header class="crc-cards__header">
      <h3 v-if="data.title" class="crc-cards__title">{{ data.title }}</h3>
      <p v-if="data.description" class="crc-cards__description">{{ data.description }}</p>
    </header>

    <ul class="crc-cards__grid" role="list">
      <li v-for="(c, i) in classes" :key="i" class="crc-card">
        <h4 class="crc-card__name">{{ c.name }}</h4>
        <div class="crc-card__columns">
          <div>
            <h5 class="crc-card__subtitle">Responsabilidades</h5>
            <ul class="crc-card__list" role="list">
              <li v-for="(r, ri) in c.responsibilities" :key="ri" v-html="r"></li>
            </ul>
          </div>
          <div>
            <h5 class="crc-card__subtitle">Colaboradores</h5>
            <ul class="crc-card__list" role="list">
              <li v-for="(col, ci) in c.collaborators" :key="ci">{{ col }}</li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface CRCClass {
  name: string;
  responsibilities: string[];
  collaborators: string[];
}
interface CRCCardsData {
  title?: string;
  description?: string;
  classes: Array<
    | CRCClass
    | {
        name?: string;
        title?: string;
        responsibilities?: Array<string | { text?: string }>;
        collaborators?: Array<string | { name?: string }>;
      }
  >;
}

const props = defineProps<{ data: CRCCardsData }>();

const classes = computed<CRCClass[]>(() => {
  const raw = Array.isArray(props.data?.classes) ? props.data.classes : [];
  return raw
    .map((entry) => {
      const name = String((entry as any).name ?? (entry as any).title ?? '').trim();
      if (!name) return undefined;
      const responsibilities = ((entry as any).responsibilities || [])
        .map((r: any) => sanitizeHtml(typeof r === 'string' ? r : (r?.text ?? '')))
        .filter((s: string) => s);
      const collaborators = ((entry as any).collaborators || [])
        .map((c: any) => String(typeof c === 'string' ? c : (c?.name ?? '')).trim())
        .filter((s: string) => s);
      return { name, responsibilities, collaborators } as CRCClass;
    })
    .filter((c): c is CRCClass => Boolean(c));
});
</script>

<style scoped>
.crc-cards {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}
.crc-cards__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
}
.crc-cards__description {
  color: var(--md-sys-color-on-surface-variant);
}

.crc-cards__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--md-sys-spacing-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.crc-card {
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-3);
}
.crc-card__name {
  margin: 0;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}
.crc-card__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--md-sys-spacing-4);
}
.crc-card__subtitle {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}
.crc-card__list {
  display: grid;
  gap: 0.25rem;
  margin: 0;
  padding-left: 1rem;
}

@media (max-width: 1024px) {
  .crc-cards__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .crc-cards {
    padding: var(--md-sys-spacing-5);
  }
  .crc-cards__grid {
    grid-template-columns: 1fr;
  }
}
</style>

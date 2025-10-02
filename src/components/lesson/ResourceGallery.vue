<template>
  <section class="resource-gallery">
    <header class="resource-gallery__header">
      <h3 v-if="data.title" class="resource-gallery__title">{{ data.title }}</h3>
      <p v-if="data.description" class="resource-gallery__description">{{ data.description }}</p>

      <div v-if="hasFilters" class="resource-gallery__filters">
        <label class="resource-gallery__filter">
          <span class="resource-gallery__filter-label">Tipo</span>
          <select v-model="selectedType" class="resource-gallery__select">
            <option value="">Todos</option>
            <option v-for="t in availableTypes" :key="t" :value="t">{{ labelForType(t) }}</option>
          </select>
        </label>
      </div>
    </header>

    <div v-if="loading" class="resource-gallery__loading">Carregando recursos…</div>
    <div v-else-if="error" class="resource-gallery__error">{{ error }}</div>
    <ul v-else class="resource-gallery__grid" role="list">
      <li v-for="item in filteredItems" :key="item.id" class="resource-gallery__card">
        <a
          class="resource-gallery__link"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="resolveAriaLabel(item)"
        >
          <div class="resource-gallery__media" :data-kind="item.type">
            <img
              v-if="item.thumbnail"
              class="resource-gallery__img"
              :src="item.thumbnail"
              :alt="item.title"
              loading="lazy"
            />
            <div v-else class="resource-gallery__placeholder">{{ labelForType(item.type) }}</div>
          </div>
          <div class="resource-gallery__content">
            <h4 class="resource-gallery__item-title">{{ item.title }}</h4>
            <p v-if="item.author || item.source" class="resource-gallery__meta">
              <span v-if="item.author">{{ item.author }}</span>
              <span v-if="item.author && item.source"> · </span>
              <span v-if="item.source">{{ item.source }}</span>
            </p>
            <p v-if="item.license" class="resource-gallery__license">
              <a
                v-if="item.licenseUrl"
                :href="item.licenseUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.license }}
              </a>
              <span v-else>{{ item.license }}</span>
            </p>
          </div>
        </a>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type ResourceType = 'image' | 'video' | 'audio' | 'article' | 'dataset' | 'interactive';

export interface ResourceItem {
  id?: string;
  type: ResourceType;
  title: string;
  url: string;
  thumbnail?: string;
  author?: string;
  source?: string;
  license?: string;
  licenseUrl?: string;
}

interface ResourceGalleryData {
  title?: string;
  description?: string;
  src?: string; // opcional: JSON externo com { items: ResourceItem[] }
  items?: ResourceItem[];
}

const props = defineProps<{ data: ResourceGalleryData }>();

const items = ref<ResourceItem[]>(Array.isArray(props.data?.items) ? props.data.items : []);
const loading = ref(false);
const error = ref('');

function resolveSrcUrl(src: unknown): string {
  if (typeof src !== 'string' || !src.trim()) return '';
  const trimmed = src.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '/');
  const normalized = trimmed.replace(/^\//, '');
  return base + normalized;
}

onMounted(async () => {
  const raw = typeof props.data?.src === 'string' ? props.data.src : '';
  if (!raw) return;
  const src = resolveSrcUrl(raw);
  try {
    loading.value = true;
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Falha ao carregar recursos (${res.status})`);
    const json = await res.json();
    const loaded = Array.isArray(json?.items) ? (json.items as ResourceItem[]) : [];
    if (loaded.length) items.value = loaded;
  } catch (e: any) {
    error.value = e?.message || 'Erro ao carregar recursos.';
  } finally {
    loading.value = false;
  }
});

const availableTypes = computed(() => {
  const set = new Set(items.value.map((i) => i.type).filter(Boolean));
  return Array.from(set);
});

const selectedType = ref<ResourceType | ''>('');
const hasFilters = computed(() => availableTypes.value.length > 1);

const filteredItems = computed(() => {
  const t = selectedType.value;
  return t ? items.value.filter((i) => i.type === t) : items.value;
});

function labelForType(type: ResourceType | string) {
  switch (type) {
    case 'image':
      return 'Imagem';
    case 'video':
      return 'Vídeo';
    case 'audio':
      return 'Áudio';
    case 'article':
      return 'Artigo';
    case 'dataset':
      return 'Dataset';
    case 'interactive':
      return 'Interativo';
    default:
      return 'Recurso';
  }
}

function resolveAriaLabel(item: ResourceItem) {
  const parts = [labelForType(item.type), item.title];
  if (item.author) parts.push(`por ${item.author}`);
  return parts.join(' – ');
}
</script>

<style scoped>
.resource-gallery {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}

.resource-gallery__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.resource-gallery__description {
  color: var(--md-sys-color-on-surface-variant);
}

.resource-gallery__filters {
  margin-top: var(--md-sys-spacing-2);
}

.resource-gallery__filter {
  display: inline-grid;
  gap: var(--md-sys-spacing-1);
}

.resource-gallery__filter-label {
  font-size: var(--md-sys-typescale-label-medium-size, 0.85rem);
  color: var(--md-sys-color-on-surface-variant);
}

.resource-gallery__select {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
}

.resource-gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--md-sys-spacing-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.resource-gallery__card {
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  overflow: hidden;
}

.resource-gallery__link {
  display: grid;
  text-decoration: none;
  color: inherit;
}

.resource-gallery__media {
  background: var(--md-sys-color-surface-container);
  min-height: 120px;
  display: grid;
  place-items: center;
}

.resource-gallery__img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.resource-gallery__placeholder {
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 600;
}

.resource-gallery__content {
  padding: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-1);
}

.resource-gallery__item-title {
  margin: 0;
  font-size: var(--md-sys-typescale-title-small-size, 1rem);
  color: var(--md-sys-color-on-surface);
}

.resource-gallery__meta {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}

.resource-gallery__license {
  margin: 0;
  color: var(--md-sys-color-primary);
  font-size: var(--md-sys-typescale-label-medium-size, 0.85rem);
}

@media (max-width: 1024px) {
  .resource-gallery__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .resource-gallery {
    padding: var(--md-sys-spacing-5);
  }
  .resource-gallery__grid {
    grid-template-columns: 1fr;
  }
}
</style>

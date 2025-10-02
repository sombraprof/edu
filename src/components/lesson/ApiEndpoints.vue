<template>
  <section class="api-endpoints">
    <header class="api-endpoints__header">
      <h3 v-if="data.title" class="api-endpoints__title">{{ data.title }}</h3>
      <p v-if="data.baseUrl" class="api-endpoints__base">
        Base: <code>{{ data.baseUrl }}</code>
      </p>
    </header>

    <ul class="api-endpoints__list" role="list">
      <li v-for="(ep, i) in endpoints" :key="i" class="api-endpoints__item">
        <div class="api-endpoints__head">
          <span class="api-endpoints__method" :data-m="ep.method">{{ ep.method }}</span>
          <code class="api-endpoints__path">{{ ep.path }}</code>
          <span v-if="ep.auth" class="api-endpoints__auth">{{
            typeof ep.auth === 'string' ? ep.auth : 'Auth'
          }}</span>
        </div>
        <p v-if="ep.description" class="api-endpoints__desc">{{ ep.description }}</p>
        <CodeBlock v-if="ep.curl" :code="ep.curl" language="bash" class="api-endpoints__code" />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CodeBlock from './CodeBlock.vue';

interface Endpoint {
  method: string;
  path: string;
  description?: string;
  auth?: boolean | string;
  curl?: string;
}

interface ApiEndpointsData {
  title?: string;
  baseUrl?: string;
  endpoints: Array<
    | Endpoint
    | { method?: string; path?: string; desc?: string; auth?: boolean | string; sample?: string }
  >;
}

const props = defineProps<{ data: ApiEndpointsData }>();

const endpoints = computed<Endpoint[]>(() => {
  const raw = Array.isArray(props.data?.endpoints) ? props.data.endpoints : [];
  return raw
    .map((entry) => {
      const method = String((entry as any).method || '')
        .toUpperCase()
        .trim();
      const path = String((entry as any).path || '').trim();
      if (!method || !path) return undefined;
      const description = String((entry as any).description ?? (entry as any).desc ?? '').trim();
      const auth = (entry as any).auth;
      const curl = String((entry as any).curl ?? (entry as any).sample ?? '').trim();
      return { method, path, description, auth, curl: curl || undefined } as Endpoint;
    })
    .filter((e): e is Endpoint => Boolean(e));
});
</script>

<style scoped>
.api-endpoints {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: grid;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--md-sys-elevation-level1);
}
.api-endpoints__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
}
.api-endpoints__base {
  color: var(--md-sys-color-on-surface-variant);
}
.api-endpoints__list {
  display: grid;
  gap: var(--md-sys-spacing-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.api-endpoints__item {
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-2);
}
.api-endpoints__head {
  display: flex;
  gap: var(--md-sys-spacing-3);
  align-items: center;
  flex-wrap: wrap;
}
.api-endpoints__method {
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
.api-endpoints__method[data-m='GET'] {
  background: color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
  color: var(--md-sys-color-primary);
}
.api-endpoints__method[data-m='POST'] {
  background: color-mix(in srgb, var(--md-sys-color-tertiary) 20%, transparent);
  color: var(--md-sys-color-tertiary);
}
.api-endpoints__method[data-m='PUT'],
.api-endpoints__method[data-m='PATCH'] {
  background: color-mix(in srgb, var(--md-sys-color-secondary) 20%, transparent);
  color: var(--md-sys-color-secondary);
}
.api-endpoints__method[data-m='DELETE'] {
  background: color-mix(in srgb, var(--md-sys-color-error) 20%, transparent);
  color: var(--md-sys-color-error);
}
.api-endpoints__path {
  color: var(--md-sys-color-on-surface);
}
.api-endpoints__auth {
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 600;
}
.api-endpoints__desc {
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}
.api-endpoints__code {
  --code-block-spacing: var(--md-sys-spacing-2);
}
@media (max-width: 640px) {
  .api-endpoints {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

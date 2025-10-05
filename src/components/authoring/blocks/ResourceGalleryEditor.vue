<template>
  <section class="md-stack md-stack-4">
    <header class="md-stack md-stack-1">
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Galeria de recursos</h3>
      <p class="text-sm text-on-surface-variant">
        Curadoria de materiais complementares como artigos, vídeos e datasets. Cada item pode
        incluir metadados como autor, fonte e licença.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Título</span>
        <input
          v-model="state.title"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          autofocus
        />
      </label>
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Descrição</span>
        <textarea
          v-model="state.description"
          rows="3"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Contextualize os materiais selecionados"
        ></textarea>
      </label>
      <label class="md:col-span-2 flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Fonte externa (JSON)</span>
        <input
          v-model="state.src"
          type="url"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="URL opcional com { items: [...] }"
        />
      </label>
    </div>

    <section
      class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-3"
    >
      <header class="flex items-center justify-between">
        <div>
          <h4 class="text-title-small font-semibold text-on-surface">Itens cadastrados</h4>
          <p class="text-sm text-on-surface-variant">
            Cadastre links verificados para consulta rápida dos estudantes.
          </p>
        </div>
        <Md3Button type="button" variant="tonal" @click="addItem">
          <template #leading>
            <Plus class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Adicionar recurso
        </Md3Button>
      </header>

      <div v-if="state.items.length" class="flex flex-col gap-4">
        <article
          v-for="(item, index) in state.items"
          :key="item.id"
          class="rounded-3xl border border-outline bg-surface p-4 md-stack md-stack-3"
        >
          <header class="flex items-center justify-between gap-3">
            <h5 class="text-title-small font-semibold text-on-surface">Recurso {{ index + 1 }}</h5>
            <Md3Button
              v-if="state.items.length > 1"
              type="button"
              variant="text"
              class="text-error"
              @click="removeItem(index)"
            >
              <template #leading>
                <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Remover
            </Md3Button>
          </header>

          <div class="grid gap-3 md:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Tipo</span>
              <select
                v-model="item.type"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <option v-for="option in resourceTypes" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Título</span>
              <input
                v-model="item.title"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </label>
            <label class="md:col-span-2 flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Link</span>
              <input
                v-model="item.url"
                type="url"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="https://"
              />
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Autor</span>
              <input
                v-model="item.author"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Opcional"
              />
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Fonte</span>
              <input
                v-model="item.source"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Portal, coletânea, etc."
              />
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Licença</span>
              <input
                v-model="item.license"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Creative Commons, domínio público..."
              />
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Link da licença</span>
              <input
                v-model="item.licenseUrl"
                type="url"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="https://"
              />
            </label>
            <label class="md:col-span-2 flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Thumbnail</span>
              <input
                v-model="item.thumbnail"
                type="url"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="URL da imagem (opcional)"
              />
            </label>
          </div>
        </article>
      </div>
      <p v-else class="rounded-3xl bg-surface p-4 text-sm text-on-surface-variant">
        Adicione pelo menos um recurso para exibir a galeria na aula.
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

type ResourceType = 'article' | 'image' | 'video' | 'audio' | 'dataset' | 'interactive';

interface ResourceItemState {
  id: string;
  type: ResourceType;
  title: string;
  url: string;
  author: string;
  source: string;
  license: string;
  licenseUrl: string;
  thumbnail: string;
}

interface ResourceGalleryInput {
  type?: string;
  title?: string;
  description?: string;
  src?: string;
  items?: Array<Partial<ResourceItemState> & { type?: ResourceType }>;
}

const resourceTypes: Array<{ value: ResourceType; label: string }> = [
  { value: 'article', label: 'Artigo' },
  { value: 'image', label: 'Imagem' },
  { value: 'video', label: 'Vídeo' },
  { value: 'audio', label: 'Áudio' },
  { value: 'dataset', label: 'Dataset' },
  { value: 'interactive', label: 'Interativo' },
];

const props = defineProps<{ block: ResourceGalleryInput }>();
const emit = defineEmits<{ (event: 'update:block', value: ResourceGalleryInput): void }>();

function createKey(prefix = 'resource'): string {
  const globalCrypto =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `${prefix}-${globalCrypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeItems(block: ResourceGalleryInput): ResourceItemState[] {
  const raw = Array.isArray(block?.items) ? block.items : [];
  if (!raw.length) {
    return [createItem()];
  }
  return raw.map((item, index) => ({
    id: item?.id ? String(item.id) : createKey(`resource-${index + 1}`),
    type: (item?.type as ResourceType) ?? 'article',
    title: typeof item?.title === 'string' ? item.title : '',
    url: typeof item?.url === 'string' ? item.url : '',
    author: typeof item?.author === 'string' ? item.author : '',
    source: typeof item?.source === 'string' ? item.source : '',
    license: typeof item?.license === 'string' ? item.license : '',
    licenseUrl: typeof item?.licenseUrl === 'string' ? item.licenseUrl : '',
    thumbnail: typeof item?.thumbnail === 'string' ? item.thumbnail : '',
  }));
}

function createItem(): ResourceItemState {
  return {
    id: createKey(),
    type: 'article',
    title: '',
    url: '',
    author: '',
    source: '',
    license: '',
    licenseUrl: '',
    thumbnail: '',
  };
}

function normalizeState(block: ResourceGalleryInput) {
  return {
    type: typeof block?.type === 'string' ? block.type : 'resourceGallery',
    title: typeof block?.title === 'string' ? block.title : '',
    description: typeof block?.description === 'string' ? block.description : '',
    src: typeof block?.src === 'string' ? block.src : '',
    items: normalizeItems(block),
  };
}

const state = reactive(normalizeState(props.block));

let syncing = false;

watch(
  () => props.block,
  (value) => {
    syncing = true;
    const next = normalizeState(value ?? {});
    state.type = next.type;
    state.title = next.title;
    state.description = next.description;
    state.src = next.src;
    state.items = next.items;
    syncing = false;
  },
  { deep: true }
);

watch(
  state,
  () => {
    if (syncing) return;
    emit('update:block', {
      type: state.type || 'resourceGallery',
      title: state.title,
      description: state.description,
      src: state.src || undefined,
      items: state.items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        url: item.url,
        author: item.author || undefined,
        source: item.source || undefined,
        license: item.license || undefined,
        licenseUrl: item.licenseUrl || undefined,
        thumbnail: item.thumbnail || undefined,
      })),
    });
  },
  { deep: true }
);

function addItem() {
  state.items = [...state.items, createItem()];
}

function removeItem(index: number) {
  if (state.items.length <= 1) return;
  state.items = state.items.filter((_, i) => i !== index);
}
</script>

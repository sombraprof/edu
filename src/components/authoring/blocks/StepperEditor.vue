<template>
  <section class="lesson-stepper-editor md-stack md-stack-4">
    <header class="md-stack md-stack-1">
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Passo a passo</h3>
      <p class="text-sm text-on-surface-variant">
        Divida atividades complexas em etapas sequenciais com instruções claras e recursos de apoio.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Título do bloco</span>
        <input
          v-model="state.title"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Passo a passo"
          autofocus
        />
      </label>
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Resumo</span>
        <textarea
          v-model="state.summary"
          rows="3"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Contextualize o objetivo desta sequência"
        ></textarea>
      </label>
      <label class="flex items-center gap-3">
        <input v-model="state.autoPlay" type="checkbox" class="h-4 w-4" />
        <span class="md-typescale-label-large text-on-surface">
          Ativar autoplay (avançar automaticamente)
        </span>
      </label>
      <label v-if="state.autoPlay" class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Intervalo do autoplay (ms)</span>
        <input
          v-model="state.autoPlayDelay"
          type="number"
          min="2000"
          step="500"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="8000"
        />
        <p class="text-xs text-on-surface-variant">
          Recomendamos no mínimo 2000 ms para leitura confortável.
        </p>
      </label>
    </div>

    <section class="lesson-stepper-editor__steps md-stack md-stack-3">
      <header class="flex items-center justify-between">
        <div>
          <h4 class="text-title-small font-semibold text-on-surface">Passos cadastrados</h4>
          <p class="text-sm text-on-surface-variant">
            Adicione instruções e mídias de apoio para cada etapa.
          </p>
        </div>
        <Md3Button type="button" variant="tonal" @click="addStep">
          <template #leading>
            <Plus class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Adicionar passo
        </Md3Button>
      </header>

      <div v-if="state.steps.length" class="flex flex-col gap-4">
        <article
          v-for="(step, index) in state.steps"
          :key="step.id"
          class="lesson-stepper-editor__step md-stack md-stack-3"
        >
          <header class="flex items-center justify-between gap-3">
            <h5 class="text-title-small font-semibold text-on-surface">Passo {{ index + 1 }}</h5>
            <Md3Button
              v-if="state.steps.length > 1"
              type="button"
              variant="text"
              class="text-error"
              @click="removeStep(index)"
            >
              <template #leading>
                <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Remover
            </Md3Button>
          </header>

          <div class="grid gap-3 md:grid-cols-2">
            <label class="flex flex-col gap-2 md:col-span-2">
              <span class="md-typescale-label-large text-on-surface">Título do passo</span>
              <input
                v-model="step.title"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Planejar"
              />
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Descrição</span>
              <textarea
                v-model="step.description"
                rows="3"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Explique o objetivo ou ação esperada neste passo"
              ></textarea>
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface"
                >HTML adicional (opcional)</span
              >
              <textarea
                v-model="step.html"
                rows="3"
                class="rounded-3xl border border-outline bg-surface p-3 font-mono text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="<p>Conteúdo rico com formatação.</p>"
              ></textarea>
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Código (opcional)</span>
              <textarea
                v-model="step.code"
                rows="3"
                class="rounded-3xl border border-outline bg-surface p-3 font-mono text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="console.log('Olá');"
              ></textarea>
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Linguagem do código</span>
              <input
                v-model="step.language"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="javascript, bash, python..."
              />
            </label>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface"
                >Legenda/descrição da mídia</span
              >
              <textarea
                v-model="step.caption"
                rows="2"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Complemento textual para a mídia exibida"
              ></textarea>
            </label>
            <label class="flex flex-col gap-2 md:col-span-2">
              <span class="md-typescale-label-large text-on-surface">Embed (HTML seguro)</span>
              <textarea
                v-model="step.embed"
                rows="3"
                class="rounded-3xl border border-outline bg-surface p-3 font-mono text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="<iframe src='https://...'></iframe>"
              ></textarea>
            </label>
          </div>

          <section class="lesson-stepper-editor__media md-stack md-stack-3">
            <header class="flex items-center justify-between">
              <h6 class="text-title-small font-semibold text-on-surface">Mídia do passo</h6>
            </header>
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Tipo de mídia</span>
              <select
                v-model="step.mediaType"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <option value="none">Sem mídia</option>
                <option value="image">Imagem única</option>
                <option value="gallery">Galeria de imagens</option>
                <option value="video">Vídeo incorporado</option>
              </select>
            </label>

            <div
              v-if="step.mediaType === 'image'"
              class="lesson-stepper-editor__media-card md-stack md-stack-3"
            >
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">URL da imagem</span>
                <input
                  v-model="step.mediaSrc"
                  type="text"
                  class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  placeholder="/images/passo-01.png"
                />
              </label>
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">Texto alternativo</span>
                <input
                  v-model="step.mediaAlt"
                  type="text"
                  class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  placeholder="Descrição da imagem"
                />
              </label>
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">Legenda específica</span>
                <input
                  v-model="step.mediaCaption"
                  type="text"
                  class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  placeholder="Legenda exibida abaixo da imagem"
                />
              </label>
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">Crédito</span>
                <input
                  v-model="step.mediaCredit"
                  type="text"
                  class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  placeholder="Autoria / Fonte"
                />
              </label>
              <label class="flex items-center gap-2">
                <input v-model="step.mediaLightbox" type="checkbox" class="h-4 w-4" />
                <span class="text-sm text-on-surface">Permitir ampliar no lightbox</span>
              </label>
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">Fazer upload</span>
                <input
                  type="file"
                  accept="image/*"
                  @change="(event) => uploadStepImage(index, event)"
                />
                <p class="text-xs text-on-surface-variant">
                  A imagem será convertida para uma URL base64 para visualização rápida.
                </p>
              </label>
              <img
                v-if="step.mediaSrc"
                :src="step.mediaSrc"
                alt="Pré-visualização da imagem do passo"
                class="lesson-stepper-editor__preview"
              />
            </div>

            <div
              v-else-if="step.mediaType === 'gallery'"
              class="lesson-stepper-editor__media-card md-stack md-stack-3"
            >
              <header class="flex items-center justify-between">
                <h6 class="text-title-small font-semibold text-on-surface">Imagens</h6>
                <Md3Button type="button" variant="tonal" @click="addGalleryImage(index)">
                  <template #leading>
                    <Plus class="md-icon md-icon--sm" aria-hidden="true" />
                  </template>
                  Adicionar imagem
                </Md3Button>
              </header>
              <div v-if="step.mediaImages.length" class="flex flex-col gap-3">
                <article
                  v-for="(image, imageIndex) in step.mediaImages"
                  :key="image.id"
                  class="rounded-3xl border border-outline bg-surface p-4 md-stack md-stack-2"
                >
                  <label class="flex flex-col gap-2">
                    <span class="md-typescale-label-large text-on-surface">URL</span>
                    <input
                      v-model="image.src"
                      type="text"
                      class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      placeholder="/images/passo-01.png"
                    />
                  </label>
                  <label class="flex flex-col gap-2">
                    <span class="md-typescale-label-large text-on-surface">Texto alternativo</span>
                    <input
                      v-model="image.alt"
                      type="text"
                      class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      placeholder="Descrição da imagem"
                    />
                  </label>
                  <label class="flex flex-col gap-2">
                    <span class="md-typescale-label-large text-on-surface">Legenda</span>
                    <input
                      v-model="image.caption"
                      type="text"
                      class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      placeholder="Legenda exibida abaixo da imagem"
                    />
                  </label>
                  <label class="flex flex-col gap-2">
                    <span class="md-typescale-label-large text-on-surface">Crédito</span>
                    <input
                      v-model="image.credit"
                      type="text"
                      class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      placeholder="Autoria / Fonte"
                    />
                  </label>
                  <label class="flex flex-col gap-2">
                    <span class="md-typescale-label-large text-on-surface">Fazer upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      @change="(event) => uploadGalleryImage(index, imageIndex, event)"
                    />
                  </label>
                  <img
                    v-if="image.src"
                    :src="image.src"
                    alt="Pré-visualização da imagem da galeria"
                    class="lesson-stepper-editor__preview"
                  />
                  <Md3Button
                    v-if="step.mediaImages.length > 1"
                    type="button"
                    variant="text"
                    class="self-start text-error"
                    @click="removeGalleryImage(index, imageIndex)"
                  >
                    <template #leading>
                      <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
                    </template>
                    Remover
                  </Md3Button>
                </article>
              </div>
              <p
                v-else
                class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant"
              >
                Nenhuma imagem cadastrada.
              </p>
            </div>

            <div
              v-else-if="step.mediaType === 'video'"
              class="lesson-stepper-editor__media-card md-stack md-stack-3"
            >
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface"
                  >URL do vídeo (YouTube ou embed)</span
                >
                <input
                  v-model="step.mediaVideoUrl"
                  type="text"
                  class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  placeholder="https://youtu.be/..."
                />
              </label>
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface"
                  >Título acessível do vídeo</span
                >
                <input
                  v-model="step.mediaVideoTitle"
                  type="text"
                  class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  placeholder="Vídeo: Demonstração do fluxo"
                />
              </label>
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">Legenda específica</span>
                <input
                  v-model="step.mediaCaption"
                  type="text"
                  class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  placeholder="Resumo do conteúdo do vídeo"
                />
              </label>
            </div>

            <p v-else class="text-sm text-on-surface-variant">
              Nenhuma mídia selecionada para este passo.
            </p>
          </section>
        </article>
      </div>
      <p v-else class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
        Adicione pelo menos um passo para configurar o componente.
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

type StepperMediaImage = {
  src?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  lightbox?: boolean;
  images?: StepperMediaImage[];
};

type StepperMediaVideo = {
  type?: string;
  src?: string;
  url?: string;
  title?: string;
  caption?: string;
};

type StepperMediaEmbed = {
  type?: string;
  html?: string;
  caption?: string;
};

type StepperMedia = StepperMediaImage | StepperMediaVideo | StepperMediaEmbed;

type StepperStep = {
  title?: string;
  description?: string;
  html?: string;
  code?: string | { code: string; language?: string };
  language?: string;
  caption?: string;
  embed?: string;
  media?: StepperMedia;
};

type StepperBlock = {
  type?: string;
  title?: string;
  summary?: string;
  autoPlay?:
    | boolean
    | number
    | { enabled?: boolean; autoplay?: boolean; start?: boolean; delay?: number };
  autoPlayDelay?: number | string;
  steps?: StepperStep[];
};

type GalleryImageState = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  credit: string;
};

type StepState = {
  id: string;
  title: string;
  description: string;
  html: string;
  code: string;
  language: string;
  caption: string;
  embed: string;
  mediaType: 'none' | 'image' | 'gallery' | 'video';
  mediaLightbox: boolean;
  mediaSrc: string;
  mediaAlt: string;
  mediaCaption: string;
  mediaCredit: string;
  mediaImages: GalleryImageState[];
  mediaVideoUrl: string;
  mediaVideoTitle: string;
};

type StepperState = {
  type: string;
  title: string;
  summary: string;
  autoPlay: boolean;
  autoPlayDelay: string;
  steps: StepState[];
};

const props = defineProps<{ block: StepperBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: StepperBlock): void }>();

const state = reactive<StepperState>({
  type: 'stepper',
  title: '',
  summary: '',
  autoPlay: false,
  autoPlayDelay: '8000',
  steps: [],
});

let syncing = false;

function createId(prefix: string) {
  const cryptoRef =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return `${prefix}-${cryptoRef.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createStepState(step?: StepperStep): StepState {
  const media = step?.media;
  const mediaType = resolveMediaType(media);
  const gallery = resolveGallery(media);

  return {
    id: createId('step'),
    title: typeof step?.title === 'string' ? step.title : '',
    description: typeof step?.description === 'string' ? step.description : '',
    html: typeof step?.html === 'string' ? step.html : '',
    code: resolveCode(step?.code),
    language: resolveLanguage(step?.code, step?.language),
    caption: typeof step?.caption === 'string' ? step.caption : '',
    embed: typeof step?.embed === 'string' ? step.embed : '',
    mediaType,
    mediaLightbox:
      mediaType === 'gallery'
        ? resolveLightbox(media)
        : mediaType === 'image'
          ? resolveLightbox(media)
          : true,
    mediaSrc: mediaType === 'image' ? resolveImageSrc(media) : '',
    mediaAlt: mediaType === 'image' ? resolveImageAlt(media) : '',
    mediaCaption: mediaType === 'image' || mediaType === 'video' ? resolveMediaCaption(media) : '',
    mediaCredit: mediaType === 'image' ? resolveMediaCredit(media) : '',
    mediaImages: gallery,
    mediaVideoUrl: mediaType === 'video' ? resolveVideoUrl(media) : '',
    mediaVideoTitle: mediaType === 'video' ? resolveVideoTitle(media) : '',
  };
}

function resolveMediaType(media?: StepperMedia): StepState['mediaType'] {
  if (!media || typeof media !== 'object') {
    return 'none';
  }
  const type =
    typeof (media as StepperMediaVideo).type === 'string'
      ? (media as StepperMediaVideo).type.toLowerCase()
      : undefined;
  if (type === 'video' || typeof (media as StepperMediaVideo).url === 'string') {
    return 'video';
  }
  if (type === 'embed' || typeof (media as StepperMediaEmbed).html === 'string') {
    return 'none';
  }
  if (
    Array.isArray((media as StepperMediaImage).images) &&
    (media as StepperMediaImage).images!.length
  ) {
    return 'gallery';
  }
  if (typeof (media as StepperMediaImage).src === 'string') {
    return 'image';
  }
  return 'none';
}

function resolveGallery(media?: StepperMedia): GalleryImageState[] {
  if (!media || typeof media !== 'object') {
    return [createGalleryImageState()];
  }
  const images = Array.isArray((media as StepperMediaImage).images)
    ? (media as StepperMediaImage).images
    : [];
  if (!images.length) {
    return [createGalleryImageState()];
  }
  return images.map((image) => ({
    id: createId('gallery'),
    src: typeof image?.src === 'string' ? image.src : '',
    alt: typeof image?.alt === 'string' ? image.alt : '',
    caption: typeof image?.caption === 'string' ? image.caption : '',
    credit: typeof image?.credit === 'string' ? image.credit : '',
  }));
}

function resolveImageSrc(media?: StepperMedia): string {
  if (media && typeof media === 'object' && typeof (media as StepperMediaImage).src === 'string') {
    return (media as StepperMediaImage).src ?? '';
  }
  return '';
}

function resolveImageAlt(media?: StepperMedia): string {
  if (media && typeof media === 'object' && typeof (media as StepperMediaImage).alt === 'string') {
    return (media as StepperMediaImage).alt ?? '';
  }
  return '';
}

function resolveMediaCaption(media?: StepperMedia): string {
  if (
    media &&
    typeof media === 'object' &&
    typeof (media as StepperMediaImage).caption === 'string'
  ) {
    return (media as StepperMediaImage).caption ?? '';
  }
  if (
    media &&
    typeof media === 'object' &&
    typeof (media as StepperMediaVideo).caption === 'string'
  ) {
    return (media as StepperMediaVideo).caption ?? '';
  }
  return '';
}

function resolveMediaCredit(media?: StepperMedia): string {
  if (
    media &&
    typeof media === 'object' &&
    typeof (media as StepperMediaImage).credit === 'string'
  ) {
    return (media as StepperMediaImage).credit ?? '';
  }
  return '';
}

function resolveLightbox(media?: StepperMedia): boolean {
  if (!media || typeof media !== 'object') {
    return true;
  }
  const flag = (media as StepperMediaImage).lightbox;
  if (typeof flag === 'boolean') {
    return flag;
  }
  return true;
}

function resolveVideoUrl(media?: StepperMedia): string {
  if (media && typeof media === 'object') {
    const video = media as StepperMediaVideo;
    if (typeof video.url === 'string') {
      return video.url;
    }
    if (typeof video.src === 'string') {
      return video.src;
    }
  }
  return '';
}

function resolveVideoTitle(media?: StepperMedia): string {
  if (
    media &&
    typeof media === 'object' &&
    typeof (media as StepperMediaVideo).title === 'string'
  ) {
    return (media as StepperMediaVideo).title ?? '';
  }
  return '';
}

function resolveCode(code?: StepperStep['code']): string {
  if (typeof code === 'string') {
    return code;
  }
  if (code && typeof code === 'object' && typeof code.code === 'string') {
    return code.code;
  }
  return '';
}

function resolveLanguage(code?: StepperStep['code'], language?: string): string {
  if (typeof language === 'string') {
    return language;
  }
  if (code && typeof code === 'object' && typeof code.language === 'string') {
    return code.language;
  }
  return '';
}

function createGalleryImageState(): GalleryImageState {
  return {
    id: createId('gallery'),
    src: '',
    alt: '',
    caption: '',
    credit: '',
  };
}

function syncStateFromBlock(block?: StepperBlock) {
  state.type =
    block?.type === 'stepper' || typeof block?.type === 'undefined'
      ? 'stepper'
      : String(block?.type ?? 'stepper');
  state.title = typeof block?.title === 'string' ? block.title : '';
  state.summary = typeof block?.summary === 'string' ? block.summary : '';

  const autoPlayValue = block?.autoPlay;
  state.autoPlay = resolveAutoPlayFlag(autoPlayValue);
  const delay = resolveAutoPlayDelay(block?.autoPlayDelay, autoPlayValue);
  state.autoPlayDelay = delay ? String(delay) : '8000';

  const steps = Array.isArray(block?.steps) && block?.steps.length ? block.steps : [undefined];
  state.steps = steps.map((step) => createStepState(step));
}

function resolveAutoPlayFlag(value: StepperBlock['autoPlay']): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value >= 0;
  }
  if (value && typeof value === 'object') {
    if (typeof value.enabled === 'boolean') {
      return value.enabled;
    }
    if (typeof value.autoplay === 'boolean') {
      return value.autoplay;
    }
    if (typeof value.start === 'boolean') {
      return value.start;
    }
    if (typeof value.delay === 'number') {
      return true;
    }
  }
  return false;
}

function resolveAutoPlayDelay(
  delay?: StepperBlock['autoPlayDelay'],
  config?: StepperBlock['autoPlay']
): number | undefined {
  const parsed = Number(delay);
  if (Number.isFinite(parsed) && parsed >= 2000) {
    return Math.floor(parsed);
  }
  if (config && typeof config === 'object') {
    const nested = Number(config.delay);
    if (Number.isFinite(nested) && nested >= 2000) {
      return Math.floor(nested);
    }
  }
  return undefined;
}

function serialize(): StepperBlock {
  const steps = state.steps.map((step) => serializeStep(step));
  const autoPlayDelay = Number(state.autoPlayDelay);
  const block: StepperBlock = {
    type: 'stepper',
    title: state.title,
    summary: state.summary,
    steps,
  };

  if (state.autoPlay) {
    block.autoPlay = true;
    if (Number.isFinite(autoPlayDelay) && autoPlayDelay >= 2000) {
      block.autoPlayDelay = Math.floor(autoPlayDelay);
    }
  } else {
    block.autoPlay = false;
  }

  return block;
}

function serializeStep(step: StepState): StepperStep {
  const payload: StepperStep = {
    title: step.title,
    description: step.description,
    html: step.html,
    caption: step.caption,
    embed: step.embed,
  };

  if (step.code.trim().length) {
    payload.code = step.code;
  }

  if (step.language.trim().length) {
    payload.language = step.language;
  }

  if (step.mediaType === 'image' && step.mediaSrc.trim().length) {
    const media: StepperMediaImage = {
      src: step.mediaSrc,
      alt: step.mediaAlt,
    };
    if (step.mediaCaption.trim().length) {
      media.caption = step.mediaCaption;
    }
    if (step.mediaCredit.trim().length) {
      media.credit = step.mediaCredit;
    }
    if (!step.mediaLightbox) {
      media.lightbox = false;
    }
    payload.media = media;
  } else if (step.mediaType === 'gallery') {
    const images = step.mediaImages
      .map((image) => ({
        src: image.src,
        alt: image.alt,
        caption: image.caption,
        credit: image.credit,
      }))
      .filter((image) => typeof image.src === 'string' && image.src.trim().length);
    if (images.length) {
      const gallery: StepperMediaImage = {
        images,
      };
      if (!step.mediaLightbox) {
        gallery.lightbox = false;
      }
      payload.media = gallery;
    }
  } else if (step.mediaType === 'video' && step.mediaVideoUrl.trim().length) {
    const video: StepperMediaVideo = {
      type: 'video',
      url: step.mediaVideoUrl,
    };
    if (step.mediaVideoTitle.trim().length) {
      video.title = step.mediaVideoTitle;
    }
    if (step.mediaCaption.trim().length) {
      video.caption = step.mediaCaption;
    }
    payload.media = video;
  }

  return payload;
}

watch(
  () => props.block,
  (block) => {
    syncing = true;
    syncStateFromBlock(block);
    syncing = false;
  },
  { immediate: true, deep: true }
);

watch(
  state,
  () => {
    if (syncing) return;
    emit('update:block', serialize());
  },
  { deep: true }
);

function addStep() {
  state.steps = [...state.steps, createStepState()];
}

function removeStep(index: number) {
  if (state.steps.length <= 1) return;
  state.steps = state.steps.filter((_, currentIndex) => currentIndex !== index);
}

function addGalleryImage(stepIndex: number) {
  const step = state.steps[stepIndex];
  if (!step) return;
  step.mediaImages = [...step.mediaImages, createGalleryImageState()];
}

function removeGalleryImage(stepIndex: number, imageIndex: number) {
  const step = state.steps[stepIndex];
  if (!step) return;
  if (step.mediaImages.length <= 1) return;
  step.mediaImages = step.mediaImages.filter((_, currentIndex) => currentIndex !== imageIndex);
}

async function uploadStepImage(stepIndex: number, event: Event) {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) {
    return;
  }
  const dataUrl = await readFileAsDataUrl(file);
  const step = state.steps[stepIndex];
  if (step) {
    step.mediaSrc = dataUrl;
  }
  if (input) {
    input.value = '';
  }
}

async function uploadGalleryImage(stepIndex: number, imageIndex: number, event: Event) {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) {
    return;
  }
  const dataUrl = await readFileAsDataUrl(file);
  const step = state.steps[stepIndex];
  if (step) {
    const image = step.mediaImages[imageIndex];
    if (image) {
      image.src = dataUrl;
    }
  }
  if (input) {
    input.value = '';
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao ler arquivo.'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
}
</script>

<style scoped>
.lesson-stepper-editor__steps {
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface-container-high);
  padding: var(--md-sys-spacing-4);
}

.lesson-stepper-editor__step {
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  padding: var(--md-sys-spacing-4);
}

.lesson-stepper-editor__media {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: var(--md-sys-spacing-3);
}

.lesson-stepper-editor__media-card {
  border-radius: var(--md-sys-border-radius-large);
  border: 1px dashed var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface-container-highest);
  padding: var(--md-sys-spacing-3);
}

.lesson-stepper-editor__preview {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: var(--md-sys-border-radius-large);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.lesson-stepper-editor input[type='file'] {
  font-size: 0.875rem;
}
</style>

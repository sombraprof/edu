<template>
  <section class="flex flex-col gap-4">
    <header>
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Bloco de conteúdo</h3>
      <p class="text-sm text-on-surface-variant">
        Atualize o texto principal da aula. Parágrafos são editáveis diretamente; estruturas
        avançadas podem ser ajustadas via JSON.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Título do bloco</span>
        <input
          v-model="block.title"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </label>
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Eyebrow</span>
        <input
          v-model="block.eyebrow"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Opcional"
        />
      </label>
      <label class="md:col-span-2 flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Texto de abertura</span>
        <textarea
          v-model="block.lead"
          rows="3"
          class="min-h-[3.5rem] rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="Opcional"
        ></textarea>
      </label>
    </div>

    <section class="flex flex-col gap-3">
      <header class="flex items-center justify-between">
        <h4 class="md-typescale-title-small font-semibold text-on-surface">Conteúdo</h4>
        <div class="flex gap-2">
          <Md3Button type="button" variant="tonal" @click="addParagraph">
            <template #leading>
              <Plus class="md-icon md-icon--sm" aria-hidden="true" />
            </template>
            Parágrafo
          </Md3Button>
        </div>
      </header>
      <div v-if="content.length" class="flex flex-col gap-4">
        <article
          v-for="(item, index) in content"
          :key="index"
          class="rounded-3xl border border-outline bg-surface-container-high p-4"
        >
          <header class="flex items-center justify-between">
            <h5 class="font-semibold text-on-surface">{{ describeItem(item) }}</h5>
            <Md3Button type="button" variant="text" class="text-error" @click="removeItem(index)">
              <template #leading>
                <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Remover
            </Md3Button>
          </header>
          <div class="mt-3 flex flex-col gap-3">
            <template v-if="isParagraph(item)">
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">Texto</span>
                <textarea
                  v-model="item.text"
                  rows="4"
                  class="min-h-[3.5rem] rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                ></textarea>
              </label>
            </template>
            <template v-else>
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">Conteúdo avançado</span>
                <textarea
                  :value="getDraft(index)"
                  rows="6"
                  class="min-h-[3.5rem] rounded-3xl border border-outline bg-surface p-3 font-mono text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  @input="updateDraft(index, $event)"
                  @blur="commitDraft(index)"
                ></textarea>
              </label>
              <p v-if="complexErrors[index]" class="text-xs text-error">
                {{ complexErrors[index] }}
              </p>
            </template>
          </div>
        </article>
      </div>
      <p v-else class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
        Nenhum conteúdo cadastrado. Adicione parágrafos ou edite via JSON bruto.
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { reactive, toRef } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

interface ParagraphItem {
  type: 'paragraph';
  text?: string;
  [key: string]: unknown;
}

interface ContentBlock {
  title?: string;
  eyebrow?: string;
  lead?: string;
  content?: Array<ParagraphItem | Record<string, unknown>>;
}

const props = defineProps<{ block: ContentBlock }>();
const blockRef = toRef(props, 'block');

if (!Array.isArray(blockRef.value.content)) {
  blockRef.value.content = [];
}

const block = blockRef.value;
const content = block.content!;
const complexDrafts = reactive<Record<number, string>>({});
const complexErrors = reactive<Record<number, string>>({});

function isParagraph(item: ParagraphItem | Record<string, unknown>): item is ParagraphItem {
  return (
    Boolean(item) &&
    typeof item === 'object' &&
    'type' in item &&
    (item as ParagraphItem).type === 'paragraph'
  );
}

function describeItem(item: ParagraphItem | Record<string, unknown>) {
  if (isParagraph(item)) {
    return 'Parágrafo';
  }
  const type =
    typeof item === 'object' && item && 'type' in item
      ? String((item as any).type)
      : 'Bloco personalizado';
  return type ? `Bloco ${type}` : 'Bloco personalizado';
}

function addParagraph() {
  content.push({ type: 'paragraph', text: '' });
}

function removeItem(index: number) {
  content.splice(index, 1);
  delete complexDrafts[index];
  delete complexErrors[index];
}

function getDraft(index: number) {
  if (!(index in complexDrafts)) {
    const item = content[index];
    complexDrafts[index] = JSON.stringify(item, null, 2);
  }
  return complexDrafts[index];
}

function updateDraft(index: number, event: Event) {
  const value = (event.target as HTMLTextAreaElement).value;
  complexDrafts[index] = value;
}

function commitDraft(index: number) {
  try {
    const parsed = JSON.parse(complexDrafts[index]);
    content.splice(index, 1, parsed);
    complexErrors[index] = '';
  } catch (error) {
    complexErrors[index] = 'JSON inválido. Ajuste a estrutura e tente novamente.';
  }
}
</script>

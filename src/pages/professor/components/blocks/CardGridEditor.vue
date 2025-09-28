<template>
  <section class="flex flex-col gap-4">
    <header>
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Grade de cartões</h3>
      <p class="text-sm text-on-surface-variant">
        Edite o título do bloco e os cartões apresentados aos estudantes.
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
    </div>

    <section class="flex flex-col gap-3">
      <header class="flex items-center justify-between">
        <h4 class="md-typescale-title-small font-semibold text-on-surface">Cartões</h4>
        <Md3Button type="button" variant="tonal" @click="addCard">
          <template #leading>
            <Plus class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Adicionar cartão
        </Md3Button>
      </header>
      <div v-if="cards.length" class="flex flex-col gap-4">
        <article
          v-for="(card, index) in cards"
          :key="index"
          class="rounded-3xl border border-outline bg-surface-container-high p-4"
        >
          <header class="flex items-center justify-between">
            <h5 class="font-semibold text-on-surface">Cartão {{ index + 1 }}</h5>
            <Md3Button type="button" variant="text" class="text-error" @click="removeCard(index)">
              <template #leading>
                <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              Remover
            </Md3Button>
          </header>
          <div class="mt-3 grid gap-3 md:grid-cols-3">
            <label class="flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Eyebrow</span>
              <input
                v-model="card.eyebrow"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Opcional"
              />
            </label>
            <label class="md:col-span-2 flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Título</span>
              <input
                v-model="card.title"
                type="text"
                class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </label>
            <label class="md:col-span-3 flex flex-col gap-2">
              <span class="md-typescale-label-large text-on-surface">Conteúdo</span>
              <textarea
                v-model="card.content"
                rows="3"
                class="min-h-[3.5rem] rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              ></textarea>
            </label>
          </div>
        </article>
      </div>
      <p v-else class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
        Nenhum cartão configurado. Crie itens para compor a grade.
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

interface CardGridItem {
  eyebrow?: string;
  title?: string;
  content?: string;
}

interface CardGridBlock {
  title?: string;
  eyebrow?: string;
  cards?: CardGridItem[];
}

const props = defineProps<{ block: CardGridBlock }>();
const blockRef = toRef(props, 'block');

if (!Array.isArray(blockRef.value.cards)) {
  blockRef.value.cards = [];
}

const block = blockRef.value;
const cards = block.cards!;

function addCard() {
  cards.push({ title: '', content: '' });
}

function removeCard(index: number) {
  cards.splice(index, 1);
}
</script>

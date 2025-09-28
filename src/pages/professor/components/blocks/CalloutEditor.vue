<template>
  <section class="flex flex-col gap-4">
    <header>
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Callout</h3>
      <p class="text-sm text-on-surface-variant">
        Ajuste as mensagens destacadas apresentadas durante a aula.
      </p>
    </header>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-2">
        <span class="md-typescale-label-large text-on-surface">Variante</span>
        <input
          v-model="block.variant"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          placeholder="info, warning, good-practice..."
        />
      </label>
      <label class="flex flex-col gap-2 md:col-span-2">
        <span class="md-typescale-label-large text-on-surface">Título</span>
        <input
          v-model="block.title"
          type="text"
          class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </label>
      <label class="flex flex-col gap-2 md:col-span-2">
        <span class="md-typescale-label-large text-on-surface">Conteúdo</span>
        <textarea
          v-model="block.content"
          rows="4"
          class="min-h-[3.5rem] rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        ></textarea>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toRef } from 'vue';

interface CalloutBlock {
  variant?: string;
  title?: string;
  content?: string;
}

const props = defineProps<{ block: CalloutBlock }>();
const block = toRef(props, 'block');
</script>

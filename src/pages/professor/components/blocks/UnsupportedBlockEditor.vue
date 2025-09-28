<template>
  <section class="flex flex-col gap-3">
    <header>
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Bloco não suportado</h3>
      <p class="text-sm text-on-surface-variant">
        Este tipo de bloco ainda não possui edição visual. Ajuste o JSON bruto abaixo conforme
        necessário.
      </p>
    </header>
    <textarea
      :value="formatted"
      rows="12"
      class="rounded-3xl border border-outline bg-surface-container-high p-4 font-mono text-sm text-on-surface"
      readonly
    ></textarea>
  </section>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';

const props = defineProps<{ block: unknown }>();
const block = toRef(props, 'block');

const formatted = computed(() => JSON.stringify(block.value, null, 2));
</script>

<template>
  <section class="flex flex-col gap-3">
    <header>
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">Editor JSON do bloco</h3>
      <p class="text-sm text-on-surface-variant">
        Este bloco não possui editor visual dedicado. Ajuste o JSON bruto abaixo; alterações válidas
        são aplicadas imediatamente.
      </p>
    </header>
    <label class="flex flex-col gap-2">
      <span class="md-typescale-label-large text-on-surface">Conteúdo bruto</span>
      <textarea
        v-model="draft"
        rows="12"
        class="rounded-3xl border border-outline bg-surface-container-high p-4 font-mono text-sm text-on-surface"
        :aria-invalid="Boolean(errorMessage)"
        spellcheck="false"
      ></textarea>
    </label>
    <p v-if="errorMessage" class="text-xs text-error">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from 'vue';

const props = defineProps<{ block: Record<string, unknown> | null | undefined }>();
const emit = defineEmits<{
  (event: 'update:block', value: Record<string, unknown>): void;
}>();

const blockRef = toRef(props, 'block');

const draft = ref('');
const errorMessage = ref('');
let syncingFromBlock = false;

function formatBlock(value: unknown) {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch (error) {
    return '';
  }
}

watch(
  blockRef,
  (value) => {
    syncingFromBlock = true;
    draft.value = formatBlock(value);
    errorMessage.value = '';
    syncingFromBlock = false;
  },
  { immediate: true, deep: true }
);

watch(draft, (value) => {
  if (syncingFromBlock) return;

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('O bloco precisa ser um objeto JSON.');
    }

    emit('update:block', parsed as Record<string, unknown>);
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value = 'JSON inválido. Ajuste a estrutura e tente novamente.';
  }
});
</script>

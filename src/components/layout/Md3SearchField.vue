<template>
  <form class="md3-search-field" role="search" :aria-label="ariaLabel" @submit.prevent="submit">
    <label v-if="label" class="md3-search-field__label" :for="inputId">{{ label }}</label>
    <div class="md3-search-field__surface">
      <span class="md3-search-field__icon" aria-hidden="true">
        <Search class="md-icon md-icon--sm" />
      </span>
      <input
        :id="inputId"
        ref="inputRef"
        class="md3-search-field__input"
        type="search"
        :placeholder="placeholder"
        :value="modelValue"
        :aria-label="!label ? ariaLabel : undefined"
        @input="updateValue"
        @keydown.escape="handleClear"
      />
      <div class="md3-search-field__actions">
        <button
          v-if="modelValue"
          type="button"
          class="md3-search-field__button"
          @click="handleClear"
        >
          <X class="md-icon md-icon--sm" aria-hidden="true" />
          <span class="sr-only">Limpar busca</span>
        </button>
        <button type="submit" class="md3-search-field__button">
          <ArrowRight class="md-icon md-icon--sm" aria-hidden="true" />
          <span class="sr-only">Enviar busca</span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, ArrowRight, X } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    label?: string;
    ariaLabel?: string;
  }>(),
  {
    modelValue: '',
    placeholder: 'Buscar',
    label: '',
    ariaLabel: 'Buscar conteúdo',
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'submit', value: string): void;
  (event: 'clear'): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const inputId = `search-field-${Math.random().toString(36).slice(2, 8)}`;

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function handleClear() {
  emit('update:modelValue', '');
  emit('clear');
  if (inputRef.value) {
    inputRef.value.focus();
  }
}

function submit() {
  emit('submit', props.modelValue ?? '');
}
</script>

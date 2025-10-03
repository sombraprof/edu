<template>
  <article class="data-entry card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <form class="md-stack md-stack-3" @submit.prevent="handleSubmit">
      <div v-for="field in data.fields" :key="field.id" class="data-entry__field">
        <label class="text-label-medium text-on-surface" :for="field.id">
          {{ field.label }}
          <span v-if="field.required" class="text-error">*</span>
        </label>
        <component
          :is="resolveFieldComponent(field)"
          v-model="form[field.id]"
          :id="field.id"
          class="data-entry__input"
          :type="field.type || 'text'"
          :placeholder="field.placeholder"
          :options="field.options"
        />
        <p v-if="errors[field.id]" class="data-entry__error">{{ errors[field.id] }}</p>
      </div>

      <Md3Button type="submit" variant="filled">{{ data.submitLabel || 'Registrar' }}</Md3Button>
    </form>

    <p v-if="submitted" class="data-entry__success">Dados simulados registrados com sucesso.</p>
  </article>
</template>

<script setup lang="ts">
import { PropType, defineComponent, h, reactive, ref } from 'vue';
import Md3Button from '@/components/Md3Button.vue';

export type DataEntryFieldType = 'text' | 'number' | 'email' | 'date' | 'select';

export interface DataEntryField {
  id: string;
  label: string;
  type?: DataEntryFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface DataEntryFormBlockData {
  title?: string;
  description?: string;
  fields: DataEntryField[];
  submitLabel?: string;
}

const props = defineProps<{ data: DataEntryFormBlockData }>();

const form = reactive<Record<string, string>>({});
const errors = reactive<Record<string, string>>({});
const submitted = ref(false);

props.data.fields.forEach((field) => {
  form[field.id] = '';
});

function resolveFieldComponent(field: DataEntryField) {
  if (field.type === 'select') {
    return SelectField;
  }
  return 'input';
}

function validateField(field: DataEntryField): boolean {
  if (!field.required) {
    return true;
  }
  const value = form[field.id];
  if (!value || value.trim().length === 0) {
    errors[field.id] = 'Campo obrigatório.';
    return false;
  }
  errors[field.id] = '';
  return true;
}

function handleSubmit() {
  submitted.value = false;
  let isValid = true;
  props.data.fields.forEach((field) => {
    const valid = validateField(field);
    if (!valid) {
      isValid = false;
    }
  });

  if (isValid) {
    submitted.value = true;
  }
}

const SelectField = defineComponent({
  name: 'DataEntrySelectField',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array as PropType<string[]>, default: () => [] },
    id: { type: String, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    function onChange(event: Event) {
      emit('update:modelValue', (event.target as HTMLSelectElement).value);
    }

    return () =>
      h(
        'select',
        {
          id: props.id,
          class: 'data-entry__input',
          value: props.modelValue,
          onChange,
        },
        [
          h('option', { value: '', disabled: true }, 'Selecione uma opção'),
          ...props.options.map((option) => h('option', { value: option }, option)),
        ]
      );
  },
});
</script>

<style scoped>
.data-entry {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.data-entry__field {
  display: grid;
  gap: 0.5rem;
}

.data-entry__input {
  border-radius: 1rem;
  border: 1px solid var(--md-sys-color-outline);
  padding: 0.75rem 1rem;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
}

.data-entry__error {
  color: var(--md-sys-color-error);
  font-size: 0.85rem;
}

.data-entry__success {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}
</style>

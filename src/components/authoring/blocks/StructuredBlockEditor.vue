<template>
  <section class="md-stack md-stack-4">
    <header class="md-stack md-stack-1">
      <h3 class="md-typescale-title-medium font-semibold text-on-surface">{{ schema.title }}</h3>
      <p v-if="schema.description" class="text-sm text-on-surface-variant">
        {{ schema.description }}
      </p>
    </header>

    <div class="md-stack md-stack-3">
      <template v-for="field in schema.fields" :key="field.key">
        <label v-if="field.type === 'text' || field.type === 'url'" class="flex flex-col gap-2">
          <span class="md-typescale-label-large text-on-surface">
            {{ field.label }}<span v-if="field.required" class="text-error">*</span>
          </span>
          <input
            v-model="state[field.key]"
            :type="field.type === 'url' ? 'url' : 'text'"
            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :placeholder="field.placeholder"
            :autofocus="field.autofocus === true"
          />
          <p v-if="field.help" class="text-xs text-on-surface-variant">{{ field.help }}</p>
        </label>

        <label
          v-else-if="field.type === 'textarea' || field.type === 'code'"
          class="flex flex-col gap-2"
        >
          <span class="md-typescale-label-large text-on-surface">
            {{ field.label }}<span v-if="field.required" class="text-error">*</span>
          </span>
          <textarea
            v-model="state[field.key]"
            :rows="field.rows ?? (field.type === 'code' ? 8 : 4)"
            class="rounded-3xl border border-outline bg-surface p-3 font-inherit text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :placeholder="field.placeholder"
          ></textarea>
          <p v-if="field.help" class="text-xs text-on-surface-variant">{{ field.help }}</p>
        </label>

        <label v-else-if="field.type === 'select'" class="flex flex-col gap-2">
          <span class="md-typescale-label-large text-on-surface">
            {{ field.label }}<span v-if="field.required" class="text-error">*</span>
          </span>
          <select
            v-model="state[field.key]"
            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <option value="">{{ field.placeholder ?? 'Selecione uma opção' }}</option>
            <option v-for="option in field.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <p v-if="field.help" class="text-xs text-on-surface-variant">{{ field.help }}</p>
        </label>

        <section v-else-if="field.type === 'string-list'" class="flex flex-col gap-3">
          <header class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="md-typescale-label-large text-on-surface">{{ field.label }}</span>
              <p v-if="field.help" class="text-xs text-on-surface-variant">{{ field.help }}</p>
            </div>
            <Md3Button
              type="button"
              variant="tonal"
              class="self-start"
              @click="addStringItem(field)"
            >
              <template #leading>
                <Plus class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              {{ field.addLabel ?? 'Adicionar item' }}
            </Md3Button>
          </header>
          <div v-if="getStringItems(field).length" class="flex flex-col gap-3">
            <div
              v-for="(item, index) in getStringItems(field)"
              :key="item.__key"
              class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-2"
            >
              <label class="flex flex-col gap-2">
                <span class="md-typescale-label-large text-on-surface">
                  {{ field.itemLabel }} {{ index + 1 }}
                </span>
                <input
                  v-model="item.value"
                  type="text"
                  class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  :placeholder="field.placeholder"
                />
              </label>
              <Md3Button
                v-if="getStringItems(field).length > (field.minItems ?? 1)"
                type="button"
                variant="text"
                class="self-start text-error"
                @click="removeStringItem(field, index)"
              >
                <template #leading>
                  <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
                </template>
                Remover
              </Md3Button>
            </div>
          </div>
          <p
            v-else
            class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant"
          >
            Nenhum item configurado.
          </p>
        </section>

        <section v-else-if="field.type === 'object-list'" class="flex flex-col gap-3">
          <header class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="md-typescale-label-large text-on-surface">{{ field.label }}</span>
              <p v-if="field.help" class="text-xs text-on-surface-variant">{{ field.help }}</p>
            </div>
            <Md3Button
              type="button"
              variant="tonal"
              class="self-start"
              @click="addObjectItem(field)"
            >
              <template #leading>
                <Plus class="md-icon md-icon--sm" aria-hidden="true" />
              </template>
              {{ field.addLabel ?? 'Adicionar item' }}
            </Md3Button>
          </header>
          <div v-if="getObjectItems(field).length" class="flex flex-col gap-4">
            <article
              v-for="(item, index) in getObjectItems(field)"
              :key="item.__key"
              class="rounded-3xl border border-outline bg-surface-container-high p-4 md-stack md-stack-3"
            >
              <header class="flex items-center justify-between">
                <h4 class="font-semibold text-on-surface">{{ field.itemLabel }} {{ index + 1 }}</h4>
                <Md3Button
                  v-if="getObjectItems(field).length > (field.minItems ?? 1)"
                  type="button"
                  variant="text"
                  class="text-error"
                  @click="removeObjectItem(field, index)"
                >
                  <template #leading>
                    <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
                  </template>
                  Remover
                </Md3Button>
              </header>
              <div class="md-stack md-stack-3">
                <template v-for="child in field.fields" :key="child.key">
                  <label
                    v-if="child.type === 'text' || child.type === 'url'"
                    class="flex flex-col gap-2"
                  >
                    <span class="md-typescale-label-large text-on-surface">{{ child.label }}</span>
                    <input
                      v-model="item[child.key]"
                      :type="child.type === 'url' ? 'url' : 'text'"
                      class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      :placeholder="child.placeholder"
                    />
                    <p v-if="child.help" class="text-xs text-on-surface-variant">
                      {{ child.help }}
                    </p>
                  </label>
                  <label
                    v-else-if="child.type === 'textarea' || child.type === 'code'"
                    class="flex flex-col gap-2"
                  >
                    <span class="md-typescale-label-large text-on-surface">{{ child.label }}</span>
                    <textarea
                      v-model="item[child.key]"
                      :rows="child.rows ?? (child.type === 'code' ? 8 : 4)"
                      class="rounded-3xl border border-outline bg-surface p-3 font-inherit text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      :placeholder="child.placeholder"
                    ></textarea>
                    <p v-if="child.help" class="text-xs text-on-surface-variant">
                      {{ child.help }}
                    </p>
                  </label>
                  <div v-else-if="child.type === 'string-list'" class="flex flex-col gap-3">
                    <header class="flex items-center justify-between">
                      <span class="md-typescale-label-large text-on-surface">{{
                        child.label
                      }}</span>
                      <Md3Button
                        type="button"
                        variant="tonal"
                        class="self-start"
                        @click="addNestedStringItem(field, child, index)"
                      >
                        <template #leading>
                          <Plus class="md-icon md-icon--sm" aria-hidden="true" />
                        </template>
                        {{ child.addLabel ?? 'Adicionar item' }}
                      </Md3Button>
                    </header>
                    <div
                      v-if="getNestedStringItems(item, child).length"
                      class="flex flex-col gap-3"
                    >
                      <div
                        v-for="(nested, nestedIndex) in getNestedStringItems(item, child)"
                        :key="nested.__key"
                        class="rounded-3xl border border-outline bg-surface p-4 md-stack md-stack-2"
                      >
                        <label class="flex flex-col gap-2">
                          <span class="md-typescale-label-large text-on-surface">
                            {{ child.itemLabel }} {{ nestedIndex + 1 }}
                          </span>
                          <input
                            v-model="nested.value"
                            type="text"
                            class="rounded-3xl border border-outline bg-surface p-3 text-on-surface shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            :placeholder="child.placeholder"
                          />
                        </label>
                        <Md3Button
                          v-if="getNestedStringItems(item, child).length > (child.minItems ?? 1)"
                          type="button"
                          variant="text"
                          class="self-start text-error"
                          @click="removeNestedStringItem(field, child, index, nestedIndex)"
                        >
                          <template #leading>
                            <Trash2 class="md-icon md-icon--sm" aria-hidden="true" />
                          </template>
                          Remover
                        </Md3Button>
                      </div>
                    </div>
                    <p
                      v-else
                      class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant"
                    >
                      Nenhum item configurado.
                    </p>
                  </div>
                </template>
              </div>
            </article>
          </div>
          <p
            v-else
            class="rounded-3xl bg-surface-container-high p-4 text-sm text-on-surface-variant"
          >
            Nenhum item configurado.
          </p>
        </section>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Md3Button from '@/components/Md3Button.vue';

interface BaseFieldSchema {
  key: string;
  label: string;
  help?: string;
  required?: boolean;
  placeholder?: string;
  autofocus?: boolean;
}

interface TextFieldSchema extends BaseFieldSchema {
  type: 'text' | 'url';
}

interface TextareaFieldSchema extends BaseFieldSchema {
  type: 'textarea' | 'code';
  rows?: number;
}

interface SelectFieldSchema extends BaseFieldSchema {
  type: 'select';
  options: Array<{ value: string; label: string }>;
}

interface StringListFieldSchema extends BaseFieldSchema {
  type: 'string-list';
  itemLabel: string;
  addLabel?: string;
  minItems?: number;
}

interface ObjectListFieldSchema extends BaseFieldSchema {
  type: 'object-list';
  itemLabel: string;
  addLabel?: string;
  minItems?: number;
  fields: Array<TextFieldSchema | TextareaFieldSchema | SelectFieldSchema | StringListFieldSchema>;
}

export type FieldSchema =
  | TextFieldSchema
  | TextareaFieldSchema
  | SelectFieldSchema
  | StringListFieldSchema
  | ObjectListFieldSchema;

export interface BlockSchema {
  type: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
}

type StringListItem = { __key: string; value: string };
type ObjectListItem = Record<string, unknown> & { __key: string };

const props = defineProps<{ block: Record<string, unknown>; schema: BlockSchema }>();
const emit = defineEmits<{ (event: 'update:block', value: Record<string, unknown>): void }>();

const state = reactive<Record<string, any>>({ type: props.schema.type });
let syncing = false;

function createKey() {
  const globalCrypto =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return globalCrypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

function toStringList(
  value: unknown,
  minItems = 1,
  previous: StringListItem[] = []
): StringListItem[] {
  const raw = Array.isArray(value) ? value : [];
  const list = raw.map((entry, index) => ({
    __key: previous[index]?.__key ?? createKey(),
    value: typeof entry === 'string' ? entry : '',
  }));
  if (!list.length) {
    return Array.from({ length: Math.max(1, minItems) }, (_, index) => ({
      __key: previous[index]?.__key ?? createKey(),
      value: '',
    }));
  }
  return list;
}

function createObjectItem(field: ObjectListFieldSchema): ObjectListItem {
  const item: ObjectListItem = { __key: createKey() };
  for (const child of field.fields) {
    if (child.type === 'string-list') {
      item[child.key] = toStringList([], child.minItems);
    } else {
      item[child.key] = '';
    }
  }
  return item;
}

function toObjectList(
  field: ObjectListFieldSchema,
  value: unknown,
  previous: ObjectListItem[] = []
): ObjectListItem[] {
  const raw = Array.isArray(value) ? value : [];
  const list = raw.map((entry, index) => {
    const previousItem = previous[index];
    const item: ObjectListItem = { __key: previousItem?.__key ?? createKey() };
    for (const child of field.fields) {
      const rawValue = (entry as Record<string, unknown> | undefined)?.[child.key];
      if (child.type === 'string-list') {
        const prevList = (previousItem?.[child.key] as StringListItem[]) ?? [];
        item[child.key] = toStringList(rawValue, child.minItems, prevList);
      } else {
        item[child.key] = typeof rawValue === 'string' ? rawValue : '';
      }
    }
    return item;
  });
  if (!list.length) {
    const minItems = Math.max(1, field.minItems ?? 1);
    return Array.from({ length: minItems }, (_, index) => {
      const previousItem = previous[index];
      if (previousItem) {
        return previousItem;
      }
      return createObjectItem(field);
    });
  }
  return list;
}

function syncStateFromBlock(block: Record<string, unknown> | null | undefined) {
  state.type = typeof block?.type === 'string' ? block.type : props.schema.type;
  for (const field of props.schema.fields) {
    const value = block?.[field.key];
    if (
      field.type === 'text' ||
      field.type === 'textarea' ||
      field.type === 'code' ||
      field.type === 'url'
    ) {
      state[field.key] = typeof value === 'string' ? value : '';
      continue;
    }
    if (field.type === 'select') {
      state[field.key] = typeof value === 'string' ? value : '';
      continue;
    }
    if (field.type === 'string-list') {
      const previous = (state[field.key] as StringListItem[]) ?? [];
      state[field.key] = toStringList(value, field.minItems, previous);
      continue;
    }
    if (field.type === 'object-list') {
      const previous = (state[field.key] as ObjectListItem[]) ?? [];
      state[field.key] = toObjectList(field, value, previous);
    }
  }
}

watch(
  () => props.block,
  (value) => {
    syncing = true;
    syncStateFromBlock(value as Record<string, unknown> | undefined);
    syncing = false;
  },
  { immediate: true, deep: true }
);

function serialize(): Record<string, unknown> {
  const payload: Record<string, unknown> = { type: state.type ?? props.schema.type };
  for (const field of props.schema.fields) {
    const value = state[field.key];
    if (
      field.type === 'text' ||
      field.type === 'textarea' ||
      field.type === 'code' ||
      field.type === 'select' ||
      field.type === 'url'
    ) {
      payload[field.key] = typeof value === 'string' ? value : '';
      continue;
    }
    if (field.type === 'string-list') {
      const list = Array.isArray(value)
        ? (value as StringListItem[]).map((entry) => entry.value ?? '')
        : [];
      payload[field.key] = list;
      continue;
    }
    if (field.type === 'object-list') {
      const list = Array.isArray(value)
        ? (value as ObjectListItem[]).map((item) => {
            const result: Record<string, unknown> = {};
            for (const child of field.fields) {
              const raw = item[child.key];
              if (child.type === 'string-list') {
                result[child.key] = Array.isArray(raw)
                  ? (raw as StringListItem[]).map((entry) => entry.value ?? '')
                  : [];
              } else {
                result[child.key] = typeof raw === 'string' ? raw : '';
              }
            }
            return result;
          })
        : [];
      payload[field.key] = list;
    }
  }
  return payload;
}

watch(
  state,
  () => {
    if (syncing) return;
    emit('update:block', serialize());
  },
  { deep: true }
);

function getStringItems(field: StringListFieldSchema): StringListItem[] {
  const list = state[field.key] as StringListItem[] | undefined;
  return Array.isArray(list) ? list : [];
}

function addStringItem(field: StringListFieldSchema) {
  const list = getStringItems(field);
  state[field.key] = [...list, { __key: createKey(), value: '' }];
}

function removeStringItem(field: StringListFieldSchema, index: number) {
  const list = getStringItems(field);
  const min = Math.max(1, field.minItems ?? 1);
  if (list.length <= min) return;
  state[field.key] = list.filter((_, currentIndex) => currentIndex !== index);
}

function getObjectItems(field: ObjectListFieldSchema): ObjectListItem[] {
  const list = state[field.key] as ObjectListItem[] | undefined;
  return Array.isArray(list) ? list : [];
}

function addObjectItem(field: ObjectListFieldSchema) {
  const list = getObjectItems(field);
  state[field.key] = [...list, createObjectItem(field)];
}

function removeObjectItem(field: ObjectListFieldSchema, index: number) {
  const list = getObjectItems(field);
  const min = Math.max(1, field.minItems ?? 1);
  if (list.length <= min) return;
  state[field.key] = list.filter((_, currentIndex) => currentIndex !== index);
}

function getNestedStringItems(
  item: ObjectListItem,
  field: StringListFieldSchema
): StringListItem[] {
  const list = item[field.key] as StringListItem[] | undefined;
  return Array.isArray(list) ? list : [];
}

function addNestedStringItem(
  field: ObjectListFieldSchema,
  nestedField: StringListFieldSchema,
  index: number
) {
  const list = getObjectItems(field);
  const item = list[index];
  if (!item) return;
  const nested = getNestedStringItems(item, nestedField);
  item[nestedField.key] = [...nested, { __key: createKey(), value: '' }];
  state[field.key] = [...list];
}

function removeNestedStringItem(
  field: ObjectListFieldSchema,
  nestedField: StringListFieldSchema,
  index: number,
  nestedIndex: number
) {
  const list = getObjectItems(field);
  const item = list[index];
  if (!item) return;
  const nested = getNestedStringItems(item, nestedField);
  const min = Math.max(1, nestedField.minItems ?? 1);
  if (nested.length <= min) return;
  item[nestedField.key] = nested.filter((_, currentIndex) => currentIndex !== nestedIndex);
  state[field.key] = [...list];
}
</script>

<style scoped>
.md-stack > * + * {
  margin-top: 0;
}

.md-stack.md-stack-3 > * + * {
  margin-top: 1rem;
}

.md-stack.md-stack-4 > * + * {
  margin-top: 1.25rem;
}
</style>

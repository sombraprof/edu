<template>
  <Draggable
    v-bind="$attrs"
    v-model="modelProxy"
    :item-key="itemKey ?? '__uiKey'"
    handle=".grabbable"
    ghost-class="authoring-draggable-ghost"
    chosen-class="authoring-draggable-chosen"
    drag-class="authoring-draggable-drag"
    @end="handleEnd"
  >
    <template #item="slotProps">
      <slot name="item" v-bind="slotProps">
        <slot v-bind="slotProps" />
      </slot>
    </template>
  </Draggable>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Draggable from 'vuedraggable';
import type { LessonAuthoringBlock } from '@/composables/useAuthoringBlockKeys';

type DragEndEvent = {
  oldIndex?: number | null;
  newIndex?: number | null;
};

const props = defineProps<{
  modelValue: LessonAuthoringBlock[];
  itemKey?: string | ((element: LessonAuthoringBlock) => string | number);
}>();

const emit = defineEmits<{
  'update:modelValue': [LessonAuthoringBlock[]];
  end: [DragEndEvent];
}>();

const modelProxy = computed({
  get: () => props.modelValue,
  set: (value: LessonAuthoringBlock[]) => {
    emit('update:modelValue', value);
  },
});

function handleEnd(event: DragEndEvent) {
  emit('end', event);
}
</script>

<style scoped>
.authoring-draggable-ghost {
  opacity: 0.4;
}

.authoring-draggable-chosen,
.authoring-draggable-drag {
  cursor: grabbing;
}
</style>

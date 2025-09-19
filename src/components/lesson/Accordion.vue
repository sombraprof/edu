
<template>
  <div class="space-y-4 my-8">
    <div v-for="(item, index) in data.items" :key="index" class="card surface-tonal !p-0">
      <button 
        @click="toggle(index)" 
        class="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-[var(--md-sys-color-on-surface)]"
        :aria-expanded="openIndex === index"
      >
        <span>{{ item.title }}</span>
        <ChevronDown 
          class="h-6 w-6 transform transition-transform duration-300 text-[var(--md-sys-color-on-surface-variant)]"
          :class="{ 'rotate-180': openIndex === index }"
        />
      </button>
      <div 
        class="overflow-hidden transition-all duration-500 ease-in-out"
        :style="{ maxHeight: openIndex === index ? '1000px' : '0px' }"
      >
        <div class="prose-container p-4 border-t border-[var(--md-sys-color-outline)]">
          <div class="prose max-w-none lesson-content" v-html="item.content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionData {
  items: AccordionItem[];
}

defineProps<{
  data: AccordionData;
}>();

const openIndex = ref<number | null>(null);

function toggle(index: number) {
  if (openIndex.value === index) {
    openIndex.value = null; // Close if already open
  } else {
    openIndex.value = index; // Open the new one
  }
}
</script>

<style scoped>
.prose-container :deep(.prose) {
  color: var(--md-sys-color-on-surface);
}

.prose-container :deep(.prose) h4 {
  color: var(--md-sys-color-on-surface);
}

.prose-container :deep(.prose) strong {
  color: var(--md-sys-color-on-surface);
}

.prose-container :deep(.prose) ul > li::before {
    background-color: var(--md-sys-color-on-surface-variant);
}
</style>

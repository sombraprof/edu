<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--md-sys-spacing-4)',
      marginTop: 'var(--md-sys-spacing-8)',
      marginBottom: 'var(--md-sys-spacing-8)',
    }"
  >
    <div v-for="(item, index) in data.items" :key="index" class="card surface-tonal !p-0">
      <button
        @click="toggle(index)"
        class="w-full flex justify-between items-center p-4 text-left font-semibold md-sys-typescale-headline-small text-[var(--md-sys-color-on-surface)]"
        :aria-expanded="openIndex === index"
      >
        <span>{{ item.title }}</span>
        <ChevronDown
          :style="{
            height: 'var(--md-sys-icon-size-medium)',
            width: 'var(--md-sys-icon-size-medium)',
          }"
          class="transform transition-transform duration-300 text-[var(--md-sys-color-on-surface-variant)]"
          :class="{ 'rotate-180': openIndex === index }"
        />
      </button>
      <div
        class="overflow-hidden transition-all duration-500 ease-in-out"
        :style="{ maxHeight: openIndex === index ? '1000px' : '0px' }"
      >
        <div class="prose-container p-4 border-t border-[var(--md-sys-color-outline)]">
          <div v-if="hasRichContent(item)" class="prose max-w-none lesson-content space-y-3">
            <template v-for="(block, blockIndex) in richBlocks(item)" :key="blockIndex">
              <p v-if="block.type === 'paragraph'" v-html="sanitize(block.text)"></p>
              <ul
                v-else-if="block.type === 'list' && !block.ordered"
                class="list-disc list-inside space-y-1"
              >
                <li
                  v-for="(entry, entryIndex) in block.items"
                  :key="entryIndex"
                  v-html="sanitize(entry)"
                ></li>
              </ul>
              <ol
                v-else-if="block.type === 'list' && block.ordered"
                class="list-decimal list-inside space-y-1"
              >
                <li
                  v-for="(entry, entryIndex) in block.items"
                  :key="entryIndex"
                  v-html="sanitize(entry)"
                ></li>
              </ol>
            </template>
          </div>
          <div
            v-else
            class="prose max-w-none lesson-content"
            v-html="sanitizeContent(item.content)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

type RichParagraph = { type: 'paragraph'; text: string };
type RichList = { type: 'list'; ordered?: boolean; items: string[] };
type RichContentBlock = RichParagraph | RichList;

type AccordionContent = string | RichContentBlock[] | undefined;

interface AccordionItem {
  title: string;
  content?: AccordionContent;
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

function sanitizeContent(value: AccordionContent): string {
  if (Array.isArray(value)) {
    return '';
  }
  return sanitizeHtml(value ?? '');
}

function hasRichContent(item: AccordionItem): item is AccordionItem & {
  content: RichContentBlock[];
} {
  return Array.isArray(item.content) && item.content.length > 0;
}

function sanitize(value: string): string {
  return sanitizeHtml(value);
}

function richBlocks(item: AccordionItem): RichContentBlock[] {
  return Array.isArray(item.content) ? item.content : [];
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

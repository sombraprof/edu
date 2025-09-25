<template>
  <div class="memory-diagram">
    <p class="text-center font-semibold mb-2">{{ title }}</p>
    <div class="flex justify-center gap-1">
      <div
        v-for="(char, index) in characters"
        :key="index"
        class="border-2 p-2 w-8 h-8 flex items-center justify-center mono bg-white"
        :class="{ 'bg-red-100 text-red-600': char === '\\0' }"
      >
        {{ char === '\\0' ? '∅' : char }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  characters: string[];
}

defineProps<Props>();
</script>

<style scoped>
.memory-diagram {
  @apply bg-[var(--md-sys-color-surface-variant)] p-4 rounded-2xl mt-3;
}

.mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
</style>

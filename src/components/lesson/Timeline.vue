<template>
  <div class="card p-8 my-10">
    <h3 class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ data.title }}</h3>
    <p v-if="data.description" class="text-body-large mb-8 text-[var(--md-sys-color-on-surface-variant)]">{{ data.description }}</p>

    <div class="card surface-tonal p-8">
      <div class="relative border-l-2 border-[var(--md-sys-color-outline)] ml-5">
        <ol class="pl-10" :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-10)' }">
          <li v-for="(step, index) in data.steps" :key="index" class="relative">
            <div 
              class="absolute -left-[3.75rem] top-0 w-10 h-10 flex items-center justify-center font-bold md-sys-typescale-headline-small ring-8 ring-surface-tonal bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
              :style="{ borderRadius: 'var(--md-sys-border-radius-full)' }"
            >
              {{ index + 1 }}
            </div>
            <h4 class="font-bold md-sys-typescale-headline-small text-[var(--md-sys-color-primary)]">{{ step.title }}</h4>
            <p class="mt-1 text-body-medium text-[var(--md-sys-color-on-surface-variant)]" v-html="step.content"></p>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  title: string;
  content: string;
}

interface TimelineData {
  title: string;
  description?: string;
  steps: Step[];
}

defineProps<{
  data: TimelineData;
}>();
</script>

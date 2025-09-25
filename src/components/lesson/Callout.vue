
<template>
  <div class="card p-10 shadow-elevation-2" :class="variantClasses" :style="{ borderRadius: 'var(--md-sys-border-radius-large)' }">
    <div class="flex items-start gap-4">
      <div v-if="icon" :style="{ height: 'var(--md-sys-icon-size-medium)', width: 'var(--md-sys-icon-size-medium)' }" class="flex-shrink-0" :class="variantTextClasses">
        <component :is="icon" />
      </div>
      <div class="flex-grow">
        <h5 v-if="title" class="font-bold mb-1 md-sys-typescale-headline-small" :class="variantTextClasses">
          {{ title }}
        </h5>
        <div v-html="content" :class="['prose prose-sm max-w-none', variantTextClasses]"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Info, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  variant?: 'info' | 'academic' | 'good-practice' | 'warning' | 'error';
  title?: string;
  content: string;
}>(), {
  variant: 'info'
});

const icon = computed(() => {
  switch (props.variant) {
    case 'info':
      return Info;
    case 'good-practice':
      return CheckCircle2;
    case 'warning':
      return AlertTriangle;
    case 'academic':
      return BookOpen;
    default:
      return null;
  }
});

// Maps variants to MD3 system colors for a consistent look and feel
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'info':
      return `md-bg-primary-container md-border-primary`;
    case 'good-practice':
      return `md-bg-success-container md-border-success`;
    case 'warning':
      return `md-bg-warning-container md-border-warning`;
    case 'academic':
      return `md-bg-secondary-container md-border-secondary`;
    case 'error':
      return `md-bg-error-container md-border-error`;
    default:
      return `bg-surface-container border-outline`;
  }
});

const variantTextClasses = computed(() => {
  switch (props.variant) {
    case 'info':
      return 'md-text-primary';
    case 'good-practice':
      return 'md-text-success';
    case 'warning':
      return 'md-text-warning';
    case 'academic':
      return 'md-text-secondary';
    case 'error':
      return 'md-text-error';
    default:
      return 'md-text-on-surface';
  }
});

</script>

<style scoped>
.prose {
  color: inherit;
}
.prose :where(strong) {
  color: inherit;
  font-weight: 600;
}
.prose :where(a) {
  color: inherit;
  text-decoration: underline;
}
.prose :where(ul, li) {
  color: inherit;
}
.prose :where(h4) {
  color: inherit;
  font-weight: 600;
}
.prose :where(ul, li) {
  color: inherit;
}
.prose :where(ul > li)::marker {
  color: currentColor;
}
.prose :where(ol > li)::marker {
  color: currentColor;
}
</style>



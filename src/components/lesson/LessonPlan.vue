<template>
  <div class="card p-6 my-8">
    <h3 class="text-headline-small font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">{{ data.title }}</h3>

    <div v-if="data.unit" class="card surface-tonal p-6 mb-6">
      <h4 class="text-title-large font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">{{ data.unit.title }}</h4>
      <p class="text-body-large text-[var(--md-sys-color-on-surface-variant)]" v-html="data.unit.content"></p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="(card, index) in data.cards" :key="index" class="card p-6 flex flex-col items-center text-center">
        <component :is="getIconComponent(card.icon)" class="h-12 w-12 mb-4 text-[var(--md-sys-color-primary)]" />
        <h4 class="text-title-large font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">{{ card.title }}</h4>
        <p class="text-body-medium text-[var(--md-sys-color-on-surface-variant)]" v-html="card.content"></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Target,
  Settings,
  Monitor,
  CheckCircle,
  Users,
  BookOpen,
  Code,
  Database,
  Cpu
} from 'lucide-vue-next';

interface LessonPlanCard {
  icon: string;
  title: string;
  content: string;
}

interface LessonPlanUnit {
  title: string;
  content: string;
}

interface LessonPlanData {
  title: string;
  unit?: LessonPlanUnit;
  cards?: LessonPlanCard[];
}

defineProps<{
  data: LessonPlanData;
}>();

const getIconComponent = (iconName: string) => {
  // Map icon names to imported components
  const iconMap: Record<string, any> = {
    'bullseye': Target,
    'gears': Settings,
    'desktop': Monitor,
    'target': Target,
    'settings': Settings,
    'monitor': Monitor,
    'check-circle': CheckCircle,
    'users': Users,
    'book-open': BookOpen,
    'code': Code,
    'database': Database,
    'cpu': Cpu
  };

  return iconMap[iconName] || Target; // Default to Target if icon not found
};
</script>
